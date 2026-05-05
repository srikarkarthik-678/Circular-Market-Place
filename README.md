# ♻️ Ecoloop — Circular Economy Marketplace

> A full-stack web platform that facilitates buying, selling, repairing, and exchanging used electronics locally — built to promote the circular economy and reduce e-waste.

---

## 📌 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Team Contributions](#team-contributions)
- [Screenshots](#screenshots)

---

## 📖 Project Overview

**Ecoloop** is a circular economy marketplace designed to give electronics a second life. Instead of discarding old gadgets, users can list them for sale, find repair services, or discover local businesses that champion sustainable practices.

The platform targets the growing need for sustainable consumption by connecting buyers, sellers, and repair professionals in a single unified interface.

### Problem Statement
Electronic waste (e-waste) is one of the fastest-growing waste streams globally. Most functional electronics end up in landfills simply because owners don't have a convenient way to resell or repair them.

### Solution
Ecoloop provides a hyperlocal marketplace where:
- Individuals can **buy and sell** used electronics
- Users can **book repair services** from verified technicians
- Businesses committed to sustainability can be **discovered and highlighted**
- Admins can **moderate listings** to ensure quality and authenticity

---

## ✨ Features

### 🛒 Marketplace
- Browse preloved electronics across 7 categories: Mobile Phones, Laptops, TV & Audio, Kitchen Appliances, Washing Machines, Headphones & Earphones
- Real-time **search powered by OpenSearch** (Elasticsearch-compatible) with fuzzy matching across title, description, and category
- Category filter pills for quick browsing
- Product detail page with seller info, reviews, and Add to Cart
- **Sold items** are visually greyed out and non-clickable to prevent confusion

### 👤 User System
- Email/password signup and login
- Role-based access: **Admin** (university email domain) vs **Regular User**
- Persistent sessions via `localStorage`
- Sign out clears all session data

### 📦 Selling
- List products with title, price, phone, address, description, category, and image (uploaded via Cloudinary)
- **24-hour edit/delete window** — sellers can modify or remove listings only within 24 hours of posting
- Inline edit modal — no page redirect required
- Live image preview during upload

### 🔧 Repair Services
- Users can submit repair requests with device category, problem description, address, and optional image
- Requests are tracked with **Pending / Approved / Rejected** status badges
- Users can view all their repair requests with real-time status
- Admin dashboard to review, approve, or reject all incoming repair requests

### 🛒 Cart & Checkout
- Add to cart from product detail page
- Quantity controls (increment/decrement) per item
- Order summary with itemised total
- Checkout integrated with **Razorpay** payment gateway
- Payment verification via HMAC SHA-256 signature

### 👑 Admin Controls
- Admin badge visible in navbar
- On the Explore page, hover over any product card to reveal:
  - ✏️ Edit (inline modal)
  - 🗑 Delete
  - Toggle status: Available / Sold
- Repair Approvals dashboard with filter tabs (All / Pending / Approved / Rejected)

### 📱 Responsive Design
- Fully responsive across mobile, tablet, and desktop
- Mobile: hamburger drawer menu, collapsible search bar
- Dark theme throughout with emerald green accent system

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Cloudinary | Image upload and hosting |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| PostgreSQL | Primary relational database |
| OpenSearch | Full-text product search |
| Razorpay | Payment gateway |
| dotenv | Environment variable management |


---

## 📁 Project Structure

```
ecoloop/                          
│   ├── public/
│   │   └── icons/                   # SVG icons
│   ├── src/
│   │   ├── pages/                   # React Frontend
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
```

---

## 🏗 System Architecture

```
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
```

### Data Flow — Product Search
1. User types in search box (debounced 300ms)
2. Frontend calls `GET /search?q=<query>`
3. Backend queries OpenSearch with `multi_match` on title, description, category
4. Sold items excluded via `must_not` filter
5. Results returned and rendered in grid

### Data Flow — Selling a Product
1. User fills form → image uploaded to Cloudinary → secure URL returned
2. Frontend posts product data + image URL to `POST /sell`
3. Backend inserts into PostgreSQL
4. Same product indexed in OpenSearch for search
5. Product appears immediately on Explore page

---

## 🗄 Database Schema

### `products`
```sql
CREATE TABLE products (
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
```

### `usering`
```sql
CREATE TABLE usering (
  id        SERIAL PRIMARY KEY,
  email     VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  fullname  VARCHAR(255),
  username  VARCHAR(255) UNIQUE NOT NULL
);
```

### `repair_requests`
```sql
CREATE TABLE repair_requests (
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
```

---

## 🔌 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Fetch all products |
| POST | `/sell` | Create a new listing |
| PUT | `/product/:id` | Update a product |
| DELETE | `/product/:id` | Delete a product |
| PUT | `/product-status/:id` | Toggle sold/available status |
| PUT | `/purchase/:id` | Record a buyer |
| GET | `/my-products/:username` | Get seller's listings |
| GET | `/my-orders/:username` | Get buyer's orders |
| GET | `/sync-products` | Sync PostgreSQL → OpenSearch |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=<query>` | Full-text search via OpenSearch |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Authenticate user |

### Repair
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/repair-request` | Submit a repair request |
| GET | `/repair-requests/:username` | Get user's repair requests |
| GET | `/admin/repair-requests` | Get all repair requests (admin) |
| PUT | `/admin/repair-request/:id` | Approve or reject a request |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify payment signature |

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- OpenSearch 2.x (or Elasticsearch 8.x compatible)
- Cloudinary account
- Razorpay account

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ecoloop.git
cd ecoloop
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables))

```bash
node server.js
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. Database Setup
Run these SQL commands in your PostgreSQL database:

```sql
CREATE TABLE products (
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
       -- Impact stats (self-reported, shown on cards)
       items_diverted INT DEFAULT 0,
       co2_saved_kg INT DEFAULT 0,
       -- Workflow
       status VARCHAR(20) DEFAULT 'pending',    
       rejection_reason TEXT,
       submitted_by VARCHAR(120) NOT NULL,      
       created_at TIMESTAMP DEFAULT NOW(),
       approved_at TIMESTAMP
     );
     CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
     CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
```

### 5. Sync Existing Products to OpenSearch
After setup, visit:
```
GET http://localhost:5000/sync-products
```
This indexes all existing PostgreSQL products into OpenSearch.

And please type exact results (for example if product title is Iphone please search Iphone as exactly same to find ur item..These are case-sesitive too)

---

## 🔐 Environment Variables

Create a `.env` file in the server directory:

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/dbname

# OpenSearch / Elasticsearch
ELASTIC_URL=https://your-opensearch-endpoint:9200

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_SECRET=your_razorpay_secret

# (Optional) Port
PORT=5000
```

Create `src/utils/api.js` in the frontend:
```js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export default BASE_URL;
```

Add to frontend `.env`:
```env
VITE_API_URL=http://localhost:5000
```

---



## 👥 Team Contributions

| Member | Role | Responsibilities |
|--------|------|-----------------|
| **Srikar Karthik** (SE23UCSE104) |FrontLead | Backend Architecture 
| **Ruthvik Reddy** (SE23UCSE116) |Project Manager | Bussiness webpage and its backend
| **Chervith Nannuru** (SE23UCSE049) |Authentication page and its backend
| **Vikas Reddy** (SE23UCSE114) |Search & Filtering Optimization  
| **Sai Sasta** (SE23UCSE141) |Payment Gateway  
| **Siddardha** (SE23UCSE143) |Testing & Documentation 
| **Anirvesh Naidu** (SE23UCSE242) |Database Management 
| **Surya Reddy** (SE23UARI040) |Repair & Service Directory page 
---

## 🔑 Admin Access

Admin privileges are granted automatically to users who sign up with a **Mahindra University email** (`@mahindrauniversity.edu.in`).

Admin capabilities:
- Edit or delete any product listing (inline modal)
- Toggle product status between Available and Sold
- View and manage all repair service requests
- Approve or reject repair service provider registrations

---

## 💳 Payment Flow

1. User clicks **Proceed to Checkout** in Cart
2. Frontend calls `POST /api/payment/create-order` with total amount
3. Razorpay modal opens in browser
4. On payment, Razorpay returns `order_id`, `payment_id`, `signature`
5. Frontend calls `POST /api/payment/verify`
6. On success, buyer is recorded via `PUT /purchase/:id`

---

## 🔍 Search Architecture

Ecoloop uses **OpenSearch** (AWS-compatible Elasticsearch fork) for product search:

- **Index**: `products` — created on server startup if not exists
- **Fields indexed**: `title`, `description`, `category`
- **Query type**: `multi_match` — searches across all three fields simultaneously
- **Filter**: `must_not { term: { status: "sold" } }` — sold items excluded from search
- **Sync**: Products are indexed on create, updated on edit, removed on delete
- **Fallback**: ES errors are caught and logged but never crash the API route

---

## 🖼 Screenshots

<img width="1881" height="858" alt="image" src="https://github.com/user-attachments/assets/4313aa0f-9156-4047-a376-bfbd6a3d2d6c" />
<img width="1889" height="868" alt="image" src="https://github.com/user-attachments/assets/947dbd47-f644-4b6c-a026-995750b16c34" />
<img width="1883" height="768" alt="image" src="https://github.com/user-attachments/assets/20f38ecc-3e06-45a8-9b4b-9b98f9a73add" />
<img width="1894" height="839" alt="image" src="https://github.com/user-attachments/assets/6680ae88-39d9-4356-bd20-919edb0c2226" />
![Uploading image.png…]()



---

## 🌱 Circular Economy Alignment

Ecoloop directly supports all 3 pillars of the circular economy:

| Pillar | How Ecoloop Supports It |
|--------|------------------------|
| **Reduce** | Extends product lifespan, reducing need to buy new |
| **Reuse** | Marketplace connects sellers and buyers of used electronics |
| **Repair** | Integrated repair booking connects users with technicians |

---

## 📄 License

This project was built as part of an academic submission at **Mahindra University**.  
For educational purposes only.
