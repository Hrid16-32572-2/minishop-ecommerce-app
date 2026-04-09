# 🏛️ SYSTEM SPECIFICATION: MINISHOP v8.0

## 1. Strict API Contract & HTTP Codes
* **Prefix:** All routes MUST start with `/api/v1`.
* **The Global Envelope:** ALL routes must return exactly: `{ "success": boolean, "data": object|null, "error": string|null }`. No exceptions.
* **Headers:** `Content-Type: application/json`
* **Status Code Mapping:**
  * `200 OK`: Successful reads/updates.
  * `201 Created`: Successful POST (Orders, Products).
  * `400 Bad Request`: `INVALID_INPUT`, `INSUFFICIENT_STOCK`.
  * `401 Unauthorized`: Missing, bad, or expired JWT.
  * `404 Not Found`: Resource ID does not exist.
  * `500 Internal Server Error`: Unhandled backend crashes.

## 2. Directory Structure (Strict Whitelist)
/
├── package.json
├── .env
├── server/
│   ├── server.js               # Exports Express app (does NOT call app.listen)
│   ├── index.js                # Imports app from server.js and calls app.listen(3000)
│   ├── db/
│   │   ├── index.js            # pg pool
│   │   ├── schema.sql          # Idempotent DDL
│   │   └── seed.js             # Seed logic
│   ├── routes/
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   └── auth.routes.js
│   ├── controllers/
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   └── auth.controller.js
│   └── middleware/
│       └── auth.middleware.js
├── tests/                      # Populated from 03-TEST-SUITE.md
└── client/
    ├── index.html
    ├── product.html
    ├── cart.html
    ├── admin-login.html
    ├── admin-dashboard.html
    ├── css/
    │   └── styles.css
    └── js/
        ├── api.js
        ├── app.js
        ├── cart.js
        └── admin.js

## 3. Database Idempotency & Schema
* **Rule:** Your `schema.sql` MUST use `CREATE TABLE IF NOT EXISTS`.
* **Rule:** Your `seed.js` MUST be both executable directly from Node (`node server/db/seed.js`) AND importable as an async `runSeed()` function by the Jest tests. It must truncate tables CASCADE before inserting.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) CHECK (price > 0),
    stock_quantity INT CHECK (stock_quantity >= 0),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    product_id INT REFERENCES products(id),
    quantity INT CHECK (quantity > 0),
    price_at_purchase DECIMAL(10,2) NOT NULL
);
