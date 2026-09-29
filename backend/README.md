# Smart Restaurant — Backend (API Server)

Plain **JavaScript** (Node.js + Express + Mongoose) REST API for the Smart
Restaurant ordering system — no TypeScript, no build step. Runs standalone
on its own port; the frontend (separate project) talks to it over HTTP.

## Structure
```
backend/
  config/db.js            MongoDB connection + local JSON failover engine
  models/index.js          Mongoose schemas (Users, Foods, Orders, Tables, ...)
  services/dbService.js    All business logic / CRUD (Mongo + JSON dual-write)
  routes/apiRoutes.js      REST endpoints, mounted at /api
  middleware/authMiddleware.js  JWT auth guard
  seed.js                   Manual seeding script
  data/initialMenu.js       105+ item seed menu data
data/                       Local JSON database file (auto-created, gitignored)
public/assets/              Payment QR, hotel stamp/seal (served at /assets/*)
index.js                    Server entrypoint
```

## Setup
```bash
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI if you have MongoDB; otherwise it auto-falls
# back to the local JSON store in ./data.
# Set FRONTEND_URL to your deployed frontend's URL (for CORS) once you have one.
# Set APP_URL to wherever the FRONTEND is hosted — this is what table QR
# codes link to, so scanning one opens the customer menu directly.

npm run dev      # node --watch index.js — starts on http://localhost:5000
```

Default admin login (seeded automatically on first run):
- Email: `admin@restaurant.com`
- Password: `Admin@123456`

All endpoints are under `/api` — e.g. `GET /api/foods`, `POST /api/orders`,
`GET /api/settings`, `DELETE /api/notifications` (clear all),
`DELETE /api/notifications/:id` (clear one). See `backend/routes/apiRoutes.js`
for the full list.

## Production
```bash
npm start   # node index.js
```
Requires Node.js 18+ (uses native ES Modules + `node --watch` in dev).

## Notes
- Every write (orders, menu, tables, staff, settings, notifications, etc.)
  is mirrored into MongoDB when `MONGODB_URI` is reachable, in addition to
  the fast local JSON engine — so the app works out of the box with zero DB
  setup, and upgrades to real MongoDB persistence automatically once one is
  connected.
- **Table QR → direct menu ordering**: each table's QR code (generated here,
  visible/printable from Admin → Tables) encodes a link like
  `<APP_URL>/?table=T-04`. Scanning it with any phone camera or QR app opens
  the frontend directly on the menu for that table — no extra screen, no
  login — anyone who scans it can browse and order immediately. Make sure
  `APP_URL` in `.env` points to wherever your **frontend** is actually
  hosted (not this backend's URL), or the QR will open the wrong place.
- The payment QR shown to customers, and the hotel stamp/seal on invoices,
  are configurable at runtime from Admin → Settings in the frontend.
