import { useState, useEffect } from "react";
import {
  Plus,
  AlertTriangle,
  Search,
  X
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
const AdminInventory = () => {
  const { success, error } = useNotification();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    currentStock: "50",
    unit: "kg",
    minStockThreshold: "15",
    unitCost: "180"
  });
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInventory();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchInventory();
  }, []);
  const handleRestock = async (e) => {
    e.preventDefault();
    if (!selectedItem || !restockAmount) return;
    const newQty = selectedItem.currentStock + Number(restockAmount);
    try {
      await api.updateInventoryItem(selectedItem.id, { currentStock: newQty });
      success(`Added ${restockAmount} ${selectedItem.unit} to ${selectedItem.name}`);
      setSelectedItem(null);
      setRestockAmount("");
      fetchInventory();
    } catch (err) {
      error(err.message || "Restock failed");
    }
  };
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      error("Item name required");
      return;
    }
    try {
      await api.createInventoryItem({
        name: formData.name,
        quantity: Number(formData.currentStock) || 10,
        currentStock: Number(formData.currentStock) || 10,
        unit: formData.unit,
        minStockThreshold: Number(formData.minStockThreshold) || 10,
        costPerUnit: Number(formData.unitCost) || 100,
        unitCost: Number(formData.unitCost) || 100
      });
      success(`Added ${formData.name} to inventory`);
      setIsAddOpen(false);
      setFormData({ name: "", currentStock: "50", unit: "kg", minStockThreshold: "15", unitCost: "180" });
      fetchInventory();
    } catch (err) {
      error(err.message || "Failed to add item");
    }
  };
  const filteredItems = items.filter(
    (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const lowStockCount = items.filter((i) => i.currentStock <= i.minStockThreshold).length;
  return <AdminLayout>
      <div className="space-y-6">
        {
    /* Header */
  }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Kitchen Inventory & Raw Stock
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Ingredient stock balances, minimum thresholds, unit purchase costs, and restock alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
    onClick={() => setIsAddOpen(true)}
    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors shadow-md shadow-amber-500/20"
  >
              <Plus className="w-4 h-4" />
              <span>Add Stock Item</span>
            </button>
          </div>
        </div>

        {
    /* Low Stock Alert Header if any */
  }
        {lowStockCount > 0 && <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>{lowStockCount} raw ingredient items</strong> are at or below their safety stock threshold. Restock recommended.
              </span>
            </div>
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              Urgent Purchase
            </span>
          </div>}

        {
    /* Search */
  }
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
    type="text"
    placeholder="Search ingredients (e.g. Rice, Paneer, Chicken, Spices)..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500 text-zinc-100 placeholder:text-zinc-500"
  />
        </div>

        {
    /* Inventory Table */
  }
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Ingredient / Material</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4">Threshold</th>
                  <th className="py-3.5 px-4">Stock Level Gauge</th>
                  <th className="py-3.5 px-4">Est. Cost / Unit</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredItems.map((item) => {
    const isLow = item.currentStock <= item.minStockThreshold;
    const ratio = Math.min(100, Math.round(item.currentStock / (item.minStockThreshold * 2.5) * 100));
    return <tr key={item.id} className="hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{item.name}</div>
                        <div className="text-[10px] text-zinc-500">Unit: {item.unit}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-black text-sm ${isLow ? "text-rose-400" : "text-emerald-400"}`}>
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">
                        {item.minStockThreshold} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                          <div
      className={`h-full rounded-full ${isLow ? "bg-rose-500" : "bg-emerald-500"}`}
      style={{ width: `${ratio}%` }}
    />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 font-semibold">
                        ₹{item.unitCost} / {item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
      onClick={() => setSelectedItem(item)}
      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors"
    >
                          + Restock
                        </button>
                      </td>
                    </tr>;
  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {
    /* Restock Quantity Modal */
  }
      {selectedItem && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base text-white">
                Restock {selectedItem.name}
              </h3>
              <button onClick={() => setSelectedItem(null)} className="icon-btn p-1.5 rounded-lg text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestock} className="space-y-4 pt-4">
              <div className="text-xs text-zinc-400">
                Current inventory: <strong className="text-white">{selectedItem.currentStock} {selectedItem.unit}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Quantity to Add ({selectedItem.unit})
                </label>
                <input
    type="number"
    required
    min="1"
    value={restockAmount}
    onChange={(e) => setRestockAmount(e.target.value)}
    placeholder="e.g. 25"
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setSelectedItem(null)}
    className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-1.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold"
  >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Add Item Modal */
  }
      {isAddOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base text-white">Add Inventory Material</h3>
              <button onClick={() => setIsAddOpen(false)} className="icon-btn p-1.5 rounded-lg text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Item Name <span className="text-rose-400">*</span>
                </label>
                <input
    type="text"
    required
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="e.g. Saffron / Kesar"
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Initial Stock
                  </label>
                  <input
    type="number"
    value={formData.currentStock}
    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Measurement Unit
                  </label>
                  <select
    value={formData.unit}
    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="liters">liters (Liters)</option>
                    <option value="units">units (Pieces)</option>
                    <option value="grams">grams (Grams)</option>
                    <option value="packs">packs (Packets)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Min Alert Threshold
                  </label>
                  <input
    type="number"
    value={formData.minStockThreshold}
    onChange={(e) => setFormData({ ...formData, minStockThreshold: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Est. Cost per Unit (₹)
                  </label>
                  <input
    type="number"
    value={formData.unitCost}
    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
                </div>
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
    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold"
  >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>}
    </AdminLayout>;
};
export {
  AdminInventory
};
