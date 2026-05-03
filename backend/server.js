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