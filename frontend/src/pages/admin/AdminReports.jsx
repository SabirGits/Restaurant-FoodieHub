import { useState, useEffect } from "react";
import {
  Download,
  Receipt
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import { useCart } from "../../context/CartContext";
const AdminReports = () => {
  const { settings } = useCart();
  const { success, error } = useNotification();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [dateFilter, setDateFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [orderRes, dashRes] = await Promise.all([
        api.getOrders(),
        api.getDashboard()
      ]);
      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data);
      }
      if (dashRes.success && dashRes.data) {
        setStats(dashRes.data);
      }
    } catch (err) {
      console.warn("Reports fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchReports();
  }, []);
  const totalSubtotal = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalGst = orders.reduce((sum, o) => sum + (o.gstAmount || 0), 0);
  const halfGst = totalGst / 2;
  const totalServiceCharge = orders.reduce((sum, o) => sum + (o.serviceChargeAmount || 0), 0);
  const grandTotalSales = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const handleExportCsv = () => {
    if (orders.length === 0) {
      error("No orders available to export.");
      return;
    }
    const headers = [
      "Order ID",
      "Date Time",
      "Table No",
      "Guest Name",
      "Guest Phone",
      "Items Count",
      "Subtotal (INR)",
      "CGST (INR)",
      "SGST (INR)",
      "Service Charge (INR)",
      "Grand Total (INR)",
      "Payment Mode",
      "Payment Status",
      "Kitchen Status"
    ];
    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleString("en-IN")}"`,
      `"Table ${o.tableNumber}"`,
      `"${o.customerName || "Walk-in Guest"}"`,
      `"${o.customerPhone || "N/A"}"`,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.subtotal.toFixed(2),
      (o.gstAmount / 2).toFixed(2),
      (o.gstAmount / 2).toFixed(2),
      o.serviceChargeAmount.toFixed(2),
      o.grandTotal.toFixed(2),
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `restaurant_tax_sales_report_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Tax & Sales CSV Report downloaded successfully");
  };
  return <AdminLayout>
      <div className="space-y-6">
        {
    /* Header */
  }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Tax & Sales Analytics Reports
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Indian GST (CGST/SGST) collections, service charges, gross sales, and CSV audit exports.
            </p>
          </div>

          <button
    onClick={handleExportCsv}
    id="btn-export-csv"
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-emerald-600/20 w-fit"
  >
            <Download className="w-4 h-4" />
            <span>Download CSV Audit Report</span>
          </button>
        </div>

        {
    /* GST Tax Summary Cards */
  }
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
              Gross Food Sales
            </span>
            <div className="text-2xl font-black text-white">
              ₹{totalSubtotal.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-500">Excluding indirect taxes</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">
              CGST @ 2.5% Collected
            </span>
            <div className="text-2xl font-black text-amber-400">
              ₹{halfGst.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-500">Central Goods & Service Tax</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">
              SGST @ 2.5% Collected
            </span>
            <div className="text-2xl font-black text-amber-400">
              ₹{halfGst.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-500">State Goods & Service Tax</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider block">
              Service Charge ({settings?.serviceChargePercentage || 2.5}%)
            </span>
            <div className="text-2xl font-black text-blue-400">
              ₹{totalServiceCharge.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-500">Staff gratuity & floor pool</div>
          </div>
        </div>

        {
    /* GST Statutory Compliance Box */
  }
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              Tax Compliance & GSTIN Records
            </h3>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              GSTIN: {settings?.gstNumber || "27AABCR1234F1ZP"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-300 pt-2">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 font-semibold">Total Taxable Turnover:</span>
              <div className="text-base font-bold text-white">₹{totalSubtotal.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 font-semibold">Total GST Liability:</span>
              <div className="text-base font-bold text-amber-400">₹{totalGst.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 font-semibold">Net Realized Dining Revenue:</span>
              <div className="text-base font-bold text-emerald-400">₹{grandTotalSales.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {
    /* Audit Orders Sample Table */
  }
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Settled Taxable Transactions ({orders.length})
            </span>
            <span className="text-xs text-zinc-500">Ready for GSTR-1 / GSTR-3B audit export</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Table</th>
                  <th className="py-3 px-4">Food Subtotal</th>
                  <th className="py-3 px-4">CGST</th>
                  <th className="py-3 px-4">SGST</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4 text-right">Invoice Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {orders.slice(0, 10).map((o) => <tr key={o.id} className="hover:bg-zinc-800/40">
                    <td className="py-3 px-4 font-bold text-white font-mono">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-zinc-400">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-400">T-{o.tableNumber}</td>
                    <td className="py-3 px-4 font-medium text-zinc-200">₹{o.subtotal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-zinc-400">₹{(o.gstAmount / 2).toFixed(2)}</td>
                    <td className="py-3 px-4 text-zinc-400">₹{(o.gstAmount / 2).toFixed(2)}</td>
                    <td className="py-3 px-4 text-zinc-400">₹{o.serviceChargeAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-black text-sm text-white">
                      ₹{o.grandTotal.toFixed(2)}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>;
};
export {
  AdminReports
};
