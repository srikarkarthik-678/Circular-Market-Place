♻️ Ecoloop — Circular Economy Marketplace

A full-stack web platform that facilitates buying, selling, repairing, and exchanging used electronics locally — built to promote the circular economy and reduce e-waste.


📌 Table of Contents

Project Overview
Features
Tech Stack
System Architecture
Database Schema
API Endpoints
Installation & Setup
Environment Variables
Project Structure
Team Contributions
Screenshots


📖 Project Overview
Ecoloop is a circular economy marketplace designed to give electronics a second life. Instead of discarding old gadgets, users can list them for sale, find repair services, or discover local businesses that champion sustainable practices.
The platform targets the growing need for sustainable consumption by connecting buyers, sellers, and repair professionals in a single unified interface.
Problem Statement
Electronic waste (e-waste) is one of the fastest-growing waste streams globally. Most functional electronics end up in landfills simply because owners don't have a convenient way to resell or repair them.
Solution
Ecoloop provides a hyperlocal marketplace where:

Individuals can buy and sell used electronics
Users can book repair services from verified technicians
Businesses committed to sustainability can be discovered and highlighted
Admins can moderate listings to ensure quality and authenticity


✨ Features
🛒 Marketplace

Browse preloved electronics across 7 categories: Mobile Phones, Laptops, TV & Audio, Kitchen Appliances, Washing Machines, Headphones & Earphones
Real-time search powered by OpenSearch (Elasticsearch-compatible) with fuzzy matching across title, description, and category
Category filter pills for quick browsing
Product detail page with seller info, reviews, and Add to Cart
Sold items are visually greyed out and non-clickable to prevent confusion

👤 User System

Email/password signup and login
Role-based access: Admin (university email domain) vs Regular User
Persistent sessions via localStorage
Sign out clears all session data

📦 Selling

List products with title, price, phone, address, description, category, and image (uploaded via Cloudinary)
24-hour edit/delete window — sellers can modify or remove listings only within 24 hours of posting
Inline edit modal — no page redirect required
Live image preview during upload

🔧 Repair Services

Users can submit repair requests with device category, problem description, address, and optional image
Requests are tracked with Pending / Approved / Rejected status badges
Users can view all their repair requests with real-time status
Admin dashboard to review, approve, or reject all incoming repair requests

🛒 Cart & Checkout

Add to cart from product detail page
Quantity controls (increment/decrement) per item
Order summary with itemised total
Checkout integrated with Razorpay payment gateway
Payment verification via HMAC SHA-256 signature

👑 Admin Controls

Admin badge visible in navbar
On the Explore page, hover over any product card to reveal:

✏️ Edit (inline modal)
🗑 Delete
Toggle status: Available / Sold


Repair Approvals dashboard with filter tabs (All / Pending / Approved / Rejected)

📱 Responsive Design

Fully responsive across mobile, tablet, and desktop
Mobile: hamburger drawer menu, collapsible search bar
Dark theme throughout with emerald green accent system


🛠 Tech Stack
Frontend
TechnologyPurposeReact 18UI frameworkReact Router v6Client-side routingTailwind CSSUtility-first stylingCloudinaryImage upload and hosting
Backend
TechnologyPurposeNode.js + ExpressREST API serverPostgreSQLPrimary relational databaseOpenSearchFull-text product searchRazorpayPayment gatewaydotenvEnvironment variable management
Infrastructure
ServicePurposeRender / RailwayBackend hostingNeon / SupabaseManaged PostgreSQLOpenSearch ServiceSearch engineCloudinaryMedia storage

🏗 System Architecture
┌─────────────────────────────────────────────┐
│                  React Frontend              │
│  Explore │ ProductDetails │ Cart │ Repair    │
│  Login   │ MySellItems    │ Orders │ Admin   │
└────────────────────┬────────────────────────┘
                     │ HTTP (REST API)
                     ▼
┌─────────────────────────────────────────────┐
│              Express.js Backend             │
│                                             │
│  /products   /sell   /search   /repair      │
│  /auth       /cart   /payment  /admin       │
└────────┬──────────────────┬─────────────────┘
         │                  │
         ▼                  ▼
┌─────────────┐    ┌─────────────────┐
│  PostgreSQL │    │   OpenSearch    │
│  (Primary   │    │  (Search Index) │
│   Storage)  │    │                 │
└─────────────┘    └─────────────────┘
Data Flow — Product Search

User types in search box (debounced 300ms)
Frontend calls GET /search?q=<query>
Backend queries OpenSearch with multi_match on title, description, category
Sold items excluded via must_not filter
Results returned and rendered in grid

Data Flow — Selling a Product

User fills form → image uploaded to Cloudinary → secure URL returned
Frontend posts product data + image URL to POST /sell
Backend inserts into PostgreSQL
Same product indexed in OpenSearch for search
Product appears immediately on Explore page


🗄 Database Schema
products
sqlCREATE TABLE products (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  price        INTEGER NOT NULL,
  phone        VARCHAR(20) NOT NULL,
  address      TEXT NOT NULL,
  description  TEXT NOT NULL,
  image        TEXT NOT NULL,
  category     VARCHAR(100) NOT NULL,
  seller       VARCHAR(255),
  buyer        VARCHAR(255),
  status       VARCHAR(50) DEFAULT 'active',
  created_at   TIMESTAMP DEFAULT NOW()
);
usering
sqlCREATE TABLE usering (
  id        SERIAL PRIMARY KEY,
  email     VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  fullname  VARCHAR(255),
  username  VARCHAR(255) UNIQUE NOT NULL
);
repair_requests
sqlCREATE TABLE repair_requests (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(20) NOT NULL,
  address    TEXT NOT NULL,
  category   VARCHAR(100) NOT NULL,
  problem    TEXT NOT NULL,
  image      TEXT DEFAULT '',
  username   VARCHAR(255) NOT NULL,
  status     VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

🔌 API Endpoints
Products
MethodEndpointDescriptionGET/productsFetch all productsPOST/sellCreate a new listingPUT/product/:idUpdate a productDELETE/product/:idDelete a productPUT/product-status/:idToggle sold/available statusPUT/purchase/:idRecord a buyerGET/my-products/:usernameGet seller's listingsGET/my-orders/:usernameGet buyer's ordersGET/sync-productsSync PostgreSQL → OpenSearch
Search
MethodEndpointDescriptionGET/search?q=<query>Full-text search via OpenSearch
Auth
MethodEndpointDescriptionPOST/signupRegister new userPOST/loginAuthenticate user
Repair
MethodEndpointDescriptionPOST/repair-requestSubmit a repair requestGET/repair-requests/:usernameGet user's repair requestsGET/admin/repair-requestsGet all repair requests (admin)PUT/admin/repair-request/:idApprove or reject a request
Payment
MethodEndpointDescriptionPOST/api/payment/create-orderCreate Razorpay orderPOST/api/payment/verifyVerify payment signature

⚙️ Installation & Setup
Prerequisites

Node.js v18+
PostgreSQL 14+
OpenSearch 2.x (or Elasticsearch 8.x compatible)
Cloudinary account
Razorpay account

1. Clone the Repository
bashgit clone https://github.com/your-username/ecoloop.git
cd ecoloop
2. Backend Setup
bashcd server
npm install
Create a .env file (see Environment Variables)
bashnode server.js
# Server runs on http://localhost:5000
3. Frontend Setup
bashcd client
npm install
npm run dev
# App runs on http://localhost:5173
4. Database Setup
Run these SQL commands in your PostgreSQL database:
sqlCREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  seller VARCHAR(255),
  buyer VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usering (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255),
  username VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE repair_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  problem TEXT NOT NULL,
  image TEXT DEFAULT '',
  username VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
5. Sync Existing Products to OpenSearch
After setup, visit:
GET http://localhost:5000/sync-products
This indexes all existing PostgreSQL products into OpenSearch.

🔐 Environment Variables
Create a .env file in the server directory:
env# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/dbname

# OpenSearch / Elasticsearch
ELASTIC_URL=https://your-opensearch-endpoint:9200

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_SECRET=your_razorpay_secret

# (Optional) Port
PORT=5000
Create src/utils/api.js in the frontend:
jsconst BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export default BASE_URL;
Add to frontend .env:
envVITE_API_URL=http://localhost:5000

📁 Project Structure
ecoloop/
├── client/                          # React Frontend
│   ├── public/
│   │   └── icons/                   # SVG icons
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Explore.jsx          # Main marketplace page
│   │   │   ├── ProductDetails.jsx   # Single product view
│   │   │   ├── Sell.jsx             # List a product
│   │   │   ├── Cart.jsx             # Shopping cart
│   │   │   ├── Login.jsx            # Auth page
│   │   │   ├── MySellItems.jsx      # Seller's listings
│   │   │   ├── MyOrders.jsx         # Buyer's orders
│   │   │   ├── Repair.jsx           # Book repair service
│   │   │   ├── RepairRequests.jsx   # User's repair requests
│   │   │   └── AdminRepairApprovals.jsx  # Admin dashboard
│   │   ├── utils/
│   │   │   ├── api.js               # BASE_URL config
│   │   │   └── cart.js              # Cart utility functions
│   │   ├── App.jsx                  # Routes
│   │   └── main.jsx                 # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
└── server/
    ├── server.js                    # Express app + all routes
    ├── package.json
    └── .env                         # Environment variables

👥 Team Contributions
MemberRoleResponsibilitiesKarthik (SE23UCSE104)Full Stack DeveloperCore MATLAB implementation (research module), complete frontend UI (React + Tailwind), backend API (Express + PostgreSQL), OpenSearch integration, debugging, model training & baseline evaluations(Member 2)(Role)(Add contribution)(Member 3)(Role)(Add contribution)

🔑 Admin Access
Admin privileges are granted automatically to users who sign up with a Mahindra University email (@mahindrauniversity.edu.in).
Admin capabilities:

Edit or delete any product listing (inline modal)
Toggle product status between Available and Sold
View and manage all repair service requests
Approve or reject repair service provider registrations


💳 Payment Flow

User clicks Proceed to Checkout in Cart
Frontend calls POST /api/payment/create-order with total amount
Razorpay modal opens in browser
On payment, Razorpay returns order_id, payment_id, signature
Frontend calls POST /api/payment/verify
Backend verifies HMAC SHA-256 signature
On success, buyer is recorded via PUT /purchase/:id


🔍 Search Architecture
Ecoloop uses OpenSearch (AWS-compatible Elasticsearch fork) for product search:

Index: products — created on server startup if not exists
Fields indexed: title, description, category
Query type: multi_match — searches across all three fields simultaneously
Filter: must_not { term: { status: "sold" } } — sold items excluded from search
Sync: Products are indexed on create, updated on edit, removed on delete
Fallback: ES errors are caught and logged but never crash the API route


🖼 Screenshots
PageDescriptionExploreMain marketplace with hero banner, category filters, product gridProduct DetailFull product view with seller info and Add to CartSellForm to list a new product with Cloudinary image uploadCartShopping cart with quantity controls and Razorpay checkoutRepairBook a repair service formMy ListingsSeller dashboard with 24-hour edit/delete windowAdminHover-to-manage product cards + Repair Approvals dashboard

🌱 Circular Economy Alignment
Ecoloop directly supports all 3 pillars of the circular economy:
PillarHow Ecoloop Supports ItReduceExtends product lifespan, reducing need to buy newReuseMarketplace connects sellers and buyers of used electronicsRepairIntegrated repair booking connects users with technicians

📄 License
This project was built as part of an academic submission at Mahindra University.
For educational purposes only.
