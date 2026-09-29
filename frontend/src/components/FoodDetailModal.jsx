import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, Heart, Clock, Utensils, Plus, Minus, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
const FoodDetailModal = ({ food, onClose }) => {
  const { addToCart, updateQuantity, getItemQuantity, settings } = useCart();
  const { success, error, info } = useNotification();
  const [userRating, setUserRating] = useState(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [likes, setLikes] = useState(food?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  if (!food) return null;
  const foodId = food.id || food._id;
  const currentQty = getItemQuantity(foodId);
  const isClosed = settings && !settings.isOpen;
  const handleRate = async () => {
    setIsSubmittingRating(true);
    try {
      const res = await api.addRating(foodId, userRating);
      if (res.success && res.data) {
        food.rating = res.data.rating;
        food.ratingsCount = res.data.ratingsCount;
        setRatingSubmitted(true);
        success(`Thank you! You rated this dish ${userRating} stars.`);
        setTimeout(() => setRatingSubmitted(false), 3e3);
      }
    } catch (err) {
      error(err.message || "Failed to submit rating");
    } finally {
      setIsSubmittingRating(false);
    }
  };
  const handleLike = async () => {
    try {
      const res = await api.toggleLike(foodId);
      if (res.success && res.data) {
        setLikes(res.data.likes);
        setIsLiked(res.data.liked);
      }
    } catch (err) {
    }
  };
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
        <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="w-full max-w-sm sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-premium text-zinc-100 relative my-6 max-h-[85vh] flex flex-col"
  >
          {
    /* Close button */
  }
          <button
    id="close-detail-modal"
    onClick={onClose}
    className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition-colors shadow-lg"
  >
            <X className="w-5 h-5" />
          </button>

          <div className="overflow-y-auto">
          {
    /* Hero Image */
  }
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-zinc-950 overflow-hidden">
            <img
    src={food.image}
    alt={food.name}
    className="w-full h-full object-cover"
  />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/40" />

            {
    /* Badges */
  }
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div
    className={`w-6 h-6 rounded flex items-center justify-center bg-white/95 shadow-md ${food.isVeg ? "border-2 border-emerald-600" : "border-2 border-rose-600"}`}
  >
                {food.isVeg ? <div className="w-3 h-3 rounded-full bg-emerald-600" /> : <div className="w-0 h-0 border-x-[5px] border-x-transparent border-b-[10px] border-b-rose-600" />}
              </div>
              <span className="px-3 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md text-amber-400 font-semibold text-xs border border-amber-500/30">
                {food.category}
              </span>
              {food.isPopular && <span className="px-3 py-1 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider">
                  Bestseller
                </span>}
            </div>

            {
    /* Like count floating */
  }
            <button
    onClick={handleLike}
    className={`absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all shadow-lg ${isLiked ? "bg-rose-500 text-white" : "bg-black/60 text-zinc-200 hover:bg-black/80"}`}
  >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs font-semibold">{likes}</span>
            </button>
          </div>

          {
    /* Content Body */
  }
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-serif tracking-tight">
                  {food.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Star className="w-3 h-3 fill-current" />
                    {food.rating || 4.9} ({food.ratingsCount || 1})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {food.preparationTimeMinutes || 15} mins
                  </span>
                </div>
              </div>

              <div className="text-xl sm:text-2xl font-extrabold text-amber-400 shrink-0">
                ₹{food.price}
              </div>
            </div>

            {
    /* Description */
  }
            <p className="text-zinc-300 text-sm leading-relaxed">
              {food.description}
            </p>

            {
    /* Ingredients */
  }
            {food.ingredients && food.ingredients.length > 0 && <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" /> Key Ingredients & Spices
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {food.ingredients.map((ing, idx) => <span
    key={idx}
    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-medium"
  >
                      {ing}
                    </span>)}
                </div>
              </div>}

            {
    /* Customer Rating Section */
  }
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Rate this dish
                </span>
                <span className="text-[11px] text-zinc-500">Your live review helps other diners</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => <button
    key={star}
    type="button"
    id={`rate-star-${star}`}
    onClick={() => setUserRating(star)}
    className={`p-1 transition-transform hover:scale-125 ${star <= userRating ? "text-amber-400" : "text-zinc-700"}`}
  >
                      <Star className="w-5 h-5 fill-current" />
                    </button>)}
                </div>
                <button
    id="btn-submit-dish-rating"
    disabled={isSubmittingRating || ratingSubmitted}
    onClick={handleRate}
    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 font-semibold text-xs transition-colors disabled:opacity-50"
  >
                  {ratingSubmitted ? <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                    </span> : isSubmittingRating ? "Saving..." : "Submit"}
                </button>
              </div>
            </div>

            {
    /* Footer Action: Quantity & Add to Cart */
  }
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-medium">Quantity</span>
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl">
                  <button
    id="btn-detail-dec"
    onClick={() => updateQuantity(foodId, Math.max(0, currentQty - 1))}
    disabled={currentQty === 0}
    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-sm text-amber-400 min-w-[20px] text-center">
                    {currentQty || 1}
                  </span>
                  <button
    id="btn-detail-inc"
    onClick={() => {
      if (currentQty === 0) {
        addToCart(food, 1);
      } else {
        updateQuantity(foodId, currentQty + 1);
      }
    }}
    className="p-1 text-zinc-400 hover:text-white transition-colors"
  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
    id="btn-detail-add-cart"
    disabled={!food.isAvailable || isClosed}
    onClick={() => {
      if (isClosed) {
        info("The restaurant is currently closed for orders.");
        return;
      }
      if (currentQty === 0) {
        addToCart(food, 1);
      }
      success(`Added ${food.name} to order!`);
      onClose();
    }}
    className="btn-3d flex-1 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm disabled:opacity-50"
  >
                {!food.isAvailable ? "Item Sold Out" : isClosed ? "Restaurant Closed" : "Add to Order"}
              </button>
            </div>
          </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
};
export {
  FoodDetailModal
};
