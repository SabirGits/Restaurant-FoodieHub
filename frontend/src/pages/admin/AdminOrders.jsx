import { useState, useEffect } from "react";
import {
  Search,
  Printer,
  RefreshCw
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import { useCart } from "../../context/CartContext";
import { TaxInvoiceModal } from "../../components/TaxInvoiceModal";
const STATUS_TABS = [
  "All",
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Served",
  "Completed",
  "Cancelled"
];
const AdminOrders = () => {
  const { settings } = useCart();
  const { success, error } = useNotification();
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOrders({
        status: selectedStatus === "All" ? void 0 : selectedStatus,
        search: searchQuery
      });
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.warn("Failed to load orders:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6e3);
    return () => clearInterval(interval);
  }, [selectedStatus, searchQuery]);
  const handleUpdateStatus = async (orderId, status) => {
    try {
      const res = await api.updateOrderStatus(orderId, status);
      if (res.success) {
        success(`Order status updated to ${status}`);
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(res.data);
        }
      }
    } catch (err) {
      error(err.message || "Status update failed");
    }
  };
  const handleUpdatePayment = async (orderId, paymentStatus) => {
    try {
      const res = await api.updateOrderPayment(orderId, paymentStatus);
      if (res.success) {
        success(`Payment marked as ${paymentStatus}`);
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(res.data);
        }
      }
    } catch (err) {
      error(err.message || "Payment status update failed");
    }
  };
  return <AdminLayout>
      <div className="space-y-6">
        {
    /* Page Header */
  }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Orders & Billing Management
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Live POS order queue, kitchen progression, payments and printed invoices.
            </p>
          </div>

          <button
    onClick={fetchOrders}
    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors w-fit"
  >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Orders</span>
          </button>
        </div>

        {
    /* Search & Status Filters */
  }
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
    type="text"
    placeholder="Search by Order #, Guest name, or Table (e.g. ORD-9821, T-03)..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500 text-zinc-100 placeholder:text-zinc-500"
  />
          </div>

          {
    /* Status Pills */
  }
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {STATUS_TABS.map((tab) => <button
    key={tab}
    id={`tab-${tab.toLowerCase()}`}
    onClick={() => setSelectedStatus(tab)}
    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${selectedStatus === tab ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"}`}
  >
                {tab}
              </button>)}
          </div>
        </div>

        {
    /* Orders Table & Detail Split View */
  }
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {
    /* Orders List */
  }
          <div className="lg:col-span-2 space-y-3">
            {isLoading && orders.length === 0 ? <div className="py-20 text-center text-xs text-zinc-500">Loading orders...</div> : orders.length === 0 ? <div className="py-16 text-center text-xs text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                No orders match your filter criteria.
              </div> : <div className="space-y-2.5">
                {orders.map((order) => {
    const isSelected = selectedOrder?.id === order.id;
    return <div
      key={order.id}
      onClick={() => setSelectedOrder(order)}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? "bg-zinc-900 border-amber-500/80 shadow-lg ring-1 ring-amber-500/30" : "bg-zinc-900/70 hover:bg-zinc-900 border-zinc-800"}`}
    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-white">
                            {order.orderNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-amber-400 text-xs font-bold">
                            Table {order.tableNumber}
                          </span>
                          <span className="text-xs text-zinc-400">{order.customerName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${order.orderStatus === "Completed" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : order.orderStatus === "Preparing" ? "bg-amber-950 text-amber-400 border border-amber-800" : order.orderStatus === "Ready" ? "bg-blue-950 text-blue-400 border border-blue-800" : order.orderStatus === "Cancelled" ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-zinc-800 text-zinc-300"}`}
    >
                            {order.orderStatus}
                          </span>
                          <span className="font-extrabold text-sm text-amber-400">
                            ₹{order.grandTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <span>{order.items.length} items</span>
                          <span>•</span>
                          <span>Pay: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                        </div>
                        <div>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>;
  })}
              </div>}
          </div>

          {
    /* Selected Order Detailed Drawer / Card */
  }
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 h-fit sticky top-20">
            {selectedOrder ? <>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">
                      {selectedOrder.orderNumber}
                    </h3>
                    <div className="text-xs text-amber-400 font-semibold">
                      Table {selectedOrder.tableNumber} • {selectedOrder.customerName}
                    </div>
                  </div>

                  <button
    id="btn-print-active-invoice"
    onClick={() => setInvoiceOrder(selectedOrder)}
    className="p-2 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-colors"
    title="Print Tax Invoice"
  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>

                {
    /* Items List */
  }
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Ordered Dishes
                  </span>
                  {selectedOrder.items.map((item, idx) => <div key={idx} className="flex justify-between text-xs text-zinc-300">
                      <span>
                        {item.quantity} × {item.name}
                      </span>
                      <span className="font-semibold text-zinc-200">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>)}
                </div>

                {selectedOrder.notes && <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-amber-300">
                    <strong>Guest Note:</strong> {selectedOrder.notes}
                  </div>}

                {
    /* Billing details */
  }
                <div className="space-y-1.5 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({selectedOrder.gstRate}%):</span>
                    <span>₹{selectedOrder.gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge ({selectedOrder.serviceChargeRate}%):</span>
                    <span>₹{selectedOrder.serviceChargeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-white pt-1 border-t border-zinc-800">
                    <span>Grand Total:</span>
                    <span className="text-amber-400">₹{selectedOrder.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {
    /* Status Transitions */
  }
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Update Kitchen / Order Status
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
    onClick={() => handleUpdateStatus(selectedOrder.id, "Confirmed")}
    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
  >
                      Accept
                    </button>
                    <button
    onClick={() => handleUpdateStatus(selectedOrder.id, "Preparing")}
    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-600 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
  >
                      Cook (Preparing)
                    </button>
                    <button
    onClick={() => handleUpdateStatus(selectedOrder.id, "Ready")}
    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
  >
                      Ready for Server
                    </button>
                    <button
    onClick={() => handleUpdateStatus(selectedOrder.id, "Served")}
    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-purple-600 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
  >
                      Delivered (Served)
                    </button>
                    <button
    onClick={() => handleUpdateStatus(selectedOrder.id, "Completed")}
    className="py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
  >
                      Complete & Close
                    </button>
                    <button
    onClick={() => handleUpdateStatus(selectedOrder.id, "Cancelled")}
    className="py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-xs font-semibold text-rose-300 transition-colors"
  >
                      Cancel Order
                    </button>
                  </div>
                </div>

                {
    /* Payment Status */
  }
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Settle Payment ({selectedOrder.paymentMethod})
                  </span>
                  <div className="flex gap-2">
                    <button
    onClick={() => handleUpdatePayment(selectedOrder.id, "Paid")}
    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
  >
                      Mark as Paid
                    </button>
                    <button
    onClick={() => handleUpdatePayment(selectedOrder.id, "Cash Pending")}
    className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
  >
                      Cash Pending
                    </button>
                  </div>
                </div>
              </> : <div className="py-24 text-center text-xs text-zinc-500">
                Select an order on the left to view complete details, settle payments, or print official tax receipts.
              </div>}
          </div>
        </div>
      </div>

      <TaxInvoiceModal
    order={invoiceOrder}
    settings={settings}
    onClose={() => setInvoiceOrder(null)}
  />
    </AdminLayout>;
};
export {
  AdminOrders
};
