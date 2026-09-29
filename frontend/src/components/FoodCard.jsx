import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Star, Clock, Plus, Minus, UtensilsCrossed } from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";

// Used only when a dish's own photo fails to load. This used to point at a
// second external Unsplash photo as a "fallback" — but that meant every
// broken/blocked image on the menu (slow network, ad-blocker, a dead link)
// silently showed that ONE unrelated stock photo instead. A plain local
// icon can never be the wrong dish, so it's a safer failure state.
const FoodImageFallback = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-zinc-800 text-zinc-500">
    <UtensilsCrossed className="w-8 h-8" strokeWidth={1.5} />
    <span className="text-[10px] uppercase tracking-wide">Photo unavailable</span>
  </div>
);
const FoodCard = ({ food, onSelect }) => {
  const { addToCart, updateQuantity, getItemQuantity, settings } = useCart();
  const { info } = useNotification();
  const [likes, setLikes] = useState(food.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    // Deliberately gentle: max ~4deg of rotation keeps it premium, not toy-like
    const ry = (px - 0.5) * 4;
    const rx = (0.5 - py) * 3.2;
    setTiltStyle({
      "--rx": `${rx}deg`,
      "--ry": `${ry}deg`,
      "--mx": `${px * 100}%`,
      "--my": `${py * 100}%`
    });
  };
  const handlePointerLeave = () => {
    setTiltStyle({ "--rx": "0deg", "--ry": "0deg" });
  };
  const foodId = food.id || food._id;
  const currentQty = getItemQuantity(foodId);
  const isClosed = settings && !settings.isOpen;
  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await api.toggleLike(foodId);
      if (res.success && res.data) {
        setLikes(res.data.likes);
        setIsLiked(res.data.liked);
      }
    } catch (err) {
      console.warn("Like failed:", err);
    } finally {
      setIsLiking(false);
    }
  };
  const handleAdd = (e) => {
    e.stopPropagation();
    if (isClosed) {
      info("The restaurant is currently closed for orders.");
      return;
    }
    if (!food.isAvailable) {
      info("This item is currently sold out.");
      return;
    }
    addToCart(food, 1);
  };
  const handleIncrease = (e) => {
    e.stopPropagation();
    if (isClosed) return;
    updateQuantity(foodId, currentQty + 1);
  };
  const handleDecrease = (e) => {
    e.stopPropagation();
    updateQuantity(foodId, currentQty - 1);
  };
  return <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
    style={tiltStyle}
    onPointerMove={handlePointerMove}
    onPointerLeave={handlePointerLeave}
    className={`food-card-3d tilt-card group relative bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-premium flex flex-col cursor-pointer ${!food.isAvailable ? "opacity-60" : ""}`}
    onClick={() => onSelect(food)}
  >
      <div className="food-card-3d-edge absolute inset-0 z-20 pointer-events-none rounded-3xl" />
      <div className="tilt-card-shine absolute inset-0 z-10" />
      {
    /* Image Container */
  }
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800 cursor-pointer">
        {imgError ? (
          <FoodImageFallback />
        ) : (
          <img
    src={food.image}
    alt={food.name}
    onError={() => setImgError(true)}
    className="tilt-card-pop w-full h-full object-cover"
    loading="lazy"
  />
        )}

        {
    /* Gradient Overlay */
  }
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25 pointer-events-none" />

        {
    /* Top Badges: Veg/Non-Veg & Popular */
  }
        <div className="absolute top-3 left-3 flex items-center gap-2 tilt-card-chip">
          {
    /* Veg / Non-Veg Standard Emblem */
  }
          <div
    className={`w-5 h-5 rounded-[5px] flex items-center justify-center bg-white shadow-sm ${food.isVeg ? "border-2 border-emerald-600" : "border-2 border-rose-600"}`}
    title={food.isVeg ? "Pure Vegetarian" : "Non-Vegetarian"}
  >
            {food.isVeg ? <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> : <div className="w-0 h-0 border-x-[4.5px] border-x-transparent border-b-[9px] border-b-rose-600" />}
          </div>

          {food.isPopular && <span className="px-2.5 py-1 rounded-full bg-amber-500 text-zinc-950 font-semibold text-[9px] tracking-[0.12em] uppercase shadow-sm">
              Chef Pick
            </span>}

          {!food.isAvailable && <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-semibold text-[9px] tracking-[0.12em] uppercase shadow-sm">
              Sold Out
            </span>}
        </div>

        {
    /* Top Right: Like Button */
  }
        <button
    id={`btn-like-${foodId}`}
    onClick={handleLike}
    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all tilt-card-chip ${isLiked ? "bg-rose-500 text-white" : "bg-black/50 text-white/80 hover:text-white hover:bg-black/70"}`}
    title="Save to favorites"
  >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
        </button>

        {
    /* Bottom Info inside Image */
  }
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 tilt-card-chip">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-amber-400">
            <Star className="w-3 h-3 fill-current" />
            <span>{food.rating || 4.8}</span>
            <span className="text-white/60 font-normal">({food.ratingsCount || 1})</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-white/85">
            <Clock className="w-3 h-3" />
            <span>{food.preparationTimeMinutes || 15} min</span>
          </div>
        </div>
      </div>

      {
    /* Content */
  }
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between cursor-pointer">
        <div>
          <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-[0.14em] mb-1.5">
            {food.category}
          </div>
          <h3 className="font-serif font-bold text-base sm:text-lg text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug">
            {food.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
            {food.description}
          </p>
        </div>

        {
    /* Price & Add to Cart Controls */
  }
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-[0.12em]">Price</span>
            <div className="food-card-price text-xl font-bold text-amber-400 tabular-nums leading-tight mt-0.5">
              ₹{food.price}
            </div>
          </div>

          <div>
            {currentQty > 0 ? <div
    className="btn-3d flex items-center gap-2.5 bg-amber-500 text-zinc-950 px-2.5 py-2 rounded-xl font-bold text-sm"
    onClick={(e) => e.stopPropagation()}
  >
                <button
    id={`btn-dec-${foodId}`}
    onClick={handleDecrease}
    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/15 transition-colors"
  >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="min-w-[16px] text-center font-bold text-sm tabular-nums">
                  {currentQty}
                </span>
                <button
    id={`btn-inc-${foodId}`}
    onClick={handleIncrease}
    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/15 transition-colors"
  >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div> : <button
    id={`btn-add-${foodId}`}
    disabled={!food.isAvailable || isClosed}
    onClick={handleAdd}
    className="btn-3d flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-amber-500 border border-zinc-700 hover:border-amber-500 text-zinc-200 hover:text-zinc-950 font-semibold text-sm disabled:opacity-40 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-200"
  >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>}
          </div>
        </div>
      </div>
    </motion.div>;
};
export {
  FoodCard
};
