# ShopEasy – E-Commerce Web Application (MERN)

Week 4 capstone: a full-stack e-commerce app with product listing, authentication, cart, order management and an admin dashboard.

**Live demo:** _add your Vercel URL here_  ·  **API:** _add your Render URL here_

## Features
- **Shop:** product listing with search, category filter and price sorting; product detail page
- **Auth:** register / login with JWT and bcrypt-hashed passwords; protected routes
- **Cart:** add, change quantity, remove; persisted in localStorage
- **Checkout & orders:** address validation, Cash on Delivery, order history
- **Admin dashboard (role-based):** stats overview, product CRUD, order status management (placed → shipped → delivered / cancelled)
- **Safety details:** prices are recalculated on the server, stock is decremented atomically (no overselling), stock is restored when an order is cancelled, admin routes are guarded by role on both client and server

**Stack:** React (Vite), React Router, Context API, Axios · Node, Express · MongoDB (Mongoose) · JWT

## Run locally
Requires Node 18+ and MongoDB (local or Atlas).

```bash
# Backend
cd server
npm install
# check .env (MONGO_URI, JWT_SECRET)
npm run seed        # creates admin + 12 sample products
npm run dev         # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev         # http://localhost:5173
```

**Demo admin login:** `admin@shop.com` / `Admin@123` (change via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env` before seeding a real deployment).

## Tests
```bash
cd server && npm test
```
Unit tests cover order-total calculation and address validation (Node's built-in test runner, no extra dependencies).

## API
| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public | Auth |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/products?search=&category=&sort=` | public | List products |
| GET | `/api/products/categories`, `/api/products/:id` | public | Categories / detail |
| POST/PUT/DELETE | `/api/products[/:id]` | admin | Manage products |
| POST | `/api/orders` | user | Place order |
| GET | `/api/orders/mine` | user | My orders |
| GET | `/api/orders/all`, `/api/orders/stats` | admin | All orders / dashboard stats |
| PUT | `/api/orders/:id/status` | admin | Update status |

## Deployment

### 1. MongoDB Atlas (database)
1. Create a free M0 cluster → **Database Access**: add a user with a password.
2. **Network Access**: add `0.0.0.0/0` (allows Render to connect).
3. **Connect → Drivers**: copy the connection string and put your DB name in it, e.g. `mongodb+srv://USER:PASS@cluster.mongodb.net/ecommerce`.
4. Seed it once from your computer: set that string as `MONGO_URI` in `server/.env`, then run `npm run seed`.

### 2. Render (backend)
1. Push this repo to GitHub → Render → **New → Blueprint** (uses `render.yaml`), or **New → Web Service** with root directory `server`, build `npm install`, start `npm start`.
2. Environment variables: `MONGO_URI` (Atlas string), `JWT_SECRET` (long random string), `CLIENT_URL` (your Vercel URL – add after step 3).
3. Check `https://YOUR-API.onrender.com/api/health` returns `{"ok":true}`. (Free tier sleeps when idle; the first request can take ~50 s.)

### 3. Vercel (frontend)
1. Vercel → **Add New Project** → import the repo → set **Root Directory** to `client` (Vite is auto-detected).
2. Environment variable: `VITE_API_URL` = your Render URL (no trailing slash).
3. Deploy, then copy the Vercel URL into Render's `CLIENT_URL` (comma-separate if you have several) and redeploy the API.

`client/vercel.json` and `client/public/_redirects` make page refreshes work on Vercel and Netlify.

## Project structure
```
server/  config · models · middleware · routes · utils · tests · seed.js
client/  src/{context,components,pages}
render.yaml
```
