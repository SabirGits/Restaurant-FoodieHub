import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, QrCode, Check, Users, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
const TableSelectorModal = ({ isOpen, onClose }) => {
  const { currentTable, setCurrentTable } = useCart();
  const { success } = useNotification();
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualInput, setManualInput] = useState("");
  useEffect(() => {
    if (isOpen) {
      loadTables();
    }
  }, [isOpen]);
  const loadTables = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTables();
      if (res.success && res.data) {
        setTables(res.data);
      }
    } catch (e) {
      console.warn("Failed to load tables:", e);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSelectTable = (tblNumber) => {
    setCurrentTable(tblNumber);
    success(`Switched active dining table to ${tblNumber}`);
    onClose();
  };
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const formatted = manualInput.toUpperCase().trim();
    handleSelectTable(formatted);
    setManualInput("");
  };
  if (!isOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-premium text-zinc-100 relative modal-in"
  >
          {
    /* Close button */
  }
          <button
    id="close-table-modal"
    onClick={onClose}
    className="icon-btn absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
  >
            <X className="w-5 h-5" />
          </button>

          {
    /* Header */
  }
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white">Select Your Table</h3>
              <p className="text-xs text-zinc-400">
                In a real restaurant, scanning the QR standee sets this automatically.
              </p>
            </div>
          </div>

          {
    /* Manual Input */
  }
          <form onSubmit={handleManualSubmit} className="mb-6">
            <div className="flex gap-2">
              <input
    id="manual-table-input"
    type="text"
    placeholder="e.g. T-04"
    value={manualInput}
    onChange={(e) => setManualInput(e.target.value)}
    className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-700 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all placeholder:text-zinc-500 uppercase"
  />
              <button
    type="submit"
    id="btn-apply-table"
    className="btn-3d px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm"
  >
                Set Table
              </button>
            </div>
          </form>

          {
    /* Table Grid */
  }
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Restaurant Dining Tables ({tables.length})</span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" /> Tap any table to sit
              </span>
            </div>

            {isLoading ? <div className="py-12 text-center text-zinc-400 text-sm">Loading available tables...</div> : <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {tables.map((t) => {
    const isCurrent = t.tableNumber === currentTable;
    const isOccupied = t.status === "Occupied";
    const isCleaning = t.status === "Cleaning";
    return <button
      key={t.id || t.tableNumber}
      id={`table-option-${t.tableNumber}`}
      onClick={() => handleSelectTable(t.tableNumber)}
      className={`relative p-3 rounded-xl border text-left transition-all ${isCurrent ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/50" : "bg-zinc-950/60 hover:bg-zinc-800 border-zinc-800 text-zinc-200"}`}
    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{t.tableNumber}</span>
                        {isCurrent && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {t.capacity}
                        </span>
                        <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.status === "Available" ? "text-emerald-400 bg-emerald-950/60" : isOccupied ? "text-amber-400 bg-amber-950/60" : "text-zinc-400 bg-zinc-800"}`}
    >
                          {t.status}
                        </span>
                      </div>
                    </button>;
  })}
              </div>}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center text-xs text-zinc-500">
            Current active table: <strong className="text-amber-400 font-bold">{currentTable}</strong>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
};
export {
  TableSelectorModal
};
