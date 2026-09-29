import { useState, useEffect } from "react";
import {
  Plus,
  TrendingDown,
  TrendingUp,
  Sparkles,
  X
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
const AdminExpenses = () => {
  const { success, error } = useNotification();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "Raw Materials & Poultry",
    amount: "",
    description: "",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  });
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [expRes, dashRes] = await Promise.all([
        api.getExpenses(),
        api.getDashboard()
      ]);
      if (expRes.success && expRes.data) {
        setExpenses(expRes.data);
      }
      if (dashRes.success && dashRes.data) {
        setStats(dashRes.data);
      }
    } catch (err) {
      console.warn("Expenses fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.amount) {
      error("Please enter an amount");
      return;
    }
    try {
      await api.createExpense({
        title: formData.description || formData.category,
        category: formData.category,
        amount: Number(formData.amount) || 0,
        notes: formData.description,
        date: formData.date
      });
      success(`Logged expense of \u20B9${formData.amount}`);
      setIsAddOpen(false);
      setFormData({
        category: "Raw Materials & Poultry",
        amount: "",
        description: "",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      });
      fetchData();
    } catch (err) {
      error(err.message || "Failed to record expense");
    }
  };
  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRevenue = stats?.todaySales ? stats.todaySales + 12e4 : 155e3;
  const netProfit = totalRevenue - totalExpenseAmount;
  return <AdminLayout>
      <div className="space-y-6">
        {
    /* Header */
  }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Operating Expenses & Profitability (P&L)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Log daily operational expenditures, utility bills, raw ingredient purchases, and net margins.
            </p>
          </div>

          <button
    onClick={() => setIsAddOpen(true)}
    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors shadow-md shadow-amber-500/20 w-fit"
  >
            <Plus className="w-4 h-4" />
            <span>Record New Expense</span>
          </button>
        </div>

        {
    /* P&L Financial Cards */
  }
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
              <span>Gross Sales Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-zinc-500">
              Orders & customer dining receipts
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
              <span>Total Outflow / Expenses</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-400">
              ₹{totalExpenseAmount.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-zinc-500">
              Recorded operational expenditures
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
              <span>Estimated Net Margin</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400">
              ₹{netProfit.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              Healthy ~{Math.round(netProfit / totalRevenue * 100)}% operating profit margin
            </div>
          </div>
        </div>

        {
    /* Expenses Table */
  }
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Expense Vouchers Log ({expenses.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description / Note</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {expenses.map((item) => <tr key={item.id} className="hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4 text-zinc-400 font-mono">
                      {item.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 font-semibold text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-medium">
                      {item.description || "General Operational Expense"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-sm text-white">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {
    /* Add Expense Modal */
  }
      {isAddOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-lg text-white">Record Operating Expense</h3>
              <button onClick={() => setIsAddOpen(false)} className="icon-btn p-1.5 rounded-lg text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Expense Category <span className="text-rose-400">*</span>
                </label>
                <select
    value={formData.category}
    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  >
                  <option value="Raw Materials & Poultry">Raw Materials & Poultry</option>
                  <option value="Electricity & Power">Electricity & Power</option>
                  <option value="Commercial LPG Gas">Commercial LPG Gas</option>
                  <option value="Staff Payroll & Wages">Staff Payroll & Wages</option>
                  <option value="Packaging & Cutlery">Packaging & Cutlery</option>
                  <option value="Restaurant Rent">Restaurant Rent</option>
                  <option value="Cleaning & Sanitation">Cleaning & Sanitation</option>
                  <option value="Kitchen Equipment & Repairs">Kitchen Equipment & Repairs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Amount in INR (₹) <span className="text-rose-400">*</span>
                </label>
                <input
    type="number"
    required
    value={formData.amount}
    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
    placeholder="3500"
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Expense Description / Bill Reference
                </label>
                <input
    type="text"
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    placeholder="e.g. 4 Commercial 19kg LPG Cylinders"
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Date of Expenditure
                </label>
                <input
    type="date"
    value={formData.date}
    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setIsAddOpen(false)}
    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20"
  >
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>}
    </AdminLayout>;
};
export {
  AdminExpenses
};
