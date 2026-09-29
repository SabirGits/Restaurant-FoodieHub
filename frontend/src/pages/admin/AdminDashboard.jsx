import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Bell,
  ChefHat,
  TrendingUp,
  Boxes,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
const PIE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6"];
const AdminDashboard = () => {
  const { success, error } = useNotification();
  const [stats, setStats] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [waiterRequests, setWaiterRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const fetchDashboardData = async () => {
    try {
      const [dashRes, ordersRes, waiterRes] = await Promise.all([
        api.getDashboard(),
        api.getOrders({ status: "Pending" }),
        api.getWaiterRequests("Pending")
      ]);
      if (dashRes.success && dashRes.data) {
        setStats(dashRes.data);
      }
      if (ordersRes.success && ordersRes.data) {
        setActiveOrders(ordersRes.data.slice(0, 8));
      }
      if (waiterRes.success && waiterRes.data) {
        setWaiterRequests(waiterRes.data);
      }
    } catch (err) {
      console.warn("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 6e3);
    return () => clearInterval(interval);
  }, []);
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        success(`Order status updated to ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      error(err.message || "Status update failed");
    }
  };
  const handleResolveWaiter = async (id) => {
    try {
      await api.updateWaiterRequest(id, "Completed");
      success("Waiter call resolved");
      fetchDashboardData();
    } catch (err) {
      error(err.message || "Action failed");
    }
  };
  return <AdminLayout>
      <div className="space-y-6">
        {
    /* Page Top Header */
  }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Executive Dashboard & KDS
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Real-time kitchen display, dining tables, revenue overview and active alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
    onClick={fetchDashboardData}
    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors"
  >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Stats</span>
            </button>
            <Link
    to="/admin/orders"
    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
  >
              All Orders →
            </Link>
          </div>
        </div>

        {
    /* Pending Waiter Requests Banner if any */
  }
        {waiterRequests.length > 0 && <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-zinc-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 animate-bounce" />
                Active Guest Service Calls ({waiterRequests.length})
              </span>
              <span className="text-[11px] text-zinc-400">Immediate attention required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
              {waiterRequests.map((req) => <div
    key={req.id}
    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-amber-500/20 text-xs"
  >
                  <div>
                    <div className="font-bold text-white">
                      Table <strong className="text-amber-400">{req.tableNumber}</strong>
                    </div>
                    <div className="text-zinc-400 text-[11px]">{req.reason}</div>
                    {req.notes && <div className="text-zinc-500 text-[10px]">"{req.notes}"</div>}
                  </div>
                  <button
    onClick={() => handleResolveWaiter(req.id)}
    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
  >
                    Acknowledge
                  </button>
                </div>)}
            </div>
          </div>}

        {
    /* Primary Metrics Grid */
  }
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {
    /* Revenue */
  }
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Today's Sales</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              ₹{stats ? stats.todaySales.toLocaleString("en-IN") : "0"}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Real-time settled transactions</span>
            </div>
          </div>

          {
    /* Today's Orders */
  }
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Total Orders</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats ? stats.todayOrders : "0"}
            </div>
            <div className="text-[11px] text-zinc-400">
              {stats ? stats.pendingOrders : "0"} in kitchen queue
            </div>
          </div>

          {
    /* Active Tables */
  }
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Active Tables</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats ? `${stats.activeTables} / ${stats.totalTables}` : "0 / 12"}
            </div>
            <div className="text-[11px] text-zinc-400">
              Dining hall occupancy
            </div>
          </div>

          {
    /* Low Stock Alerts */
  }
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Stock Warnings</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats ? stats.lowStockItems : "0"}
            </div>
            <div className="text-[11px] text-rose-400">
              Items below min threshold
            </div>
          </div>
        </div>

        {
    /* Charts Grid */
  }
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {
    /* Revenue Trend Bar Chart */
  }
          <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Weekly Revenue Trend (₹)
                </h3>
                <p className="text-xs text-zinc-400">Gross sales across last 7 dining cycles</p>
              </div>
              <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md">
                ₹{stats ? stats.todaySales + 145e3 : "1,85,000"} WTD
              </span>
            </div>

            <div className="h-64 w-full">
              {stats && stats.revenueChart ? <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `\u20B9${v / 1e3}k`} />
                    <Tooltip
    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#fff" }}
    formatter={(val) => [`\u20B9${val}`, "Sales"]}
  />
                    <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-xs text-zinc-500">Loading chart...</div>}
            </div>
          </div>

          {
    /* Popular Categories Donut */
  }
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top Categories Sold
              </h3>
              <p className="text-xs text-zinc-400">Order share distribution</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              {stats && stats.categoryBreakdown ? <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
    data={stats.categoryBreakdown}
    cx="50%"
    cy="50%"
    innerRadius={45}
    outerRadius={75}
    paddingAngle={4}
    dataKey="value"
  >
                      {stats.categoryBreakdown.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip
    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px" }}
  />
                  </PieChart>
                </ResponsiveContainer> : <div className="text-xs text-zinc-500">Loading breakdown...</div>}
            </div>

            {stats && stats.categoryBreakdown && <div className="grid grid-cols-2 gap-2 text-xs">
                {stats.categoryBreakdown.map((c, i) => <div key={c.name} className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="truncate">{c.name}</span>
                  </div>)}
              </div>}
          </div>
        </div>

        {
    /* Live Kitchen Display (KDS) Active Queue */
  }
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                Live Kitchen Display System (KDS)
              </h3>
              <p className="text-xs text-zinc-400">Incoming tickets requiring preparation and serving</p>
            </div>
            <Link
    to="/admin/orders"
    className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
  >
              Open Full Orders Board →
            </Link>
          </div>

          {activeOrders.length === 0 ? <div className="py-12 text-center text-zinc-400 text-xs bg-zinc-950/60 rounded-xl border border-zinc-800">
              All kitchen orders have been prepared and delivered! No pending tickets.
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOrders.map((order) => <div
    key={order.id}
    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-3 shadow-md"
  >
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div>
                        <span className="font-extrabold text-sm text-white">{order.orderNumber}</span>
                        <div className="text-[11px] text-zinc-400">Table <strong className="text-amber-400">{order.tableNumber}</strong> • {order.customerName}</div>
                      </div>
                      <span
    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${order.orderStatus === "Preparing" ? "bg-amber-950 text-amber-400 border border-amber-800" : "bg-blue-950 text-blue-400 border border-blue-800"}`}
  >
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="space-y-1 my-2.5 text-xs">
                      {order.items.map((item, idx) => <div key={idx} className="flex justify-between text-zinc-300">
                          <span>
                            {item.quantity} × {item.name}
                          </span>
                        </div>)}
                    </div>

                    {order.notes && <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-amber-300">
                        <strong>Kitchen Note:</strong> {order.notes}
                      </div>}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-400">₹{order.grandTotal}</span>

                    <div className="flex gap-1.5">
                      {order.orderStatus === "Pending" && <button
    onClick={() => handleUpdateStatus(order.id, "Confirmed")}
    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors"
  >
                          Accept
                        </button>}
                      {order.orderStatus === "Confirmed" && <button
    onClick={() => handleUpdateStatus(order.id, "Preparing")}
    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] transition-colors"
  >
                          Cook
                        </button>}
                      {order.orderStatus === "Preparing" && <button
    onClick={() => handleUpdateStatus(order.id, "Ready")}
    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
  >
                          Mark Ready
                        </button>}
                      {order.orderStatus === "Ready" && <button
    onClick={() => handleUpdateStatus(order.id, "Served")}
    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition-colors"
  >
                          Mark Served
                        </button>}
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>
      </div>
    </AdminLayout>;
};
export {
  AdminDashboard
};
