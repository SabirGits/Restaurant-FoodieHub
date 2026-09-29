import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, Droplets, Utensils, Sparkles, Receipt, HelpCircle, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
const COMMON_REASONS = [
  { id: "water", label: "Need Drinking Water", icon: Droplets },
  { id: "cutlery", label: "Extra Plates / Cutlery", icon: Utensils },
  { id: "clean", label: "Clean Table", icon: Sparkles },
  { id: "bill", label: "Bring the Bill", icon: Receipt },
  { id: "help", label: "Menu Recommendation / Help", icon: HelpCircle }
];
const CallWaiterModal = ({ isOpen, onClose }) => {
  const { currentTable } = useCart();
  const { success, error } = useNotification();
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0].label);
  const [customNote, setCustomNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentTable) {
      error("Please select a dining table first.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.callWaiter(currentTable, selectedReason, customNote);
      setSubmitted(true);
      success(`Waiter alerted for Table ${currentTable}! Staff will arrive shortly.`);
      setTimeout(() => {
        setSubmitted(false);
        setCustomNote("");
        onClose();
      }, 2e3);
    } catch (err) {
      error(err.message || "Failed to call waiter");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-premium text-zinc-100 relative modal-in"
  >
          <button
    id="close-waiter-modal"
    onClick={onClose}
    className="icon-btn absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
  >
            <X className="w-5 h-5" />
          </button>

          {submitted ? <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">Server Alerted!</h3>
              <p className="text-sm text-zinc-400">
                A server has received your request for <strong>Table {currentTable}</strong> and will be with you right away.
              </p>
            </div> : <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">Call Waiter</h3>
                  <p className="text-xs text-zinc-400">
                    Serving <strong className="text-amber-400">Table {currentTable}</strong>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Select Reason
                </label>
                <div className="space-y-2">
                  {COMMON_REASONS.map((item) => {
    const Icon = item.icon;
    const isSelected = selectedReason === item.label;
    return <button
      key={item.id}
      type="button"
      id={`reason-${item.id}`}
      onClick={() => setSelectedReason(item.label)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm text-left transition-all ${isSelected ? "bg-amber-500/20 border-amber-500 text-amber-300 font-medium" : "bg-zinc-950/60 hover:bg-zinc-800 border-zinc-800 text-zinc-300"}`}
    >
                        <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{item.label}</span>
                      </button>;
  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Optional Note for Server
                </label>
                <textarea
    id="waiter-custom-notes"
    rows={2}
    value={customNote}
    onChange={(e) => setCustomNote(e.target.value)}
    placeholder="e.g. Warm water please, or extra lime slices..."
    className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-700 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all placeholder:text-zinc-500 resize-none"
  />
              </div>

              <div className="pt-2">
                <button
    type="submit"
    id="btn-submit-waiter-call"
    disabled={isSubmitting}
    className="btn-3d w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm disabled:opacity-50"
  >
                  {isSubmitting ? "Alerting Server..." : "Ring Bell / Call Server"}
                </button>
              </div>
            </form>}
        </motion.div>
      </div>
    </AnimatePresence>;
};
export {
  CallWaiterModal
};
