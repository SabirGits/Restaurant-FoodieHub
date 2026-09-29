import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, X, CheckCircle2, MessageSquareHeart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
const FeedbackModal = ({ isOpen, onClose, orderId }) => {
  const { currentTable } = useCart();
  const { success, error } = useNotification();
  const [customerName, setCustomerName] = useState("");
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [overallRating, setOverallRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitFeedback({
        tableNumber: currentTable,
        orderId,
        customerName: customerName.trim() || "Valued Guest",
        foodRating,
        serviceRating,
        cleanlinessRating,
        overallRating,
        comment: comment.trim()
      });
      setSubmitted(true);
      success("Thank you for your rating! We cherish your dining experience.");
      setTimeout(() => {
        setSubmitted(false);
        setComment("");
        onClose();
      }, 2e3);
    } catch (err) {
      error(err.message || "Failed to submit feedback");
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
    id="close-feedback-modal"
    onClick={onClose}
    className="icon-btn absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
  >
            <X className="w-5 h-5" />
          </button>

          {submitted ? <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">Review Submitted!</h3>
              <p className="text-sm text-zinc-400">Thank you for dining with us at Royal Spice Gourmet.</p>
            </div> : <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <MessageSquareHeart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">Guest Feedback</h3>
                  <p className="text-xs text-zinc-400">Table {currentTable} Experience</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.14em] mb-2">
                  Your Name (Optional)
                </label>
                <input
    type="text"
    placeholder="e.g. Ananya Roy"
    value={customerName}
    onChange={(e) => setCustomerName(e.target.value)}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-700 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all placeholder:text-zinc-500"
  />
              </div>

              {
    /* Star Rating Groups */
  }
              <div className="space-y-2.5 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Food Quality</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => <button
    key={star}
    type="button"
    onClick={() => setFoodRating(star)}
    className={`p-1 transition-transform hover:scale-110 active:scale-95 ${star <= foodRating ? "text-amber-400" : "text-zinc-600 hover:text-zinc-500"}`}
  >
                        <Star className="w-5 h-5 fill-current" />
                      </button>)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Service & Hospitality</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => <button
    key={star}
    type="button"
    onClick={() => setServiceRating(star)}
    className={`p-1 transition-transform hover:scale-110 active:scale-95 ${star <= serviceRating ? "text-amber-400" : "text-zinc-600 hover:text-zinc-500"}`}
  >
                        <Star className="w-5 h-5 fill-current" />
                      </button>)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Ambiance & Hygiene</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => <button
    key={star}
    type="button"
    onClick={() => setCleanlinessRating(star)}
    className={`p-1 transition-transform hover:scale-110 active:scale-95 ${star <= cleanlinessRating ? "text-amber-400" : "text-zinc-600 hover:text-zinc-500"}`}
  >
                        <Star className="w-5 h-5 fill-current" />
                      </button>)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                  <span className="text-xs font-semibold text-amber-400">Overall Rating</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => <button
    key={star}
    type="button"
    onClick={() => setOverallRating(star)}
    className={`p-1 transition-transform hover:scale-110 active:scale-95 ${star <= overallRating ? "text-amber-400" : "text-zinc-600 hover:text-zinc-500"}`}
  >
                        <Star className="w-6 h-6 fill-current" />
                      </button>)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.14em] mb-2">
                  Comments or Suggestions
                </label>
                <textarea
    rows={3}
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    placeholder="Tell us what you loved, or how we can improve..."
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-700 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all placeholder:text-zinc-500 resize-none"
  />
              </div>

              <button
    type="submit"
    id="btn-submit-feedback"
    disabled={isSubmitting}
    className="btn-3d w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm disabled:opacity-50"
  >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>}
        </motion.div>
      </div>
    </AnimatePresence>;
};
export {
  FeedbackModal
};
