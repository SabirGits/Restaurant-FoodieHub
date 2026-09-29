import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Bell,
  UtensilsCrossed,
  ChevronDown,
  ShieldCheck,
  MessageSquareWarning,
  Star,
  Sun,
  Moon,
  MessageCircle,
  Menu as MenuIcon,
  X
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { TableSelectorModal } from "./TableSelectorModal";
import { CallWaiterModal } from "./CallWaiterModal";
import { FeedbackModal } from "./FeedbackModal";
import { ComplaintModal } from "./ComplaintModal";

/**
 * Top navigation bar (FoodieHub design language).
 *
 * `onAskClick` opens the dining assistant. The assistant's launcher used to
 * float at the bottom of the menu page — it now lives up here in the navbar,
 * next to the other quick actions, on every screen size.
 */
const Navbar = ({ onSearchChange, searchValue = "", onAskClick }) => {
  const { currentTable, itemCount, setIsCartOpen, settings } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-2xl backdrop-saturate-150 border-b border-amber-500/15 text-zinc-100 shadow-[0_1px_0_0_rgba(212,162,76,0.08),0_10px_34px_-24px_rgba(0,0,0,0.9)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* ---------- Brand ---------- */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-[0_6px_18px_-8px_rgba(212,162,76,0.8)] group-hover:-translate-y-0.5 transition-transform duration-300 overflow-hidden ring-1 ring-amber-300/30">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-serif text-lg sm:text-2xl font-bold text-white truncate max-w-[9rem] sm:max-w-none leading-tight">
                  {settings?.restaurantName || "FoodieHub"}
                </div>
                <div className="text-[9px] sm:text-[10px] text-zinc-400 font-medium tracking-[0.22em] uppercase hidden sm:block mt-0.5">
                  Better Food • Better Mood
                </div>
              </div>
            </Link>

            {/* ---------- Center: table badge (tablet & up) ---------- */}
            <div className="hidden md:flex items-center gap-2">
              <button
                id="active-table-badge"
                onClick={() => setIsTableModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 text-xs lg:text-[13px] font-medium transition-all"
                title="Click to switch or scan table"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Table <strong className="text-white font-bold">{currentTable}</strong>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>

            {/* ---------- Right: actions ---------- */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* ASK US — moved here from the floating bottom button */}
              <button
                id="btn-open-chat-assistant"
                onClick={onAskClick}
                title="Ask our dining assistant"
                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-sky-500/10 hover:bg-sky-500/18 border border-sky-500/30 hover:border-sky-500/50 text-sky-400 text-xs sm:text-[13px] font-medium transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden lg:inline">Ask Us</span>
              </button>

              {/* Call waiter */}
              <button
                id="btn-call-waiter"
                onClick={() => setIsWaiterModalOpen(true)}
                title="Call a server to your table"
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-400 text-xs sm:text-[13px] font-medium transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden lg:inline">Call Server</span>
              </button>

              {/* Review / Assistance (desktop only) */}
              <div className="hidden xl:flex items-center gap-1 border-l border-zinc-800 pl-2 ml-1">
                <button
                  id="btn-feedback"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  title="Give Restaurant Feedback"
                >
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Review</span>
                </button>
                <button
                  id="btn-complaint"
                  onClick={() => setIsComplaintModalOpen(true)}
                  className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-zinc-900 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  title="Report an issue or complaint"
                >
                  <MessageSquareWarning className="w-4 h-4" />
                  <span>Assistance</span>
                </button>
              </div>

              {/* Theme toggle */}
              <button
                id="btn-toggle-theme"
                onClick={toggleTheme}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                aria-label="Toggle colour theme"
                className="flex items-center justify-center w-10 h-10 rounded-full text-zinc-400 hover:text-amber-400 bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Staff portal (desktop) */}
              <Link
                to="/admin"
                id="link-admin-portal"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-xs font-semibold transition-all"
                title="Staff & Management Portal"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Staff / POS</span>
              </Link>

              {/* Cart */}
              <button
                id="btn-open-cart"
                onClick={() => setIsCartOpen(true)}
                className="btn-3d relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 font-semibold text-xs sm:text-[13px] active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden xs:inline">Order</span>
                {itemCount > 0 && (
                  <span
                    id="cart-badge-count"
                    className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-zinc-950 text-amber-400 text-[11px] font-bold leading-none tabular-nums"
                  >
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label="Open menu"
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-zinc-300 bg-zinc-900/80 border border-zinc-800"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Mobile / tablet quick sheet ---------- */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl px-4 py-4 space-y-3">
            <button
              onClick={() => {
                setIsTableModalOpen(true);
                closeMobile();
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-zinc-900 border border-amber-500/30 text-sm font-medium text-amber-400"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Table <strong className="text-white">{currentTable}</strong>
              </span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setIsWaiterModalOpen(true);
                  closeMobile();
                }}
                className="flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200"
              >
                <Bell className="w-4 h-4 text-amber-400" /> Call Server
              </button>
              <button
                onClick={() => {
                  onAskClick?.();
                  closeMobile();
                }}
                className="flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200"
              >
                <MessageCircle className="w-4 h-4 text-sky-400" /> Ask Us
              </button>
              <button
                onClick={() => {
                  setIsFeedbackModalOpen(true);
                  closeMobile();
                }}
                className="flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200"
              >
                <Star className="w-4 h-4 text-amber-400" /> Review
              </button>
              <button
                onClick={() => {
                  setIsComplaintModalOpen(true);
                  closeMobile();
                }}
                className="flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200"
              >
                <MessageSquareWarning className="w-4 h-4 text-rose-500" /> Complaint
              </button>
            </div>

            <Link
              to="/admin"
              onClick={closeMobile}
              className="w-full flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400"
            >
              <ShieldCheck className="w-4 h-4" /> Staff / POS Portal
            </Link>
          </div>
        )}

        {/* Global "restaurant closed" banner */}
        {settings && !settings.isOpen && (
          <div className="bg-rose-950 border-t border-rose-800/50 py-1.5 px-4 text-center text-xs text-rose-300">
            ⚠️ The restaurant is currently <strong>Closed</strong>. You can browse the full menu, but new kitchen orders are paused.
          </div>
        )}
      </header>

      {/* ---------- Modals ---------- */}
      <TableSelectorModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} />
      <CallWaiterModal isOpen={isWaiterModalOpen} onClose={() => setIsWaiterModalOpen(false)} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
      <ComplaintModal isOpen={isComplaintModalOpen} onClose={() => setIsComplaintModalOpen(false)} />
    </>
  );
};

export { Navbar };
