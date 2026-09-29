import { useState, useEffect } from "react";
import {
  Star,
  CheckCircle2
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
const AdminFeedback = () => {
  const { success, error } = useNotification();
  const [feedbacks, setFeedbacks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("feedback");
  const [isLoading, setIsLoading] = useState(false);
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fbRes, cpRes] = await Promise.all([
        api.getFeedback(),
        api.getComplaints()
      ]);
      if (fbRes.success && fbRes.data) {
        setFeedbacks(fbRes.data);
      }
      if (cpRes.success && cpRes.data) {
        setComplaints(cpRes.data);
      }
    } catch (err) {
      console.warn("Failed to load feedback/complaints:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleResolveComplaint = async (id) => {
    try {
      await api.updateComplaintStatus(id, "Resolved");
      success("Complaint marked as Resolved");
      fetchData();
    } catch (err) {
      error(err.message || "Failed to update complaint");
    }
  };
  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1) : "4.8";
  const pendingComplaints = complaints.filter((c) => c.status === "Pending").length;
  return <AdminLayout>
      <div className="space-y-6">
        {
    /* Header */
  }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Guest Experience, Reviews & Resolution
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Guest dining feedback, food quality reviews, and manager service incident resolution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{avgRating} / 5.0 Average Guest Satisfaction</span>
            </div>
          </div>
        </div>

        {
    /* Tab Toggle */
  }
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          <button
    onClick={() => setActiveTab("feedback")}
    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === "feedback" ? "bg-amber-500 text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
  >
            Guest Reviews & Ratings ({feedbacks.length})
          </button>
          <button
    onClick={() => setActiveTab("complaints")}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === "complaints" ? "bg-amber-500 text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
  >
            <span>Service Incidents ({complaints.length})</span>
            {pendingComplaints > 0 && <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingComplaints}
              </span>}
          </button>
        </div>

        {activeTab === "feedback" ? (
    /* Feedback Grid */
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedbacks.length === 0 ? <div className="col-span-full py-16 text-center text-xs text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                No guest feedback entries logged yet.
              </div> : feedbacks.map((item) => <div
      key={item.id}
      className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-lg flex flex-col justify-between"
    >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {item.customerName || "Verified Diner"}
                        </h4>
                        <span className="text-[11px] text-amber-400 font-semibold">
                          Table {item.tableNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => <Star
      key={i}
      className={`w-3.5 h-3.5 ${i < item.rating ? "fill-current" : "text-zinc-700"}`}
    />)}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                      "{item.comment || "Wonderful culinary presentation and quick service!"}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}
                  </div>
                </div>)}
          </div>
  ) : (
    /* Complaints Resolution Board */
    <div className="space-y-3">
            {complaints.length === 0 ? <div className="py-16 text-center text-xs text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                No customer complaints reported! Smooth service on all tables.
              </div> : complaints.map((c) => {
      const isResolved = c.status === "Resolved";
      return <div
        key={c.id}
        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isResolved ? "bg-zinc-950/60 border-zinc-800/80 opacity-75" : "bg-zinc-900 border-rose-500/40 ring-1 ring-rose-500/20"}`}
      >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">
                          Table {c.tableNumber}
                        </span>
                        <span className="text-xs font-semibold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          {c.reason}
                        </span>
                        <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isResolved ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400 border border-amber-800"}`}
      >
                          {c.status}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300">
                        {c.description || "No additional comment provided."}
                      </p>

                      <div className="text-[10px] text-zinc-500">
                        Logged by {c.customerName || "Diner"} •{" "}
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    {!isResolved && <button
        onClick={() => handleResolveComplaint(c.id)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0"
      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>}
                  </div>;
    })}
          </div>
  )}
      </div>
    </AdminLayout>;
};
export {
  AdminFeedback
};
