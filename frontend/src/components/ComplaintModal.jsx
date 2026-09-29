import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, AlertOctagon } from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
const COMPLAINT_CATEGORIES = [
  "Food Quality / Taste",
  "Wrong Item Delivered",
  "Delayed Preparation",
  "Server / Service Issue",
  "Cleanliness & Hygiene",
  "Billing / Tax Discrepancy",
  "Payment / UPI Failure",
  "Other Assistance"
];
const ComplaintModal = ({ isOpen, onClose, orderId }) => {
  const { currentTable } = useCart();
  const { success, error } = useNotification();
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      error("Please describe the issue so we can assist you.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitComplaint({
        category,
        description: description.trim(),
        tableNumber: currentTable,
        orderId
      });
      setSubmitted(true);
      success("Management notified immediately. The duty manager is on their way.");
      setTimeout(() => {
        setSubmitted(false);
        setDescription("");
        onClose();
      }, 2500);
    } catch (err) {
      error(err.message || "Failed to submit issue");
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
    id="close-complaint-modal"
    onClick={onClose}
    className="icon-btn absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
  >
            <X className="w-5 h-5" />
          </button>

          {submitted ? <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">Duty Manager Notified</h3>
              <p className="text-sm text-zinc-400">
                Our floor captain has received your alert for <strong>Table {currentTable}</strong> and will resolve this immediately.
              </p>
            </div> : <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">Report an Issue</h3>
                  <p className="text-xs text-zinc-400">Table {currentTable} Immediate Manager Alert</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Issue Category
                </label>
                <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-700 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all text-zinc-200"
  >
                  {COMPLAINT_CATEGORIES.map((cat) => <option key={cat} value={cat}>
                      {cat}
                    </option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Explain What Happened
                </label>
                <textarea
    rows={4}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Please describe the issue in detail..."
    className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-700 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all placeholder:text-zinc-500 resize-none"
  />
              </div>

              <button
    type="submit"
    id="btn-submit-complaint"
    disabled={isSubmitting}
    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-rose-900/30"
  >
                {isSubmitting ? "Submitting to Manager..." : "Submit Issue to Manager"}
              </button>
            </form>}
        </motion.div>
      </div>
    </AnimatePresence>;
};
export {
  ComplaintModal
};
