import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  QrCode,
  Users,
  Boxes,
  ReceiptText,
  BarChart3,
  MessageSquareHeart,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink,
  Sun,
  Moon
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { api } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
const NAV_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard & KDS", icon: LayoutDashboard },
  { path: "/admin/orders", label: "Live Orders", icon: ShoppingBag },
  { path: "/admin/menu", label: "Menu (105+ Dishes)", icon: UtensilsCrossed },
  { path: "/admin/tables", label: "Tables & QR Standees", icon: QrCode },
  { path: "/admin/staff", label: "Staff & Attendance", icon: Users },
  { path: "/admin/inventory", label: "Inventory & Stock", icon: Boxes },
  { path: "/admin/expenses", label: "Expenses & Profit", icon: ReceiptText },
  { path: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
  { path: "/admin/feedback", label: "Reviews & Issues", icon: MessageSquareHeart },
  { path: "/admin/settings", label: "Settings & Tax/UPI", icon: Settings }
];
const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, isLoading, navigate]);
  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (e) {
    }
  };
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 8e3);
    return () => clearInterval(interval);
  }, []);
  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(
        (prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (e) {
    }
  };
  const handleClearOne = async (id) => {
    // Optimistically remove it from the list first for a snappy feel
    setNotifications((prev) => prev.filter((n) => (n.id || n._id) !== id));
    try {
      await api.clearNotification(id);
    } catch (e) {
      // Roll back by reloading from the server if the delete failed
      loadNotifications();
    }
  };
  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    const prevNotifications = notifications;
    setNotifications([]);
    try {
      await api.clearAllNotifications();
    } catch (e) {
      setNotifications(prevNotifications);
    }
  };
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>;
  }
  return <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-amber-500 selection:text-zinc-950">
      {
    /* Mobile Top Header */
  }
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-bold">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-base text-white">Manager Portal</span>
        </div>

        <div className="flex items-center gap-2">
          <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative p-2.5 text-zinc-300 hover:text-amber-400 rounded-xl bg-zinc-800 border border-zinc-700 transition-colors"
  >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />}
          </button>
          <button
    onClick={() => setSidebarOpen(!sidebarOpen)}
    className="p-2.5 text-zinc-300 hover:text-amber-400 rounded-xl bg-zinc-800 border border-zinc-700 transition-colors"
  >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {
    /* Sidebar Navigation */
  }
      <aside
    className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
  >
        {
    /* Brand */
  }
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-amber-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-base font-bold text-white leading-none">
                Royal Spice
              </div>
              <div className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase mt-1">
                Admin POS & KDS
              </div>
            </div>
          </div>
          <button
    onClick={() => setSidebarOpen(false)}
    className="icon-btn p-1.5 rounded-lg md:hidden text-zinc-400 hover:text-white"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Links */
  }
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return <Link
      key={item.path}
      to={item.path}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${isActive ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80"}`}
    >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                <span>{item.label}</span>
              </Link>;
  })}
        </nav>

        {
    /* User Info & Switch to Customer Mode */
  }
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950/60 space-y-2">
          <Link
    to="/"
    target="_blank"
    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
  >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer QR Menu</span>
            </span>
            <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">Live</span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name[0] : "A"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{user?.name || "Manager"}</div>
                <div className="text-[10px] text-zinc-500 truncate">{user?.role || "Executive"}</div>
              </div>
            </div>

            <button
    onClick={logout}
    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
    title="Log Out"
  >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {
    /* Main Content Pane */
  }
      <div className="flex-1 flex flex-col min-w-0">
        {
    /* Desktop Topbar */
  }
        <header className="hidden md:flex items-center justify-between px-6 py-3.5 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">
              {(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">Cloud DB & POS Synchronized</span>
          </div>

          <div className="flex items-center gap-3 relative">
            {
    /* Light / Dark Theme Toggle */
  }
            <button
    id="btn-admin-toggle-theme"
    onClick={toggleTheme}
    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    aria-label="Toggle colour theme"
    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
  >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {
    /* Notification Bell */
  }
            <div className="relative">
              <button
    id="btn-admin-notifications"
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
  >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px] flex items-center justify-center px-1">
                    {unreadCount}
                  </span>}
              </button>

              {
    /* Notification Flyout */
  }
              {showNotifications && <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Recent Activity ({notifications.length})
                    </span>
                    <div className="flex items-center gap-3">
                      {notifications.length > 0 && (
                        <button
                          id="btn-clear-all-notifications"
                          onClick={handleClearAll}
                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300"
                        >
                          Clear All
                        </button>
                      )}
                      <button
    onClick={() => setShowNotifications(false)}
    className="text-zinc-500 hover:text-zinc-300 text-xs"
  >
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? <div className="py-6 text-center text-xs text-zinc-500">No notifications</div> : notifications.map((n) => <div
    key={n.id}
    onClick={() => handleMarkRead(n.id)}
    className={`relative p-2.5 pr-7 rounded-xl border text-xs cursor-pointer transition-colors ${n.isRead ? "bg-zinc-950/40 border-zinc-800/60 text-zinc-400" : "bg-zinc-950 border-amber-500/30 text-zinc-200 ring-1 ring-amber-500/20"}`}
  >
                          <button
                            id={`btn-clear-notification-${n.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearOne(n.id);
                            }}
                            title="Clear this notification"
                            className="absolute top-2 right-2 p-0.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-zinc-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="font-bold text-white flex items-center justify-between">
                            <span>{n.title}</span>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{n.message}</p>
                          <div className="text-[10px] text-zinc-500 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>)}
                  </div>
                </div>}
            </div>

            <Link
    to="/"
    target="_blank"
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors"
  >
              <span>View Customer Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {
    /* Page Content Body */
  }
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>;
};
export {
  AdminLayout
};
