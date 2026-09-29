import { useState, useEffect } from "react";
import {
  Plus,
  Printer,
  Users,
  UtensilsCrossed,
  X
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import { useCart } from "../../context/CartContext";
const AdminTables = () => {
  const { settings } = useCart();
  const { success, error } = useNotification();
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("4");
  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTables();
      if (res.success && res.data) {
        setTables(res.data);
      }
    } catch (err) {
      console.warn("Failed to load tables:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchTables();
  }, []);
  const handleUpdateStatus = async (tableId, status) => {
    try {
      await api.updateTable(tableId, { status });
      success(`Table updated to ${status}`);
      fetchTables();
    } catch (err) {
      error(err.message || "Status update failed");
    }
  };
  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!tableNumber) {
      error("Please provide a table number");
      return;
    }
    try {
      await api.createTable({
        tableNumber: tableNumber.trim(),
        capacity: Number(capacity) || 4,
        status: "Available"
      });
      success(`Added Table ${tableNumber}`);
      setIsAddOpen(false);
      setTableNumber("");
      fetchTables();
    } catch (err) {
      error(err.message || "Failed to add table");
    }
  };
  return <AdminLayout>
      <div className="space-y-6">
        {
    /* Header */
  }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Dining Hall Tables & QR Standees
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Table status management, seating capacities, and printable contactless QR standees.
            </p>
          </div>

          <button
    onClick={() => setIsAddOpen(true)}
    id="btn-add-table"
    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors shadow-md shadow-amber-500/20 w-fit"
  >
            <Plus className="w-4 h-4" />
            <span>Add Dining Table</span>
          </button>
        </div>

        {
    /* Tables Grid */
  }
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => {
    const isOccupied = table.status === "Occupied";
    const isReserved = table.status === "Reserved";
    return <div
      key={table.id}
      className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-lg flex flex-col justify-between"
    >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                        Dining Table
                      </span>
                      <h3 className="text-2xl font-black text-white font-serif mt-0.5">
                        {table.tableNumber}
                      </h3>
                    </div>

                    <span
      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${isOccupied ? "bg-rose-950 text-rose-400 border border-rose-800" : isReserved ? "bg-amber-950 text-amber-400 border border-amber-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"}`}
    >
                      {table.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-3">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Seating Capacity: <strong>{table.capacity} Guests</strong></span>
                  </div>

                  {
      /* QR Code thumbnail */
    }
                  <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-white p-1 rounded-lg">
                        <img
      src={table.qrCodeUrl}
      alt={`QR for ${table.tableNumber}`}
      className="w-full h-full object-contain"
    />
                      </div>
                      <div className="text-[11px]">
                        <span className="text-zinc-200 font-bold block">Contactless QR</span>
                        <span className="text-zinc-500">Scan to auto-route</span>
                      </div>
                    </div>

                    <button
      onClick={() => setSelectedTableForQr(table)}
      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
      title="View & Print Acrylic Standee"
    >
                      <Printer className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>

                {
      /* Status Switcher */
    }
                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1.5">
                    Update Table Status
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
      onClick={() => handleUpdateStatus(table.id, "Available")}
      className={`py-1 rounded-lg font-semibold transition-colors ${table.status === "Available" ? "bg-emerald-600 text-white font-bold" : "bg-zinc-950 text-zinc-400 hover:text-zinc-200"}`}
    >
                      Vacant
                    </button>
                    <button
      onClick={() => handleUpdateStatus(table.id, "Occupied")}
      className={`py-1 rounded-lg font-semibold transition-colors ${table.status === "Occupied" ? "bg-rose-600 text-white font-bold" : "bg-zinc-950 text-zinc-400 hover:text-zinc-200"}`}
    >
                      Seated
                    </button>
                    <button
      onClick={() => handleUpdateStatus(table.id, "Reserved")}
      className={`py-1 rounded-lg font-semibold transition-colors ${table.status === "Reserved" ? "bg-amber-500 text-zinc-950 font-bold" : "bg-zinc-950 text-zinc-400 hover:text-zinc-200"}`}
    >
                      Reserved
                    </button>
                  </div>
                </div>
              </div>;
  })}
        </div>
      </div>

      {
    /* Standee Print Preview Modal */
  }
      {selectedTableForQr && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-premium text-zinc-100 relative my-8">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 no-print">
              <span className="font-bold text-sm text-zinc-300">Table QR Standee Preview</span>
              <div className="flex items-center gap-2">
                <button
    onClick={() => window.print()}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors"
  >
                  <Printer className="w-4 h-4" />
                  <span>Print Standee</span>
                </button>
                <button
    onClick={() => setSelectedTableForQr(null)}
    className="icon-btn p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
  >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {
    /* Printable Acrylic Standee Layout */
  }
            <div className="p-8 bg-white text-zinc-950 text-center space-y-4 printable-area">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-950 text-amber-400 flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="w-6 h-6" />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-black text-zinc-900 uppercase tracking-tight">
                  {settings?.restaurantName || "Royal Spice Gourmet"}
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Contactless Digital Dining & Instant Ordering
                </p>
              </div>

              <div className="py-2">
                <div className="w-52 h-52 mx-auto p-3 bg-zinc-50 border-2 border-zinc-900 rounded-2xl shadow-xl flex items-center justify-center">
                  <img
    src={selectedTableForQr.qrCodeUrl}
    alt="Table QR"
    className="w-full h-full object-contain"
  />
                </div>
              </div>

              <div className="inline-block px-5 py-2 rounded-xl bg-zinc-950 text-white font-serif text-lg font-black tracking-wider">
                TABLE {selectedTableForQr.tableNumber}
              </div>

              <div className="text-xs text-zinc-600 space-y-1 max-w-xs mx-auto">
                <p className="font-semibold text-zinc-900">
                  1. Open your phone camera or any scanner
                </p>
                <p>2. Scan QR code to browse 105+ chef dishes</p>
                <p>3. Customize orders, call server & pay via UPI</p>
              </div>

              <div className="text-[10px] text-zinc-400 pt-2 border-t border-zinc-200">
                Powered by Royal Spice Smart POS System • Wi-Fi: RoyalSpice_Guest
              </div>
            </div>
          </div>
        </div>}

      {
    /* Add Table Modal */
  }
      {isAddOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base text-white">Add Dining Table</h3>
              <button onClick={() => setIsAddOpen(false)} className="icon-btn p-1.5 rounded-lg text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Table Number (e.g. T-13, Balcony-1)
                </label>
                <input
    type="text"
    required
    value={tableNumber}
    onChange={(e) => setTableNumber(e.target.value)}
    placeholder="T-13"
    className="w-full px-3 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Seating Capacity
                </label>
                <input
    type="number"
    required
    value={capacity}
    onChange={(e) => setCapacity(e.target.value)}
    placeholder="4"
    className="w-full px-3 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setIsAddOpen(false)}
    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold"
  >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>}
    </AdminLayout>;
};
export {
  AdminTables
};
