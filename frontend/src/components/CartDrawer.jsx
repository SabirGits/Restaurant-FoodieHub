import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  QrCode,
  Banknote,
  Copy,
  ChevronRight
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
const CartDrawer = ({ onOrderPlaced }) => {
  const {
    cart,
    currentTable,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    gstAmount,
    serviceChargeAmount,
    grandTotal,
    settings,
    isCartOpen,
    setIsCartOpen
  } = useCart();
  const { success, error, info } = useNotification();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const isClosed = settings && !settings.isOpen;
  const handleCopyUpi = () => {
    if (!settings?.upiId) return;
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUpi(true);
    info("UPI ID copied to clipboard");
    setTimeout(() => setCopiedUpi(false), 2500);
  };
  const handlePlaceOrder = async () => {
    if (isClosed) {
      error("The restaurant is currently closed for orders.");
      return;
    }
    if (cart.length === 0) {
      error("Your cart is empty.");
      return;
    }
    if (!currentTable) {
      error("Please specify a dining table.");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        tableNumber: currentTable,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: cart.map((item) => ({
          foodId: item.food.id || item.food._id,
          quantity: item.quantity
        })),
        paymentMethod,
        notes: notes.trim()
      };
      const res = await api.createOrder(orderPayload);
      if (res.success && res.data) {
        success(`Order #${res.data.orderNumber} placed successfully!`);
        clearCart();
        setIsCartOpen(false);
        onOrderPlaced(res.data);
      }
    } catch (err) {
      error(err.message || "Failed to submit order");
    } finally {
      setIsPlacingOrder(false);
    }
  };
  if (!isCartOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
        <motion.div
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    transition={{ type: "spring", damping: 25, stiffness: 200 }}
    className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-premium text-zinc-100"
  >
          {
    /* Header */
  }
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white leading-tight">Your Dining Cart</h3>
                <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <span>Dining at Table</span>
                  <strong className="text-amber-400 font-bold">{currentTable}</strong>
                </div>
              </div>
            </div>

            <button
    id="close-cart-drawer"
    onClick={() => setIsCartOpen(false)}
    className="icon-btn p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
  >
              <X className="w-5 h-5" />
            </button>
          </div>

          {
    /* Body: Cart Items / Empty State */
  }
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {cart.length === 0 ? <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-semibold text-zinc-300">Your cart is empty</h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Explore our authentic starters, dum biryanis, curries, and drinks to add to your order.
                </p>
                <button
    onClick={() => setIsCartOpen(false)}
    className="mt-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
  >
                  Browse Menu
                </button>
              </div> : <>
                {
    /* List of Cart Items */
  }
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold uppercase tracking-[0.14em]">
                    <span>Order Items ({cart.length})</span>
                    <button
    id="btn-clear-cart"
    onClick={clearCart}
    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 normal-case font-normal text-xs"
  >
                      <Trash2 className="w-3 h-3" /> Clear all
                    </button>
                  </div>

                  {cart.map((item) => {
    const foodId = item.food.id || item.food._id;
    const itemTotal = item.food.price * item.quantity;
    return <div
      key={foodId}
      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-amber-500/25 transition-colors"
    >
                        <img
      src={item.food.image}
      alt={item.food.name}
      className="w-16 h-16 rounded-xl object-cover bg-zinc-800 shrink-0"
    />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[13px] text-zinc-100 truncate">
                            {item.food.name}
                          </h4>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            ₹{item.food.price} × {item.quantity}
                          </div>
                          <div className="text-sm font-bold text-amber-400 mt-1 tabular-nums">
                            ₹{itemTotal}
                          </div>
                        </div>

                        {
      /* Quantity controls */
    }
                        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1">
                          <button
      id={`cart-dec-${foodId}`}
      onClick={() => updateQuantity(foodId, item.quantity - 1)}
      className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800"
    >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-[13px] font-bold text-white tabular-nums">
                            {item.quantity}
                          </span>
                          <button
      id={`cart-inc-${foodId}`}
      onClick={() => updateQuantity(foodId, item.quantity + 1)}
      className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800"
    >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>;
  })}
                </div>

                {
    /* Customer Details Form (fully optional — order can be placed without these) */
  }
                <div className="space-y-3 pt-2">
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-[0.14em]">
                    Customer Information (Optional)
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-2">
                      Guest Name <span className="text-zinc-500">(optional)</span>
                    </label>
                    <input
    id="cart-customer-name"
    type="text"
    placeholder="Leave blank to order as a guest"
    value={customerName}
    onChange={(e) => setCustomerName(e.target.value)}
    className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 placeholder:text-zinc-500 transition-all"
  />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-2">
                      Phone Number <span className="text-zinc-500">(optional, for SMS receipt)</span>
                    </label>
                    <input
    id="cart-customer-phone"
    type="tel"
    placeholder="+91 98765 43210"
    value={customerPhone}
    onChange={(e) => setCustomerPhone(e.target.value)}
    className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 placeholder:text-zinc-500 transition-all"
  />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-2">
                      Cooking Notes / Spice Preference
                    </label>
                    <input
    id="cart-order-notes"
    type="text"
    placeholder="e.g. Less spicy, extra onions & lemon..."
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 placeholder:text-zinc-500 transition-all"
  />
                  </div>
                </div>

                {
    /* Payment Selection */
  }
                <div className="space-y-3 pt-2">
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-[0.14em]">
                    Payment Method
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
    type="button"
    id="pay-upi"
    onClick={() => setPaymentMethod("UPI")}
    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${paymentMethod === "UPI" ? "bg-amber-500/12 border-amber-500 text-amber-400" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"}`}
  >
                      <QrCode className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-semibold">Online Payment</span>
                      <span className="text-[10px] text-zinc-500">Scan & Pay via UPI</span>
                    </button>

                    <button
    type="button"
    id="pay-cash"
    onClick={() => setPaymentMethod("Cash")}
    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${paymentMethod === "Cash" ? "bg-amber-500/12 border-amber-500 text-amber-400" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"}`}
  >
                      <Banknote className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-semibold">Cash on Delivery</span>
                      <span className="text-[10px] text-zinc-500">Pay at your table</span>
                    </button>
                  </div>

                  {
    /* UPI QR Code Container if Online Payment selected */
  }
                  {paymentMethod === "UPI" && settings && <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Scan & Pay Using Any UPI App
                      </span>

                      {settings.upiQrImage ? <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-2xl shadow-premium flex items-center justify-center">
                          <img
    src={settings.upiQrImage}
    alt="UPI QR Code"
    className="w-full h-full object-contain"
  />
                        </div> : <div className="py-4 text-xs text-zinc-500">Generating UPI QR...</div>}

                      <div className="flex items-center justify-center gap-2 pt-1 text-xs">
                        <span className="text-zinc-400 font-mono">{settings.upiId}</span>
                        <button
    type="button"
    onClick={handleCopyUpi}
    className="p-1 text-amber-400 hover:text-amber-300"
    title="Copy UPI ID"
  >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        GPay • PhonePe • Paytm • BHIM • Amazon Pay • Cards & Wallets
                      </div>
                    </div>}

                  {paymentMethod === "Cash" && <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
                      💵 Pay cash (or card) directly to your server when they bring the printed invoice to Table {currentTable}.
                    </div>}
                </div>

                {
    /* Authoritative Tax & Bill Breakdown */
  }
                <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Items Subtotal</span>
                    <span className="text-zinc-200 tabular-nums">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>GST ({settings?.gstPercentage ?? 5}% CGST + SGST)</span>
                    <span className="text-zinc-200 tabular-nums">₹{gstAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Service Charge ({settings?.serviceChargePercentage ?? 2.5}%)</span>
                    <span className="text-zinc-200 tabular-nums">₹{serviceChargeAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-zinc-800">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">Grand Total</span>
                    <span className="font-serif text-2xl font-bold text-amber-400 tabular-nums">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </>}
          </div>

          {
    /* Footer Place Order Button */
  }
          {cart.length > 0 && <div className="p-5 sm:p-6 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
              <button
    id="btn-place-order"
    disabled={isPlacingOrder || isClosed}
    onClick={handlePlaceOrder}
    className="btn-3d w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
  >
                {isPlacingOrder ? <span>Transmitting to Kitchen...</span> : <>
                    <span>Confirm Order • ₹{grandTotal.toFixed(2)}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>}
              </button>
            </div>}
        </motion.div>
      </div>
    </AnimatePresence>;
};
export {
  CartDrawer
};
