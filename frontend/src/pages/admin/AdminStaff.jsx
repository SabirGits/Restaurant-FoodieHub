import { useState, useEffect } from "react";
import {
  Plus,
  Phone,
  Mail,
  Trash2,
  X
} from "lucide-react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { api } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
const AdminStaff = () => {
  const { success, error } = useNotification();
  const [staffList, setStaffList] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("staff");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "Server / Waiter",
    phone: "",
    email: "",
    salary: "22000"
  });
  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, attRes] = await Promise.all([
        api.getStaff(),
        api.getAttendance()
      ]);
      if (staffRes.success && staffRes.data) {
        setStaffList(staffRes.data);
      }
      if (attRes.success && attRes.data) {
        setAttendance(attRes.data);
      }
    } catch (err) {
      console.warn("Failed to fetch staff:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchStaffData();
  }, []);
  const handleRecordAttendance = async (staffId, status) => {
    try {
      await api.recordAttendance({
        staffId,
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        status
      });
      success(`Marked as ${status}`);
      fetchStaffData();
    } catch (err) {
      error(err.message || "Failed to update attendance");
    }
  };
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      error("Name and Phone are required");
      return;
    }
    try {
      await api.createStaff({
        ...formData,
        salary: Number(formData.salary) || 2e4,
        status: "Active"
      });
      success(`Added staff member ${formData.name}`);
      setIsAddOpen(false);
      setFormData({ name: "", role: "Server / Waiter", phone: "", email: "", salary: "22000" });
      fetchStaffData();
    } catch (err) {
      error(err.message || "Failed to add staff");
    }
  };
  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await api.deleteStaff(id);
      success(`Removed ${name}`);
      fetchStaffData();
    } catch (err) {
      error(err.message || "Delete failed");
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
              Staff & Daily Attendance
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Floor managers, head chefs, kitchen crew, and daily clock-in rosters.
            </p>
          </div>

          <button
    onClick={() => setIsAddOpen(true)}
    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors shadow-md shadow-amber-500/20 w-fit"
  >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {
    /* Tab Toggle */
  }
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          <button
    onClick={() => setActiveTab("staff")}
    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === "staff" ? "bg-amber-500 text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
  >
            Staff Directory ({staffList.length})
          </button>
          <button
    onClick={() => setActiveTab("attendance")}
    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === "attendance" ? "bg-amber-500 text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
  >
            Today's Attendance Roster
          </button>
        </div>

        {activeTab === "staff" ? (
    /* Staff Directory Grid */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.map((member) => <div
      key={member.id}
      className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-lg flex flex-col justify-between"
    >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">{member.name}</h3>
                      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block mt-1">
                        {member.role}
                      </span>
                    </div>

                    <button
      onClick={() => handleDeleteStaff(member.id, member.name)}
      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-400 transition-colors"
      title="Remove Staff"
    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-400 mt-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{member.phone}</span>
                    </div>
                    {member.email && <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{member.email}</span>
                      </div>}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Monthly Compensation</span>
                  <span className="font-bold text-white">₹{member.salary?.toLocaleString("en-IN") || "25,000"}</span>
                </div>
              </div>)}
          </div>
  ) : (
    /* Today's Attendance Table */
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Date: {(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                Daily Roster Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Quick Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {staffList.map((member) => {
      const todayRecord = attendance.find(
        (a) => a.staffId === member.id || a.staffName === member.name
      );
      const currentStatus = todayRecord ? todayRecord.status : "Not Marked";
      return <tr key={member.id} className="hover:bg-zinc-800/40">
                        <td className="py-3 px-4 font-bold text-white text-sm">
                          {member.name}
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{member.role}</td>
                        <td className="py-3 px-4">
                          <span
        className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${currentStatus === "Present" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : currentStatus === "Late" ? "bg-amber-950 text-amber-400 border border-amber-800" : currentStatus === "Absent" ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-zinc-800 text-zinc-400"}`}
      >
                            {currentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
        onClick={() => handleRecordAttendance(member.id, "Present")}
        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
      >
                              Present
                            </button>
                            <button
        onClick={() => handleRecordAttendance(member.id, "Late")}
        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] transition-colors"
      >
                              Late
                            </button>
                            <button
        onClick={() => handleRecordAttendance(member.id, "Absent")}
        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors"
      >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>;
    })}
                </tbody>
              </table>
            </div>
          </div>
  )}
      </div>

      {
    /* Add Staff Modal */
  }
      {isAddOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-lg text-white">Add Staff Member</h3>
              <button onClick={() => setIsAddOpen(false)} className="icon-btn p-1.5 rounded-lg text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
    type="text"
    required
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="e.g. Vikramaditya Singh"
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Role / Position <span className="text-rose-400">*</span>
                </label>
                <select
    value={formData.role}
    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  >
                  <option value="Executive Chef">Executive Chef</option>
                  <option value="Sous Chef">Sous Chef</option>
                  <option value="Floor Manager">Floor Manager</option>
                  <option value="Senior Captain">Senior Captain</option>
                  <option value="Server / Waiter">Server / Waiter</option>
                  <option value="Bartender">Bartender</option>
                  <option value="Cashier & Billing">Cashier & Billing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
    type="tel"
    required
    value={formData.phone}
    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
    placeholder="+91 98765 00000"
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Monthly Salary (₹)
                  </label>
                  <input
    type="number"
    value={formData.salary}
    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
    placeholder="25000"
    className="w-full px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 transition-all"
  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
    type="email"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    placeholder="staff@restaurant.com"
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
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>}
    </AdminLayout>;
};
export {
  AdminStaff
};
