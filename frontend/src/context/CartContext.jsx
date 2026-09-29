import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
const CartContext = createContext(void 0);
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("smart_restaurant_cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [currentTable, setCurrentTableState] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get("table");
      if (urlTable) {
        localStorage.setItem("smart_restaurant_table", urlTable.toUpperCase());
        return urlTable.toUpperCase();
      }
    }
    return localStorage.getItem("smart_restaurant_table") || "T-01";
  });
  const [settings, setSettings] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastCreatedOrderId, setLastCreatedOrderId] = useState(null);
  const setCurrentTable = (tbl) => {
    const formatted = tbl.toUpperCase().trim();
    setCurrentTableState(formatted);
    localStorage.setItem("smart_restaurant_table", formatted);
  };
  const refreshSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (e) {
      console.warn("Failed to load restaurant settings:", e);
    }
  };
  useEffect(() => {
    refreshSettings();
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("smart_restaurant_cart", JSON.stringify(cart));
    } catch (e) {
    }
  }, [cart]);
  useEffect(() => {
    const handleUrlTable = () => {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get("table");
      if (urlTable && urlTable.toUpperCase() !== currentTable) {
        setCurrentTable(urlTable);
      }
    };
    handleUrlTable();
    window.addEventListener("popstate", handleUrlTable);
    return () => window.removeEventListener("popstate", handleUrlTable);
  }, [currentTable]);
  const addToCart = (food, quantity = 1) => {
    setCart((prev) => {
      const foodId = food.id || food._id;
      const existing = prev.find((item) => (item.food.id || item.food._id) === foodId);
      if (existing) {
        return prev.map(
          (item) => (item.food.id || item.food._id) === foodId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { food, quantity }];
    });
  };
  const removeFromCart = (foodId) => {
    setCart((prev) => prev.filter((item) => (item.food.id || item.food._id) !== foodId));
  };
  const updateQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCart(
      (prev) => prev.map(
        (item) => (item.food.id || item.food._id) === foodId ? { ...item, quantity } : item
      )
    );
  };
  const clearCart = () => {
    setCart([]);
  };
  const getItemQuantity = (foodId) => {
    const item = cart.find((i) => (i.food.id || i.food._id) === foodId);
    return item ? item.quantity : 0;
  };
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const gstRate = settings?.gstPercentage ?? 5;
  const gstAmount = Number((subtotal * gstRate / 100).toFixed(2));
  const serviceChargeRate = settings?.serviceChargePercentage ?? 2.5;
  const serviceChargeAmount = Number((subtotal * serviceChargeRate / 100).toFixed(2));
  const grandTotal = Number((subtotal + gstAmount + serviceChargeAmount).toFixed(2));
  return <CartContext.Provider
    value={{
      cart,
      currentTable,
      setCurrentTable,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemQuantity,
      itemCount,
      subtotal,
      gstAmount,
      serviceChargeAmount,
      grandTotal,
      settings,
      refreshSettings,
      isCartOpen,
      setIsCartOpen,
      lastCreatedOrderId,
      setLastCreatedOrderId
    }}
  >
      {children}
    </CartContext.Provider>;
};
const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
export {
  CartProvider,
  useCart
};
