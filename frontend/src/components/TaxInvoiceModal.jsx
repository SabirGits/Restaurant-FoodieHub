import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Printer, CheckCircle2 } from "lucide-react";
const TaxInvoiceModal = ({ order, settings, onClose, onTrackOrder, justPlaced }) => {
  const invoiceRef = useRef(null);
  if (!order) return null;
  const handlePrint = () => {
    window.print();
  };
  const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const cgstRate = ((order.gstRate || 5) / 2).toFixed(1);
  const sgstRate = cgstRate;
  const halfGst = (order.gstAmount / 2).toFixed(2);
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
        <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-premium text-zinc-100 relative my-4 max-h-[94vh] flex flex-col"
  >
          {
    /* Action Bar */
  }
          <div className="px-4 py-3.5 border-b border-zinc-800 flex items-center justify-between gap-2 bg-zinc-950 no-print shrink-0">
            <span className="font-serif font-bold text-base text-white">Tax Invoice</span>
            <div className="flex items-center gap-2">
              {onTrackOrder && <button
    id="btn-track-from-invoice"
    onClick={onTrackOrder}
    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-[11px] transition-colors"
  >
                  <span>Track Live Order</span>
                </button>}
              <button
    id="btn-print-receipt"
    onClick={handlePrint}
    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-[11px] transition-colors"
  >
                <Printer className="w-4 h-4" />
                <span>Print Bill</span>
              </button>
              <button
    onClick={onClose}
    className="icon-btn p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
  >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {justPlaced && <div className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-2 no-print shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-emerald-500">
                Order placed successfully! Here's your digital bill.
              </span>
            </div>}

          {
    /* Printable Invoice Paper Sheet */
  }
          <div ref={invoiceRef} className="p-5 bg-white text-zinc-950 font-sans text-[11px] printable-area relative overflow-y-auto flex-1">
            {
    /* Restaurant Header */
  }
            <div className="text-center pb-3.5 border-b-2 border-zinc-900 space-y-1">
              {settings?.logoUrl && <img
    src={settings.logoUrl}
    alt="Logo"
    className="w-12 h-12 mx-auto rounded-full object-cover border border-zinc-300 mb-2"
  />}
              <div className="font-serif text-xl font-bold tracking-[0.04em] text-zinc-900 uppercase leading-tight">
                {settings?.restaurantName || "Royal Spice Gourmet"}
              </div>
              <div className="text-[11px] text-zinc-600 font-medium">
                {settings?.tagline || "Crafted Dining & Smart QR Ordering"}
              </div>
              <div className="text-[11px] text-zinc-600">
                {settings?.address || "42 Gourmet Boulevard, Metro City"}
              </div>
              <div className="text-[11px] text-zinc-600">
                Ph: {settings?.phone || "+91 98765 43210"} | Email: {settings?.email || "billing@restaurant.com"}
              </div>
              <div className="text-[11px] font-mono font-bold text-zinc-800 pt-1">
                GSTIN: {settings?.gstNumber || "27AABCR1234F1ZP"}
              </div>
            </div>

            {
    /* Bill Details Info Header */
  }
            <div className="py-3 border-b border-zinc-300 grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
              <div>
                <div><strong>Invoice #:</strong> {order.orderNumber}</div>
                <div><strong>Table:</strong> Table {order.tableNumber}</div>
                <div><strong>Guest:</strong> {order.customerName}</div>
              </div>
              <div className="text-right">
                <div><strong>Date:</strong> {formattedDate}</div>
                <div><strong>Payment:</strong> {order.paymentMethod}</div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className={order.paymentStatus === "Paid" ? "text-emerald-700 font-bold uppercase" : "text-amber-700 font-bold"}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {
    /* Table Item Rows */
  }
            <table className="w-full my-2 text-[10px]">
              <thead>
                <tr className="border-b border-zinc-400 text-zinc-700 font-bold">
                  <th className="text-left py-1">Item Description</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Rate</th>
                  <th className="text-right py-1">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {order.items.map((item, idx) => <tr key={idx}>
                    <td className="py-1.5 text-zinc-900 font-medium">
                      {item.isVeg ? "\u{1F7E2}" : "\u{1F534}"} {item.name}
                    </td>
                    <td className="py-1.5 text-center text-zinc-700">{item.quantity}</td>
                    <td className="py-1.5 text-right text-zinc-700">₹{item.price.toFixed(2)}</td>
                    <td className="py-1.5 text-right text-zinc-900 font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>)}
              </tbody>
            </table>

            {
    /* Tax & Total Summary */
  }
            <div className="pt-1.5 border-t-2 border-zinc-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between text-zinc-700">
                <span>Subtotal (Food & Beverages)</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-zinc-600">
                <span>CGST ({cgstRate}%)</span>
                <span>₹{halfGst}</span>
              </div>

              <div className="flex justify-between text-zinc-600">
                <span>SGST ({sgstRate}%)</span>
                <span>₹{halfGst}</span>
              </div>

              {order.serviceChargeAmount > 0 && <div className="flex justify-between text-zinc-600">
                  <span>Service Charge ({order.serviceChargeRate || 2.5}%)</span>
                  <span>₹{order.serviceChargeAmount.toFixed(2)}</span>
                </div>}

              {order.discountAmount > 0 && <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Special Discount</span>
                  <span>- ₹{order.discountAmount.toFixed(2)}</span>
                </div>}

              <div className="flex justify-between text-xs font-extrabold text-zinc-950 pt-1.5 border-t-2 border-zinc-900">
                <span>NET PAYABLE AMOUNT</span>
                <span>₹{order.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {
    /* Paid Stamp or Notice */
  }
            <div className="relative mt-4">
              {order.paymentStatus === "Paid" ? <div className="py-2 border border-emerald-600 rounded-lg text-center text-emerald-800 font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-1 bg-emerald-50">
                  <CheckCircle2 className="w-4 h-4" /> Paid in Full via {order.paymentMethod}
                </div> : <div className="py-2 border border-amber-600 rounded-lg text-center text-amber-800 font-bold uppercase text-xs bg-amber-50">
                  Payment Due: ₹{order.grandTotal.toFixed(2)} ({order.paymentMethod})
                </div>}

              {
    /* Official Hotel Stamp / Seal (Muhar) — overlaps the payment banner like a real ink stamp */
  }
              {settings?.stampUrl && <img
    src={settings.stampUrl}
    alt="Official Seal"
    className="pointer-events-none select-none w-14 h-14 object-contain absolute -top-4 right-1 opacity-80 -rotate-12 mix-blend-multiply"
  />}
            </div>

            {
    /* Scan & Pay QR — shown on the invoice itself when payment is still pending */
  }
            {order.paymentStatus !== "Paid" && order.paymentMethod !== "Cash" && settings?.upiQrImage && <div className="mt-3 pt-2.5 border-t border-dashed border-zinc-300 flex items-center gap-2">
                <div className="w-12 h-12 bg-white border border-zinc-300 rounded-lg p-1 shrink-0">
                  <img src={settings.upiQrImage} alt="Scan to pay" className="w-full h-full object-contain" />
                </div>
                <div className="text-[10px] text-zinc-600 leading-relaxed">
                  <div className="font-bold text-zinc-800">Scan this QR with any UPI app to pay now</div>
                  <div className="font-mono">{settings.upiId}</div>
                </div>
              </div>}

            {
    /* Footer Greeting */
  }
            <div className="mt-3 pt-2.5 border-t border-zinc-300 text-center text-[9px] text-zinc-500 space-y-0.5">
              <div>Thank you for dining with us at {settings?.restaurantName || "Royal Spice"}!</div>
              <div>FSSAI Lic. No: 11521018000452 • Computer Generated Tax Invoice</div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
};
export {
  TaxInvoiceModal
};
