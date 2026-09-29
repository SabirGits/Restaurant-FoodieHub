import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
const NotificationContext = createContext(void 0);
const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const showToast = useCallback((type, message, title, duration = 4e3) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);
  const success = useCallback((message, title) => showToast("success", message, title || "Success"), [showToast]);
  const error = useCallback((message, title) => showToast("error", message, title || "Error", 5e3), [showToast]);
  const info = useCallback((message, title) => showToast("info", message, title || "Notice"), [showToast]);
  const warning = useCallback((message, title) => showToast("warning", message, title || "Attention"), [showToast]);
  return <NotificationContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div
    id="toast-container"
    className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0"
  >
        <AnimatePresence>
          {toasts.map((toast) => {
    const isSuccess = toast.type === "success";
    const isError = toast.type === "error";
    const isWarning = toast.type === "warning";
    return <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm backdrop-blur-md ${isSuccess ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400 shadow-emerald-950/40" : isError ? "bg-rose-950/90 border-rose-500/30 text-rose-400 shadow-rose-950/40" : isWarning ? "bg-amber-950/90 border-amber-500/30 text-amber-400 shadow-amber-950/40" : "bg-zinc-900/90 border-zinc-700/40 text-zinc-100 shadow-black/40"}`}
    >
                <div className="shrink-0 mt-0.5">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                  {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex-1">
                  {toast.title && <div className="font-semibold text-xs tracking-wider uppercase mb-0.5 opacity-90">{toast.title}</div>}
                  <div className="leading-snug text-xs sm:text-sm">{toast.message}</div>
                </div>
                <button
      id={`close-toast-${toast.id}`}
      onClick={() => removeToast(toast.id)}
      className="icon-btn p-1.5 rounded-lg shrink-0 text-zinc-400 hover:text-white transition-colors"
    >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>;
  })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>;
};
const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};
export {
  NotificationProvider,
  useNotification
};
