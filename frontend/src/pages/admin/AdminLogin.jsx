import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, Mail, UtensilsCrossed, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useNotification } from "../../context/NotificationContext";
const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const { success, error } = useNotification();
  const [email, setEmail] = useState("admin@restaurant.com");
  const [password, setPassword] = useState("Admin@123456");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        success("Welcome back, Executive Manager!");
        navigate("/admin/dashboard");
      } else {
        error("Invalid credentials. Please try again.");
      }
    } catch (err) {
      error(err.message || "Login failed. Check server connection.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleFillDemo = () => {
    setEmail("admin@restaurant.com");
    setPassword("Admin@123456");
    success("Filled demo credentials");
  };
  return <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {
    /* Background ambient lighting */
  }
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10"
  >
        {
    /* Brand Header */
  }
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 shadow-xl shadow-amber-500/20">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
            Restaurant Management Portal
          </h1>
          <p className="text-xs text-zinc-400">
            Kitchen Display, Staff Attendance, Inventory & Live POS
          </p>
        </div>

        {
    /* Form */
  }
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Admin / Manager Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
    id="admin-login-email"
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="admin@restaurant.com"
    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all text-zinc-100 placeholder:text-zinc-600"
  />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
    id="admin-login-password"
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all text-zinc-100 placeholder:text-zinc-600"
  />
            </div>
          </div>

          <button
    type="submit"
    id="btn-admin-login-submit"
    disabled={isLoading}
    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
  >
            {isLoading ? <span>Authenticating...</span> : <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>}
          </button>
        </form>

        {
    /* Demo Credentials Helper Pill */
  }
        <div className="mt-6 pt-6 border-t border-zinc-800/80">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
            <div className="flex items-center justify-between text-zinc-300 font-semibold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Demo Credentials
              </span>
              <button
    type="button"
    id="btn-fill-demo-creds"
    onClick={handleFillDemo}
    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
  >
                <Sparkles className="w-3 h-3" /> Auto-fill
              </button>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Email: <span className="text-zinc-200">admin@restaurant.com</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Pass: <span className="text-zinc-200">Admin@123456</span>
            </div>
          </div>
        </div>

        {
    /* Back to Customer Link */
  }
        <div className="mt-6 text-center">
          <Link
    to="/"
    className="text-xs text-zinc-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
  >
            ← Back to Customer QR Dining Menu
          </Link>
        </div>
      </motion.div>
    </div>;
};
export {
  AdminLogin
};
