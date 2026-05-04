# ♻️ Ecoloop — Circular Economy Marketplace

<p align="center">
  <img src="https://img.shields.io/badge/Build-FullStack-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tech-React%20%7C%20Node%20%7C%20Postgres-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Search-OpenSearch-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Payments-Razorpay-purple?style=for-the-badge" />
</p>

<p align="center">
✨ A full-stack web platform that facilitates buying, selling, repairing, and exchanging used electronics locally — built to promote the circular economy and reduce e-waste.
</p>

---

## 📌 Table of Contents

- Project Overview  
- Features  
- Tech Stack  
- System Architecture  
- Database Schema  
- API Endpoints  
- Installation & Setup  
- Environment Variables  
- Project Structure  
- Team Contributions  
- Screenshots  

---

## 📖 Project Overview

> 🌱 **Ecoloop is a circular economy marketplace designed to give electronics a second life.**

Instead of discarding old gadgets, users can list them for sale, find repair services, or discover local businesses that champion sustainable practices.  

The platform targets the growing need for sustainable consumption by connecting buyers, sellers, and repair professionals in a single unified interface.

---

### 🚨 Problem Statement

Electronic waste (e-waste) is one of the fastest-growing waste streams globally. Most functional electronics end up in landfills simply because owners don't have a convenient way to resell or repair them.

---

### ✅ Solution

Ecoloop provides a hyperlocal marketplace where:

- Individuals can buy and sell used electronics  
- Users can book repair services from verified technicians  
- Businesses committed to sustainability can be discovered and highlighted  
- Admins can moderate listings to ensure quality and authenticity  

---

## ✨ Features

### 🛒 Marketplace
- Browse preloved electronics across 7 categories: Mobile Phones, Laptops, TV & Audio, Kitchen Appliances, Washing Machines, Headphones & Earphones  
- Real-time search powered by OpenSearch (Elasticsearch-compatible) with fuzzy matching across title, description, and category  
- Category filter pills for quick browsing  
- Product detail page with seller info, reviews, and Add to Cart  
- Sold items are visually greyed out and non-clickable to prevent confusion  

---

### 👤 User System
- Email/password signup and login  
- Role-based access: Admin (university email domain) vs Regular User  
- Persistent sessions via localStorage  
- Sign out clears all session data  

---

### 📦 Selling
- List products with title, price, phone, address, description, category, and image (uploaded via Cloudinary)  
- 24-hour edit/delete window — sellers can modify or remove listings only within 24 hours of posting  
- Inline edit modal — no page redirect required  
- Live image preview during upload  

---

### 🔧 Repair Services
- Users can submit repair requests with device category, problem description, address, and optional image  
- Requests are tracked with Pending / Approved / Rejected status badges  
- Users can view all their repair requests with real-time status  
- Admin dashboard to review, approve, or reject all incoming repair requests  

---

### 🛒 Cart & Checkout
- Add to cart from product detail page  
- Quantity controls (increment/decrement) per item  
- Order summary with itemised total  
- Checkout integrated with Razorpay payment gateway  
- Payment verification via HMAC SHA-256 signature  

---

### 👑 Admin Controls
- Admin badge visible in navbar  
- On the Explore page, hover over any product card to reveal:

  ✏️ Edit (inline modal)  
  🗑 Delete  
  Toggle status: Available / Sold  

- Repair Approvals dashboard with filter tabs (All / Pending / Approved / Rejected)

---

### 📱 Responsive Design
- Fully responsive across mobile, tablet, and desktop  
- Mobile: hamburger drawer menu, collapsible search bar  
- Dark theme throughout with emerald green accent system  

---

## 🛠 Tech Stack

### 🎨 Frontend
- React 18  
- React Router v6  
- Tailwind CSS  
- Cloudinary  

### ⚙️ Backend
- Node.js + Express  
- PostgreSQL  
- OpenSearch  
- Razorpay  
- dotenv  

### ☁️ Infrastructure
- Render / Railway  
- Neon / Supabase  
- OpenSearch Service  
- Cloudinary  

---

## 🏗 System Architecture

```txt
┌─────────────────────────────────────────────┐
│                  React Frontend              │
│  Explore │ ProductDetails │ Cart │ Repair    │
│  Login   │ MySellItems    │ Orders │ Admin   │
└────────────────────┬────────────────────────┘
                     │ HTTP (REST API)
                     ▼
┌─────────────────────────────────────────────┐
│              Express.js Backend             │
│  /products   /sell   /search   /repair      │
│  /auth       /cart   /payment  /admin       │
└────────┬──────────────────┬─────────────────┘
         │                  │
         ▼                  ▼
┌─────────────┐    ┌─────────────────┐
│  PostgreSQL │    │   OpenSearch    │
└─────────────┘    └─────────────────┘

---

## 🔌 API Endpoints

```md
## 🔌 API Endpoints

<p align="center">
  <img src="https://img.shields.io/badge/API-REST-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Format-JSON-orange?style=for-the-badge" />
</p>

---

Products
MethodEndpointDescriptionGET/productsFetch all productsPOST/sellCreate a new listingPUT/product/:idUpdate a productDELETE/product/:idDelete a productPUT/product-status/:idToggle sold/available statusPUT/purchase/:idRecord a buyerGET/my-products/:usernameGet seller's listingsGET/my-orders/:usernameGet buyer's ordersGET/sync-productsSync PostgreSQL → OpenSearch

---

Search
MethodEndpointDescriptionGET/search?q=<query>Full-text search via OpenSearch

---

Auth
MethodEndpointDescriptionPOST/signupRegister new userPOST/loginAuthenticate user

---

Repair
MethodEndpointDescriptionPOST/repair-requestSubmit a repair requestGET/repair-requests/:usernameGet user's repair requestsGET/admin/repair-requestsGet all repair requests (admin)PUT/admin/repair-request/:idApprove or reject a request

---

Payment
MethodEndpointDescriptionPOST/api/payment/create-orderCreate Razorpay orderPOST/api/payment/verifyVerify payment signature


