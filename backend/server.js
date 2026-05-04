import express from "express";
import cors from "cors";
import pkg from "pg";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import { Client } from "@opensearch-project/opensearch";

dotenv.config();

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "&sslmode=verify-full",
  ssl: { rejectUnauthorized: false },
});

const esClient = new Client({
  node: process.env.ELASTIC_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ CREATE INDEX (RUN ONCE)
async function createIndex() {
  try {
    const { body: exists } = await esClient.indices.exists({ index: "products" });
    if (!exists) {
      await esClient.indices.create({
        index: "products",
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
          },
        },
      });
      console.log("✅ Fresh index created");
    } else {
      console.log("✅ Index already exists");
    }
  } catch (err) {
    console.error("❌ createIndex error:", err.message);
  }
}
createIndex();

// ✅ CHECK ELASTICSEARCH CONNECTION
async function checkES() {
  try {
    await esClient.info();
    console.log("✅ Elasticsearch connected");
  } catch (err) {
    console.error("❌ Elasticsearch error:", err.message);
  }
}
checkES();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ================= REPAIR REQUESTS =================

app.post("/repair-request", async (req, res) => {
  try {
    const { name, phone, address, category, problem, image, username } = req.body;

    const result = await pool.query(
      `INSERT INTO repair_requests(name, phone, address, category, problem, image, username, status)
       VALUES($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING *`,
      [name, phone, address, category, problem, image || "", username]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Repair insert error:", err);
    res.status(500).json({ error: "Failed to submit repair request" });
  }
});

app.get("/repair-requests/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query(
      "SELECT * FROM repair_requests WHERE username=$1 ORDER BY id DESC",
      [username]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Repair fetch error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.get("/admin/repair-requests", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM repair_requests ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Admin fetch error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.put("/admin/repair-request/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      "UPDATE repair_requests SET status=$1 WHERE id=$2",
      [status, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ================= CIRCULAR-ECONOMY BUSINESSES =================

async function initBusinessesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        tagline VARCHAR(200),
        description TEXT NOT NULL,
        category VARCHAR(40) NOT NULL,
        certification_tier VARCHAR(10),
        logo_url TEXT,
        cover_url TEXT,
        website TEXT,
        phone VARCHAR(20),
        email VARCHAR(120),
        city VARCHAR(80),
        address TEXT,
        founded_year INT,
        items_diverted INT DEFAULT 0,
        co2_saved_kg INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        rejection_reason TEXT,
        submitted_by VARCHAR(120) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        approved_at TIMESTAMP
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);`);
    console.log("✅ businesses table ready");
  } catch (err) {
    console.error("❌ initBusinessesTable error:", err.message);
  }
}
initBusinessesTable();

// Public list — only approved businesses, with optional filters
app.get("/businesses", async (req, res) => {
  try {
    const { category, tier, q } = req.query;
    const where = ["status = 'approved'"];
    const params = [];
    if (category && category !== "all") { params.push(category); where.push(`category = $${params.length}`); }
    if (tier && tier !== "all") { params.push(tier); where.push(`certification_tier = $${params.length}`); }
    if (q && q.trim()) {
      params.push(`%${q.trim().toLowerCase()}%`);
      where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(tagline) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`);
    }
    const sql = `SELECT * FROM businesses WHERE ${where.join(" AND ")} ORDER BY
      CASE certification_tier WHEN 'gold' THEN 1 WHEN 'silver' THEN 2 WHEN 'bronze' THEN 3 ELSE 4 END,
      approved_at DESC NULLS LAST, id DESC`;
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Businesses fetch error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// Aggregate stats (powers hero counters) — only approved businesses
app.get("/businesses/stats/summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS verified,
        COALESCE(SUM(items_diverted), 0)::int AS items_diverted,
        COALESCE(SUM(co2_saved_kg), 0)::int AS co2_saved,
        COUNT(DISTINCT NULLIF(LOWER(TRIM(city)), ''))::int AS cities,
        COUNT(*) FILTER (WHERE certification_tier = 'gold')::int AS gold,
        COUNT(*) FILTER (WHERE certification_tier = 'silver')::int AS silver,
        COUNT(*) FILTER (WHERE certification_tier = 'bronze')::int AS bronze
      FROM businesses WHERE status = 'approved'
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Business stats error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// Single business detail — only approved (admin uses /admin/businesses to see pending)
app.get("/businesses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM businesses WHERE id = $1 AND status = 'approved'",
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Business detail error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// Submit a new business (always saved as 'pending')
app.post("/businesses", async (req, res) => {
  try {
    const {
      name, tagline, description, category,
      logo_url, cover_url, website, phone, email,
      city, address, founded_year, items_diverted, co2_saved_kg,
      submitted_by,
    } = req.body;

    if (!name || !description || !category || !submitted_by) {
      return res.status(400).json({ error: "name, description, category, and submitted_by are required" });
    }

    const result = await pool.query(
      `INSERT INTO businesses
        (name, tagline, description, category, logo_url, cover_url, website, phone, email,
         city, address, founded_year, items_diverted, co2_saved_kg, submitted_by, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending')
       RETURNING *`,
      [
        name, tagline || null, description, category,
        logo_url || null, cover_url || null, website || null, phone || null, email || null,
        city || null, address || null, founded_year || null,
        Number(items_diverted) || 0, Number(co2_saved_kg) || 0,
        submitted_by,
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Business submit error:", err);
    res.status(500).json({ error: "Submission failed" });
  }
});

// Admin — list all businesses (optional ?status= filter)
app.get("/admin/businesses", async (req, res) => {
  try {
    const { status } = req.query;
    let sql = "SELECT * FROM businesses";
    const params = [];
    if (status && status !== "all") {
      params.push(status);
      sql += ` WHERE status = $1`;
    }
    sql += " ORDER BY created_at DESC, id DESC";
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Admin businesses fetch error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// Admin — approve or reject a business + assign certification tier
app.put("/admin/businesses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, certification_tier, rejection_reason } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    if (status === "approved" && !["bronze", "silver", "gold"].includes(certification_tier)) {
      return res.status(400).json({ error: "certification_tier (bronze/silver/gold) required when approving" });
    }

    await pool.query(
      `UPDATE businesses
         SET status = $1,
             certification_tier = $2,
             rejection_reason = $3,
             approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE approved_at END
       WHERE id = $4`,
      [
        status,
        status === "approved" ? certification_tier : null,
        status === "rejected" ? (rejection_reason || null) : null,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Admin business update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ================= PRODUCTS =================

app.post("/sell", async (req, res) => {
  try {
    const { title, price, phone, address, description, image, category, seller } = req.body;

    if (!title || !price || !phone || !address || !description || !image || !category) {
      return res.status(400).json({ error: "All fields required" });
    }

    const result = await pool.query(
      "INSERT INTO products(title,price,phone,address,description,image,category,seller) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [title, price, phone, address, description, image, category, seller]
    );

    const product = result.rows[0];

    // ✅ ES failure won't crash the route
    try {
      await esClient.index({
        index: "products",
        id: product.id.toString(),
        body: product,
      });
    } catch (esErr) {
      console.error("ES index error (non-fatal):", esErr.message);
    }

    res.json(product);
  } catch (err) {
    console.error("Sell error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ New - only saves buyer, admin controls sold status
app.put("/purchase/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { buyer } = req.body;

    await pool.query(
      "UPDATE products SET buyer=$1 WHERE id=$2",
      [buyer, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ error: "Purchase failed" });
  }
});

app.get("/my-products/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query(
      "SELECT * FROM products WHERE seller=$1 ORDER BY id DESC",
      [username]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("My products error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.get("/my-orders/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query(
      "SELECT * FROM products WHERE buyer=$1 ORDER BY id DESC",
      [username]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("My orders error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Products fetch error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.put("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, phone, address, description, image, category } = req.body;

    await pool.query(
      "UPDATE products SET title=$1, price=$2, phone=$3, address=$4, description=$5, image=$6, category=$7 WHERE id=$8",
      [title, price, phone, address, description, image, category, id]
    );

    // ✅ ES failure won't crash the route
    try {
      await esClient.index({
        index: "products",
        id: id.toString(),
        body: { id, title, price, phone, address, description, image, category },
      });
    } catch (esErr) {
      console.error("ES update error (non-fatal):", esErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM products WHERE id=$1", [id]);

    // ✅ ES failure won't crash the route
    try {
      await esClient.delete({
        index: "products",
        id: id.toString(),
      });
    } catch (esErr) {
      console.error("ES delete error (non-fatal):", esErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.put("/product-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      "UPDATE products SET status=$1 WHERE id=$2",
      [status, id]
    );

    const updated = await pool.query(
      "SELECT * FROM products WHERE id=$1",
      [id]
    );

    const product = updated.rows[0];

    // ✅ ES failure won't crash the route
    try {
      await esClient.index({
        index: "products",
        id: id.toString(),
        body: product,
      });
    } catch (esErr) {
      console.error("ES status update error (non-fatal):", esErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Product status error:", err);
    res.status(500).json({ error: "Status update failed" });
  }
});

// ================= SEARCH =================

app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) return res.json([]);

    const result = await esClient.search({
      index: "products",
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: q,
                  fields: ["title", "description", "category"],
                },
              },
            ],
            must_not: [{ term: { status: "sold" } }],
          },
        },
      },
    });

    const hits = result.body?.hits?.hits || [];
    res.json(hits.map((hit) => hit._source));
  } catch (err) {
    console.error("Search error:", err.message);
    res.json([]);
  }
});

app.get("/sync-products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");

    for (const product of result.rows) {
      try {
        await esClient.index({
          index: "products",
          id: product.id.toString(),
          body: product,
        });
      } catch (esErr) {
        console.error(`ES sync error for product ${product.id}:`, esErr.message);
      }
    }

    res.json({ success: true, message: "Data synced to Elasticsearch" });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

// ================= AUTH =================

app.post("/signup", async (req, res) => {
  try {
    const { email, password, fullname, username } = req.body;

    const existing = await pool.query(
      "SELECT * FROM usering WHERE email=$1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    const result = await pool.query(
      "INSERT INTO usering(email,password,fullname,username) VALUES($1,$2,$3,$4) RETURNING *",
      [email, password, fullname, username]
    );

    const isAdmin = email.endsWith("@mahindrauniversity.edu.in");

    res.json({
      success: true,
      username: result.rows[0].username,
      isAdmin,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM usering WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (result.rows.length > 0) {
      const isAdmin = email.endsWith("@mahindrauniversity.edu.in");
      res.json({
        success: true,
        username: result.rows[0].username,
        isAdmin,
      });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ================= PAYMENT =================

app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error("Payment order error:", err);
    res.status(500).json({ error: "Payment order failed" });
  }
});

app.post("/api/payment/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    res.json({ success: expected === razorpay_signature });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));
export default app;