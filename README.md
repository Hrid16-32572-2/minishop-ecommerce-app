# MiniShop - Full-Stack E-commerce MVP

## Description
MiniShop is a lightweight, high-performance e-commerce platform with a decoupled frontend and a RESTful Node.js API.  
It includes a public storefront, product detail and cart flows, and an admin dashboard for inventory operations.

## Features
- JWT authentication for admin login.
- Inventory management (create/list/read/update stock/soft delete).
- Persistent cart via SessionStorage/localStorage for session continuity.
- Soft delete logic (`is_active`) so removed products are hidden without hard deletion.
- Structured API envelope responses for success/error consistency.

## Tech Stack
- Node.js
- Express
- PostgreSQL
- Vanilla JavaScript
- CSS3
- Jest + Supertest (API phase tests)

## Setup Instructions
### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgres://<username>:<password>@localhost:5432/minishop
JWT_SECRET=replace_with_a_secure_secret
```

### 3. Initialize PostgreSQL schema and seed data
Run the seed script from Node:

```bash
node -e "require('./server/db/seed').runSeed().then(()=>process.exit(0)).catch(()=>process.exit(1))"
```

### 4. Start the API server
```bash
npm start
```

### 5. Open frontend pages
- Storefront: `client/index.html`
- Product details: `client/product.html`
- Cart: `client/cart.html`
- Admin login: `client/admin-login.html`
- Admin dashboard: `client/admin-dashboard.html`

## API Documentation
Base URL: `http://localhost:3000/api/v1`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/products` | No | List active products |
| GET | `/products/:id` | No | Get one product by ID |
| POST | `/products` | Bearer token | Create product |
| PATCH | `/products/:id/stock` | Bearer token | Update stock quantity |
| DELETE | `/products/:id` | Bearer token | Soft delete product (`is_active=false`) |
| POST | `/auth/login` | No | Admin authentication (returns JWT) |
| POST | `/orders` | No | Create order from cart items and decrement stock |

## Project Structure
```text
Project for Abu/
  client/
    css/
      styles.css
    js/
      api.js
      app.js
      cart.js
      admin.js
    index.html
    product.html
    cart.html
    admin-login.html
    admin-dashboard.html
  server/
    controllers/
      auth.controller.js
      order.controller.js
      product.controller.js
    db/
      index.js
      schema.sql
      seed.js
    middleware/
      auth.middleware.js
    routes/
      auth.routes.js
      order.routes.js
      product.routes.js
    index.js
    server.js
  tests/
    phase1.test.js
    phase2.test.js
    phase3.test.js
    phase4.test.js
  package.json
```

## Test Commands
```bash
npm run test:phase1
npm run test:phase2
npm run test:phase3
npm run test:phase4
```
