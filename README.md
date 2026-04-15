# ShopFlow

A full-stack commerce demo focused on authenticated order processing, transactional stock updates, and state-based lifecycle rules.

## Live Demo

- **API:** https://typescript-orders-production.up.railway.app
- **Frontend:** https://shopflow-opal.vercel.app

## Demo Account

- Email: `demo@shopflow.dev`
- Password: `demo1234`

---

## What This Project Demonstrates

ShopFlow highlights backend constraints that typical storefront demos rarely make visible:

- **Transactional stock updates** — order placement and cancellation both modify inventory inside database transactions, preventing partial state changes
- **Enforced order lifecycle** — status transitions follow strict server-side rules; invalid transitions are rejected by service-layer validation before any status update is written
- **User-scoped access** — every order mutation is authenticated and ownership-verified before execution

---

## Core Features

What you can do in the demo:

- View current stock levels on the product listing, including low-stock and out-of-stock indicators
- Place orders through authenticated APIs with inventory updates reflected in the UI
- Cancel eligible orders and observe stock restored immediately
- Inspect seeded orders across multiple lifecycle states: `PLACED`, `CONFIRMED`, `DELIVERED`, `CANCELLED`

---

## Core Workflow

1. A user authenticates and receives a JWT
2. The user browses products and inspects current stock levels
3. Order creation validates requested quantities against available stock
4. The backend executes a single transaction that decrements stock and creates the order plus order items atomically
5. The order is stored in `PLACED` status
6. Eligible orders (`PLACED` or `CONFIRMED`) may be cancelled by the owning user
7. Cancellation runs in a second transaction that restores stock and updates the order to `CANCELLED`

---

## Architecture Overview

ShopFlow uses a layered full-stack architecture:

- **Frontend (React + TypeScript):** renders product and order views, manages auth state via Zustand, and surfaces backend state changes such as current stock levels and order status
- **API Layer (Express + TypeScript):** exposes REST endpoints for auth, products, and orders
- **Service Layer:** centralizes business rules for stock validation, atomic order creation, cancellation rollback, and lifecycle transition checks — so that these constraints are enforced independently of the UI layer
- **Database Layer (PostgreSQL + Prisma ORM):** stores users, products, orders, and order items with relational integrity

---

## Data Model

| Model | Key fields |
|---|---|
| User | id, email, passwordHash |
| Product | id, name, price, stock |
| Order | id, userId, status, createdAt, updatedAt, cancelledAt |
| OrderItem | id, orderId, productId, quantity, priceAtPurchase |

`OrderStatus` enum: `PLACED` · `CONFIRMED` · `SHIPPED` · `DELIVERED` · `CANCELLED`

> Inventory is modeled as mutable stock on `Product`, while `OrderItem` stores immutable purchase-time data such as quantity and `priceAtPurchase` for historical accuracy.

---

## API Overview

### Core workflow endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /orders | ✓ | Create order — verifies and decrements stock in a single transaction |
| POST | /orders/:id/cancel | ✓ | Cancel order — restores stock transactionally; allowed only from `PLACED` or `CONFIRMED` |
| GET | /orders/me | ✓ | Fetch authenticated user's orders with items and product details |

### Supporting endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/register | ✗ | Create account with hashed password |
| POST | /auth/login | ✗ | Authenticate and receive a 1-hour JWT for protected order actions |
| GET | /products | ✗ | List all products with current stock levels |

> Order lifecycle transitions are enforced server-side via a validated state machine modeled in the service layer.

---

## Repository Structure

- `client/` — React frontend (Vite)
- `src/modules/auth/` — register, login, JWT issuance
- `src/modules/product/` — product listing and stock retrieval
- `src/modules/order/` — order creation, cancellation, and lifecycle logic
- `src/middlewares/` — JWT verification
- `src/config/` — Prisma client setup
- `prisma/schema.prisma` — data models and `OrderStatus` enum
- `prisma/migrations/` — migration history
- `prisma/seed.ts` — demo products, demo account, and seeded orders

---

## Demo Walkthrough

1. Log in with the demo account
2. Open **Products** and inspect current stock levels, including low-stock and out-of-stock items
3. Place a new order for an in-stock item
4. Open **Orders** and verify that the new order appears in `PLACED`
5. Cancel the newly created order and confirm its status changes to `CANCELLED`
6. Return to **Products** and verify that stock has been restored
7. Optionally review the seeded orders to inspect examples of `CONFIRMED`, `DELIVERED`, and already `CANCELLED` states
8. Try ordering more than available stock and observe the request being rejected

---

## Local Setup

**Prerequisites:** Node.js 20+, Docker

> The backend lives in the repository root, while the frontend lives under `client/`.

```bash
# 1. Clone and install dependencies
git clone https://github.com/sbaek21/typescript-orders
cd typescript-orders
npm install

# 2. Start PostgreSQL
docker-compose up -d

# 3. Run migrations and seed demo data
npx prisma migrate deploy
npx prisma db seed

# 4. Start backend (port 3000)
npm run dev

# 5. Start frontend (port 5173) — open a new terminal
cd client
npm install
npm run dev
```

**Environment variables** — create a `.env` file in the project root:

```env
PORT=3000
JWT_SECRET=your-secret-here
DATABASE_URL=postgresql://app:app_pw@localhost:5432/app_db
```

---

## Deployment

- Frontend: Vercel
- Backend + PostgreSQL: Railway

**Live API base URL:** https://typescript-orders-production.up.railway.app

**Live Frontend URL:** https://shopflow-opal.vercel.app