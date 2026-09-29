# Smart Restaurant — Frontend

Plain **JavaScript** React 19 + Vite app (no TypeScript) for the Smart
Restaurant customer & admin web app. Talks to the standalone backend API
over HTTP.

## Setup
```bash
npm install
cp .env.example .env
# Leave VITE_BACKEND_ORIGIN pointing at your running backend (default
# http://localhost:5000) — the dev server proxies /api calls to it.

npm run dev      # http://localhost:5173
```

Make sure the **backend** project is running separately (see its own
README) before starting the frontend, or API calls will fail.

## Production build
```bash
npm run build     # outputs static files to dist/
npm run preview   # preview the production build locally
```

When deploying the built `dist/` folder to a static host (Vercel, Netlify,
S3, etc.) while the backend lives elsewhere, set `VITE_API_URL` in `.env` to
the backend's full public URL (e.g. `https://your-backend.onrender.com/api`)
before running `npm run build`, since there's no dev-proxy in production.

## Structure
```
src/
  pages/            Customer & admin screens (CustomerHome, AdminDashboard, ...)
  components/        Shared UI (Navbar, CartDrawer, TaxInvoiceModal, FoodCard, ...)
  context/           CartContext (table/session state), NotificationContext
  services/api.js    All backend API calls, base URL configurable via VITE_API_URL
public/assets/       Payment QR & hotel stamp/seal defaults, served at /assets/*
```

## Notes
- **Table QR → direct menu ordering**: each table's QR (printed from
  Admin → Tables) links to `<this-site>/?table=T-04`. `App.jsx` routes `/`
  straight to `CustomerHome` with no gate in between, and `CartContext.jsx`
  reads the `?table=` param on load and sets the active table immediately —
  so anyone scanning a table's QR lands directly on the live menu for that
  table, ready to order. No separate "confirm table" step blocks the way.
- Admin → Settings lets you upload a logo, official stamp/seal, and payment
  QR at runtime; changes are saved via the backend API and reflected
  immediately across the site.
- Admin notification bell supports clearing one notification at a time (✕ on
  each item) or all at once ("Clear All").
