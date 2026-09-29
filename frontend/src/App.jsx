import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { CustomerHome } from "./pages/CustomerHome";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminMenu } from "./pages/admin/AdminMenu";
import { AdminTables } from "./pages/admin/AdminTables";
import { AdminStaff } from "./pages/admin/AdminStaff";
import { AdminInventory } from "./pages/admin/AdminInventory";
import { AdminExpenses } from "./pages/admin/AdminExpenses";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminFeedback } from "./pages/admin/AdminFeedback";
import { AdminSettings } from "./pages/admin/AdminSettings";
function App() {
  return <BrowserRouter>
      <ThemeProvider>
      <NotificationProvider>
        <AdminAuthProvider>
          <CartProvider>
            <Routes>
              {
    /* Customer QR Dining App */
  }
              <Route path="/" element={<CustomerHome />} />

              {
    /* Admin Portal Authentication */
  }
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {
    /* Admin Management Routes */
  }
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/menu" element={<AdminMenu />} />
              <Route path="/admin/tables" element={<AdminTables />} />
              <Route path="/admin/staff" element={<AdminStaff />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/expenses" element={<AdminExpenses />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/feedback" element={<AdminFeedback />} />
              <Route path="/admin/settings" element={<AdminSettings />} />

              {
    /* Catch-all */
  }
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AdminAuthProvider>
      </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>;
}
export {
  App as default
};
