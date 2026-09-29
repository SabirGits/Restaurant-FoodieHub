import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Check,
  Receipt,
  Bell,
  RefreshCw,
  ClipboardList,
  Flame,
  BellRing,
  Utensils
} from "lucide-react";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import { TaxInvoiceModal } from "./TaxInvoiceModal";
import { CallWaiterModal } from "./CallWaiterModal";

/**
 * Compact live order tracker.
 *
 * Deliberately small: a narrow card (max-w-sm) with a horizontal stepper
 * instead of the old tall vertical timeline, so it fits on a phone screen
 * without scrolling and doesn't dominate a desktop screen either.
 *
 * The backend walks the order forward one stage every few minutes
 * (Pending -> Confirmed -> Preparing -> Ready -> Served); this component polls
 * every 4 seconds, so the steps visibly light up one after another.
 */
const ORDER_STEPS = [
  { key: "Pending", short: "Placed", Icon: ClipboardList, headline: "Order placed \u2713", desc: "Sent to the kitchen" },
  { key: "Confirmed", short: "Accepted", Icon: Check, headline: "Kitchen accepted your order", desc: "Chef has your ticket" },
  { key: "Preparing", short: "Cooking", Icon: Flame, headline: "Your food is being cooked \u{1F525}", desc: "Fresh on the flame" },
  { key: "Ready", short: "Ready", Icon: BellRing, headline: "Food is ready \u{1F37D}\uFE0F", desc: "Plated & waiting" },
  { key: "Served", short: "Served", Icon: Utensils, headline: "Served at your table \u{1F60B}", desc: "Enjoy your meal" }
];

// "Completed" (bill settled) maps onto the final visual step.
function stepIndexFor(status) {
  if (status === "Completed") return ORDER_STEPS.length - 1;
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

const OrderTrackingModal = ({ orderId, onClose }) => {
  const { settings } = useCart();
  const [order, setOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isWaiterOpen, setIsWaiterOpen] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Always holds the order currently being tracked, so a slow response that
  // belongs to an EARLIER order can never overwrite the new order's tracker.
  const activeIdRef = useRef(orderId);
  activeIdRef.current = orderId;

  // Tick every second so the countdown and bar move smoothly between polls.
  useEffect(() => {
    if (!orderId) return;
    const t = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(t);
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;
    const requestedFor = orderId;
    try {
      const res = await api.getOrderById(requestedFor);
      // Ignore late replies for an order that is no longer the tracked one.
      if (activeIdRef.current !== requestedFor) return;
      if (res.success && res.data) setOrder(res.data);
    } catch (err) {
      console.warn("Failed to refresh order status:", err);
    }
  };

  // Manual refresh: always spins for a moment (so the click feels acknowledged)
  // even if the network round-trip is instant.
  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const spinFor = new Promise((resolve) => setTimeout(resolve, 550));
    await Promise.all([fetchOrder(), spinFor]);
    setIsRefreshing(false);
  };

  // A fresh orderId means a brand-new order — clear any previously tracked
  // order immediately so its stage/progress never bleeds into the new one
  // while the first fetch is in flight.
  useEffect(() => {
    setOrder(null);
    setShowItems(false);
    setNow(Date.now());
  }, [orderId]);

  // Poll every 4s — this is what makes the stepper advance on its own.
  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
    const timer = setInterval(fetchOrder, 4e3);
    return () => clearInterval(timer);
  }, [orderId]);

  // Only ever render an order that really is the one being tracked. (Right
  // after switching to a new order, the previous order's data can still be in
  // state for one render — showing it would make the new tracker start
  // "in the middle". Hiding it makes every tracker start clean from step 0.)
  const isSameOrder =
    order && (order.id === orderId || order._id === orderId || order.orderNumber === orderId);
  if (!orderId || !order || !isSameOrder) return null;

  const currentStepIndex = stepIndexFor(order.orderStatus);
  const currentStep = ORDER_STEPS[currentStepIndex];
  const isCancelled = order.orderStatus === "Cancelled";
  const isFoodDone = ["Ready", "Served", "Completed"].includes(order.orderStatus);

  // --- Live ETA -----------------------------------------------------------
  const startMs = new Date(order.createdAt).getTime();
  const targetMs = order.estimatedReadyAt
    ? new Date(order.estimatedReadyAt).getTime()
    : startMs + (Number(order.estimatedPrepMinutes) || 15) * 60 * 1e3;
  const msRemaining = Math.max(0, targetMs - now);
  const minutesRemaining = Math.floor(msRemaining / 6e4);
  const secondsRemaining = Math.floor((msRemaining % 6e4) / 1e3);
  const totalMinutes = Math.max(1, Math.round((targetMs - startMs) / 6e4));
  // The bar follows the stage the order has actually reached, so it can never
  // disagree with the stepper above it.
  const stagePct = (currentStepIndex / (ORDER_STEPS.length - 1)) * 100;
  const progressPct = isFoodDone ? Math.max(75, stagePct) : Math.max(8, stagePct);
  const isRunningLate = !isFoodDone && msRemaining === 0;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-premium text-zinc-100 relative max-h-[88vh] flex flex-col"
          >
            {/* ---------- Header (compact) ---------- */}
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-white truncate">Track Your Order</h3>
                  <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-semibold bg-emerald-950 px-1.5 py-0.5 rounded-full border border-emerald-800 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                  <strong className="text-amber-400">{order.orderNumber}</strong> • Table {order.tableNumber}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="icon-btn p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-70"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={onClose}
                  className="icon-btn p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  aria-label="Close tracker"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto">
              {/* ---------- Current stage (3D coin + headline) ---------- */}
              <div className="px-5 py-4 flex items-center gap-3.5 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-zinc-800">
                <div className="feature-coin w-12 h-12 rounded-full flex items-center justify-center text-zinc-950 shrink-0">
                  <motion.span
                    key={currentStep.key}
                    initial={{ scale: 0.5, rotateY: -90 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  >
                    {isCancelled ? <X className="w-5 h-5" /> : <currentStep.Icon className="w-5 h-5" />}
                  </motion.span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                    Current Stage
                  </span>
                  <motion.span
                    key={order.orderStatus}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[15px] font-semibold text-amber-400 block leading-snug mt-0.5"
                  >
                    {isCancelled ? "Order cancelled" : currentStep.headline}
                  </motion.span>
                </div>
              </div>

              {/* ---------- Horizontal stepper (compact) ---------- */}
              {!isCancelled && (
                <div className="px-5 pt-5 pb-4">
                  <div className="relative">
                    {/* rail */}
                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-zinc-800 rounded-full" />
                    <motion.div
                      className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                      initial={false}
                      animate={{ width: `${stagePct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />

                    <div className="relative flex items-start justify-between">
                      {ORDER_STEPS.map((step, idx) => {
                        const isDone = currentStepIndex > idx;
                        const isCurrent = currentStepIndex === idx;
                        return (
                          <div key={step.key} className="flex flex-col items-center gap-1 w-1/5">
                            <motion.div
                              initial={false}
                              animate={{ scale: isCurrent ? 1.12 : 1 }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isCurrent
                                  ? "bg-amber-500 text-zinc-950 ring-4 ring-amber-500/20 shadow-lg shadow-amber-500/30"
                                  : isDone
                                    ? "bg-emerald-500 text-zinc-950"
                                    : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                              }`}
                            >
                              {isDone ? <Check className="w-4 h-4" /> : <step.Icon className="w-4 h-4" />}
                            </motion.div>
                            <span
                              className={`text-[10px] font-medium text-center leading-tight ${
                                isCurrent ? "text-amber-400" : isDone ? "text-zinc-300" : "text-zinc-500"
                              }`}
                            >
                              {step.short}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 mt-3 text-center">
                    {currentStep.desc} • updates automatically
                  </p>
                </div>
              )}

              {/* ---------- ETA strip ---------- */}
              {!isCancelled && (
                <div className="px-5 pb-4">
                  <div className="rounded-2xl bg-zinc-950 border border-zinc-800 px-4 py-3.5">
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider block">
                          {isFoodDone ? "Food Ready" : "Time Remaining"}
                        </span>
                        <span
                          className={`font-serif text-2xl font-bold tabular-nums leading-none ${
                            isFoodDone ? "text-emerald-500" : isRunningLate ? "text-rose-500" : "text-amber-400"
                          }`}
                        >
                          {isFoodDone
                            ? "Served up!"
                            : isRunningLate
                              ? "Any moment"
                              : `${minutesRemaining}:${String(secondsRemaining).padStart(2, "0")}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-zinc-400 block uppercase tracking-wider">Total</span>
                        <span className="text-xs font-bold text-zinc-200">~{totalMinutes} min</span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden relative">
                      <motion.div
                        className={`h-full rounded-full ${
                          isFoodDone ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-amber-400"
                        }`}
                        initial={false}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      {!isFoodDone && (
                        <div className="absolute inset-0 shimmer-sweep overflow-hidden rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------- Bill summary (items collapsed by default) ---------- */}
              <div className="px-5 pb-4">
                <button
                  onClick={() => setShowItems((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/30 text-xs transition-colors"
                >
                  <span className="font-semibold text-zinc-300">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""} •{" "}
                    <span
                      className={`font-bold ${
                        order.paymentStatus === "Paid" ? "text-emerald-500" : "text-amber-400"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </span>
                  <span className="font-bold text-amber-400 text-base tabular-nums">
                    ₹{order.grandTotal.toFixed(2)}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {showItems && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-2 text-[11px] max-h-28 overflow-y-auto px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-zinc-300 gap-2">
                            <span className="truncate">
                              {item.quantity} × {item.name}
                            </span>
                            <span className="font-semibold text-zinc-200 shrink-0">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ---------- Actions ---------- */}
              <div className="grid grid-cols-2 gap-2.5 px-5 pb-5">
                <button
                  id="btn-open-invoice"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[11px] transition-colors border border-zinc-700"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tax Invoice</span>
                </button>

                <button
                  onClick={() => setIsWaiterOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-[11px] transition-colors border border-amber-500/30"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Call Waiter</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      <TaxInvoiceModal
        order={isInvoiceOpen ? order : null}
        settings={settings}
        onClose={() => setIsInvoiceOpen(false)}
      />

      <CallWaiterModal isOpen={isWaiterOpen} onClose={() => setIsWaiterOpen(false)} />
    </>
  );
};

export { OrderTrackingModal };
