import { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  Leaf,
  Timer,
  ShieldCheck,
  Award
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { FoodCard } from "../components/FoodCard";
import { FoodDetailModal } from "../components/FoodDetailModal";
import { CartDrawer } from "../components/CartDrawer";
import { OrderTrackingModal } from "../components/OrderTrackingModal";
import { TaxInvoiceModal } from "../components/TaxInvoiceModal";
import { ChatAssistant } from "../components/ChatAssistant";
import { HeroSlider } from "../components/HeroSlider";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
/** The floating "Chef's Pick" spotlight image — a separate close-up plate
 * shot so it reads as its own 3D object, distinct from the hero backdrop. */
const SPOTLIGHT_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80";

const CustomerHome = () => {
  const { currentTable, itemCount, setIsCartOpen, settings } = useCart();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedFood, setSelectedFood] = useState(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);
  const [freshOrder, setFreshOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // The dining assistant is now launched from the navbar "Ask Us" button
  // instead of a floating button at the bottom of the menu.
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  // Gentle pointer-tilt for the "Chef's Pick" spotlight card (same restrained
  // ~4deg max as the dish cards further down the page).
  const [tiltStyle, setTiltStyle] = useState({});
  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTiltStyle({
      "--rx": `${(0.5 - py) * 3.2}deg`,
      "--ry": `${(px - 0.5) * 4}deg`,
      "--mx": `${px * 100}%`,
      "--my": `${py * 100}%`
    });
  };
  const handlePointerLeave = () => setTiltStyle({ "--rx": "0deg", "--ry": "0deg" });
  const loadMenu = async () => {
    setIsLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        api.getMenu({
          search: searchQuery,
          category: selectedCategory === "All" ? void 0 : selectedCategory,
          vegOnly: dietFilter === "Veg",
          nonVegOnly: dietFilter === "NonVeg",
          sortBy
        }),
        api.getCategories()
      ]);
      if (menuRes.success && menuRes.data) {
        setFoods(menuRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error("Failed to load menu:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadMenu();
  }, [selectedCategory, dietFilter, sortBy]);
  useEffect(() => {
    const handler = setTimeout(() => {
      loadMenu();
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const handleOrderPlaced = (order) => {
    setFreshOrder(order);
  };
  return <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      {
    /* Top Navbar */
  }
      <Navbar
    onSearchChange={setSearchQuery}
    searchValue={searchQuery}
    onAskClick={() => setIsAssistantOpen(true)}
  />

      {
    /* Hero Banner — "Good Food, Good Mood" (FoodieHub reference design) */
  }
      <section className="scene-3d relative bg-zinc-950 border-b border-amber-500/15 overflow-hidden isolate">
        {
    /* --- Cinematic food photograph + theme-aware scrim ---
       Purely decorative: it sits behind the existing hero content and never
       intercepts clicks. A fallback chain keeps the hero looking right even
       if the primary photo can't be reached. --- */
  }
        <HeroSlider />
        <div className="hero-scrim -z-10" />

        {
    /* --- Whisper-soft depth layers over the photograph --- */
  }
        <div className="grid-floor -z-10" />
        <div className="halo-3d w-[30rem] h-[30rem] -top-40 left-1/3 -z-10" />
        <div className="blob w-80 h-80 bg-amber-500 -top-24 -left-16 float-3d -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9 lg:py-11 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 lg:gap-10">
            <div className="max-w-2xl space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold tracking-[0.1em] uppercase backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Contactless QR Ordering • Table {currentTable}</span>
              </div>

              <h1 className="hero-title font-serif text-[2.25rem] sm:text-5xl lg:text-6xl font-bold text-white leading-[1.04]">
                Good Food
                <br />
                Good <span className="text-gold-gradient italic">Mood</span>
              </h1>

              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-amber-500/60" />
                <span className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-amber-400">
                  {settings?.restaurantName || "FoodieHub"}
                </span>
              </div>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                {settings?.tagline || "Experience heritage royal Indian flavours, tandoori masterpieces, and modern culinary creations directly from your table."}
              </p>

              {
    /* Restaurant Meta Badges */
  }
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {settings?.openingHours || "11:00 AM"} - {settings?.closingHours || "11:30 PM"}
                </span>
                <span className="hidden sm:inline text-zinc-700">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {settings?.address || "42 Gourmet Boulevard"}
                </span>
                <span className="hidden sm:inline text-zinc-700">•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  {settings?.phone || "+91 98765 43210"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-5 w-full md:w-auto md:min-w-[280px]">
              {
    /* Signature Dish — a genuinely 3D floating spotlight image.
       Tilts toward the pointer, sits in a glowing gradient frame, and is
       styled per-theme (dark: amber glow on ink; light: soft gold halo on
       ivory) so it reads as premium in both modes, not just an inverted photo. */
  }
              <div
    className="spotlight-frame tilt-card group relative rounded-[28px] p-[2px] w-full max-w-[280px] mx-auto md:mx-0 self-center md:self-auto"
    style={tiltStyle}
    onMouseMove={handlePointerMove}
    onMouseLeave={handlePointerLeave}
  >
                <div className="halo-3d spotlight-glow w-40 h-40 -top-8 -right-8 -z-10" />
                <div className="relative rounded-[26px] overflow-hidden aspect-[4/3] bg-zinc-900">
                  <div className="tilt-card-shine absolute inset-0 z-10" />
                  <img
    src={SPOTLIGHT_IMAGE}
    alt=""
    aria-hidden="true"
    loading="lazy"
    className="tilt-card-pop w-full h-full object-cover"
  />
                  <div className="absolute inset-0 spotlight-scrim" />
                  <div className="absolute bottom-3 left-3 right-3 tilt-card-chip flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold tracking-wide uppercase shadow">
                      Chef's Pick
                    </span>
                    <span className="flex items-center gap-1 text-white text-[11px] font-semibold drop-shadow">
                      <Award className="w-3 h-3 text-amber-300" />
                      4.9
                    </span>
                  </div>
                </div>
              </div>

              {
    /* Quick Dining Info Card */
  }
              <div className="tile-3d bob-3d glass-panel shadow-premium p-5 sm:p-6 rounded-3xl flex flex-col justify-between gap-5 w-full">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 block">
                    Your Current Order
                  </span>
                  <div className="font-serif text-2xl font-bold text-white mt-1.5 leading-snug">
                    {itemCount > 0 ? `${itemCount} dishes in cart` : "No items added yet"}
                  </div>
                  <div className="text-xs text-amber-400 mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Table {currentTable} • Live Kitchen Routing
                  </div>
                </div>

                <button
    onClick={() => setIsCartOpen(true)}
    className="btn-3d w-full py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2"
  >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Review Cart &amp; Bill</span>
                </button>
              </div>
            </div>
          </div>

          {
    /* Four trust badges with raised 3D "coin" icons, exactly as in the design */
  }
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            {[
              { Icon: Leaf, title: "Fresh Food", sub: "Daily" },
              { Icon: Timer, title: "Fast Service", sub: "Always" },
              { Icon: ShieldCheck, title: "Hygienic & Safe", sub: "Food" },
              { Icon: Award, title: "Best Taste", sub: "Guaranteed" }
            ].map(({ Icon, title, sub }) => (
              <div
                key={title}
                className="feature-tile flex flex-col items-center text-center gap-3 px-3 sm:px-4 py-5 sm:py-6 rounded-2xl glass-panel hover:border-amber-500/35"
              >
                <div className="feature-coin w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-zinc-950">
                  <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={2.1} />
                </div>
                <div className="leading-snug">
                  <div className="text-[12px] sm:text-sm font-semibold text-white">{title}</div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-400 tracking-wide uppercase mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {
    /* Main Interactive Menu Area */
  }
      <main id="menu-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {
    /* Search, Diet Filter & Sorting Controls */
  }
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {
    /* Search Input */
  }
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
    id="search-menu-input"
    type="text"
    placeholder="Search 105+ dishes, biryani, starters, pizza, shakes..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-11 pr-16 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 text-zinc-100 placeholder:text-zinc-500 transition-all"
  />
              {searchQuery && <button
    onClick={() => setSearchQuery("")}
    className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
  >
                  Clear
                </button>}
            </div>

            {
    /* Diet Filter & Sort Options */
  }
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {
    /* Veg / Non-Veg Toggle Group */
  }
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-1 shrink-0">
                <button
    id="filter-diet-all"
    onClick={() => setDietFilter("All")}
    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${dietFilter === "All" ? "bg-amber-500 text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}
  >
                  All
                </button>
                <button
    id="filter-diet-veg"
    onClick={() => setDietFilter("Veg")}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${dietFilter === "Veg" ? "bg-emerald-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}
  >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Veg
                </button>
                <button
    id="filter-diet-nonveg"
    onClick={() => setDietFilter("NonVeg")}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${dietFilter === "NonVeg" ? "bg-rose-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}
  >
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Non-Veg
                </button>
              </div>

              {
    /* Sort By Dropdown */
  }
              <div className="relative shrink-0">
                <select
    id="sort-menu-select"
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 pr-9 cursor-pointer transition-all"
  >
                  <option value="popular">Bestsellers First</option>
                  <option value="rating">Highest Rated ★</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {
    /* Category Pills Carousel */
  }
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            <button
    id="cat-pill-all"
    onClick={() => setSelectedCategory("All")}
    className={`px-4 py-2.5 rounded-full text-xs font-semibold shrink-0 transition-all ${selectedCategory === "All" ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-amber-500/30"}`}
  >
              All Categories ({foods.length})
            </button>

            {categories.map((cat) => {
    const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
    return <button
      key={cat.name}
      id={`cat-pill-${cat.slug}`}
      onClick={() => setSelectedCategory(cat.name)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold shrink-0 transition-all ${isSelected ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-amber-500/30"}`}
    >
                  <span>{cat.name}</span>
                  {cat.itemCount !== void 0 && <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? "bg-zinc-950 text-amber-400" : "bg-zinc-800 text-zinc-500"}`}
    >
                      {cat.itemCount}
                    </span>}
                </button>;
  })}
          </div>
        </div>

        {
    /* Results Info Bar */
  }
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800/70 mt-2">
          <span className="pt-4">
            Showing <strong className="text-white font-semibold">{foods.length}</strong> items in{" "}
            <span className="text-amber-400 font-semibold">{selectedCategory}</span>
          </span>
          {dietFilter !== "All" && <span className="text-zinc-500">
              Filtered by <strong>{dietFilter}</strong>
            </span>}
        </div>

        {
    /* Dishes Grid */
  }
        {isLoading ? <div className="py-28 text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <div className="text-zinc-400 text-sm font-medium">Preparing culinary menu…</div>
          </div> : foods.length === 0 ? <div className="py-20 text-center space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 shadow-premium">
            <div className="w-14 h-14 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">No dishes found matching your criteria</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try adjusting your search terms or selecting a different category from our 105+ item menu.
            </p>
            <button
    onClick={() => {
      setSearchQuery("");
      setSelectedCategory("All");
      setDietFilter("All");
    }}
    className="mt-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
  >
              Reset All Filters
            </button>
          </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
            {foods.map((food) => <FoodCard
    key={food.id || food._id}
    food={food}
    onSelect={(f) => setSelectedFood(f)}
  />)}
          </div>}
      </main>

      {
    /* Floating Sticky Mobile Order Bar */
  }
      {itemCount > 0 && <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
    onClick={() => setIsCartOpen(true)}
    className="w-full py-4 px-5 rounded-2xl bg-amber-500 text-zinc-950 font-bold text-sm shadow-premium flex items-center justify-between backdrop-blur-sm"
  >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-950 text-amber-400 text-xs flex items-center justify-center font-bold">
                {itemCount}
              </span>
              <span>View Table Order</span>
            </div>
            <span>Table {currentTable} →</span>
          </button>
        </div>}

      {
    /* Modals & Drawers */
  }
      <FoodDetailModal
    food={selectedFood}
    onClose={() => setSelectedFood(null)}
  />

      <CartDrawer
    onOrderPlaced={handleOrderPlaced}
  />

      <TaxInvoiceModal
    order={freshOrder}
    settings={settings}
    justPlaced
    onClose={() => setFreshOrder(null)}
    onTrackOrder={() => {
      if (freshOrder) {
        setActiveTrackingOrderId(freshOrder.id || freshOrder.orderNumber);
      }
      setFreshOrder(null);
    }}
  />

      <OrderTrackingModal
    orderId={activeTrackingOrderId}
    onClose={() => setActiveTrackingOrderId(null)}
  />

      {
    /* Dining assistant panel — opened from the navbar "Ask Us" button */
  }
      <ChatAssistant
    isOpen={isAssistantOpen}
    onClose={() => setIsAssistantOpen(false)}
  />
    </div>;
};
export {
  CustomerHome
};
