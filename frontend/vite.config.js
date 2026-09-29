import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 5173,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Proxies /api calls to the standalone backend server during local dev,
      // so the frontend can keep calling relative '/api/...' paths without
      // hitting CORS. Set VITE_API_URL in .env instead if you'd rather call
      // the backend's full URL directly (e.g. when deployed separately).
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_ORIGIN || 'http://localhost:5000',
          changeOrigin: true,
          // Without this, a request that's in-flight the moment the backend
          // restarts (nodemon/--watch) or is briefly down shows up as a raw
          // "ECONNRESET" stack trace in the terminal. This logs one clean
          // line instead and lets Vite keep serving everything else.
          configure: (proxy) => {
            proxy.on('error', (err, req) => {
              console.warn(`[proxy] backend not reachable for ${req.url} (${err.code}). Is "npm run dev" running inside /backend?`);
            });
          },
        },
        // The backend also serves static files (payment QR code image, hotel
        // stamp) from /assets — these were missing from the proxy, so in dev
        // the browser requested them from the Vite server itself and got a
        // 404, which is why the payment/scanner QR image didn't show up.
        '/assets': {
          target: process.env.VITE_BACKEND_ORIGIN || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
});
