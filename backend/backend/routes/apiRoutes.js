import express from "express";
import {
  authenticateUser,
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  toggleLikeFood,
  addFoodRating,
  getCategories,
  getTables,
  getTableByNumber,
  createTable,
  updateTable,
  deleteTable,
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPayment,
  getPayments,
  createWaiterRequest,
  getWaiterRequests,
  updateWaiterRequestStatus,
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  createFeedback,
  getFeedbacks,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getAttendance,
  recordAttendance,
  getInventory,
  createInventoryItem,
  updateInventoryStock,
  getExpenses,
  createExpense,
  getRestaurantSettings,
  updateRestaurantSettings,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
  getDashboardStats,
  seedAll
} from "../services/dbService.js";
import { requireAdminAuth } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "Smart Restaurant Management API",
    version: "1.0.0"
  });
});
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }
    const authResult = await authenticateUser(email, password);
    if (!authResult) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }
    res.json({
      success: true,
      token: authResult.token,
      user: authResult.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Login failed" });
  }
});
router.get("/auth/me", requireAdminAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});
router.get("/menu", async (req, res) => {
  try {
    const { search, category, vegOnly, nonVegOnly, sortBy, availableOnly } = req.query;
    const foods = await getFoods({
      search: search ? String(search) : void 0,
      category: category ? String(category) : void 0,
      vegOnly: vegOnly === "true",
      nonVegOnly: nonVegOnly === "true",
      sortBy,
      availableOnly: availableOnly === "true"
    });
    res.json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/menu/:id", async (req, res) => {
  try {
    const food = await getFoodById(req.params.id);
    if (!food) {
      res.status(404).json({ success: false, message: "Food item not found" });
      return;
    }
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/menu", requireAdminAuth, async (req, res) => {
  try {
    const newFood = await createFood(req.body);
    res.status(201).json({ success: true, message: "Food item created", data: newFood });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.put("/menu/:id", requireAdminAuth, async (req, res) => {
  try {
    const updated = await updateFood(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: "Food item not found" });
      return;
    }
    res.json({ success: true, message: "Food item updated", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.delete("/menu/:id", requireAdminAuth, async (req, res) => {
  try {
    const deleted = await deleteFood(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Food item not found" });
      return;
    }
    res.json({ success: true, message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/menu/:id/like", async (req, res) => {
  try {
    const customerId = req.headers["x-client-id"] || req.ip || "guest";
    const result = await toggleLikeFood(req.params.id, customerId);
    if (!result) {
      res.status(404).json({ success: false, message: "Food item not found" });
      return;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/menu/:id/rate", async (req, res) => {
  try {
    const rating = Math.min(5, Math.max(1, Number(req.body.rating) || 5));
    const result = await addFoodRating(req.params.id, rating);
    if (!result) {
      res.status(404).json({ success: false, message: "Food item not found" });
      return;
    }
    res.json({ success: true, message: "Rating recorded", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/categories", async (req, res) => {
  try {
    const categories = await getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/tables", async (req, res) => {
  try {
    const tables = await getTables();
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/tables/verify/:tableNumber", async (req, res) => {
  try {
    const table = await getTableByNumber(req.params.tableNumber);
    if (!table) {
      res.status(404).json({ success: false, message: `Table ${req.params.tableNumber} is not recognized` });
      return;
    }
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/tables", requireAdminAuth, async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    if (!tableNumber) {
      res.status(400).json({ success: false, message: "Table number is required" });
      return;
    }
    const table = await createTable({ tableNumber, capacity });
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.put("/tables/:id", requireAdminAuth, async (req, res) => {
  try {
    const updated = await updateTable(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: "Table not found" });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.delete("/tables/:id", requireAdminAuth, async (req, res) => {
  try {
    await deleteTable(req.params.id);
    res.json({ success: true, message: "Table deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/orders", async (req, res) => {
  try {
    const order = await createOrder(req.body);
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.get("/orders", async (req, res) => {
  try {
    const { status, table, search, paymentStatus } = req.query;
    const orders = await getOrders({
      status: status ? String(status) : void 0,
      tableNumber: table ? String(table) : void 0,
      paymentStatus: paymentStatus ? String(paymentStatus) : void 0,
      search: search ? String(search) : void 0
    });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/orders/:id", async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) {
      res.status(400).json({ success: false, message: "Status is required" });
      return;
    }
    const order = await updateOrderStatus(req.params.id, status, note);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, message: `Status updated to ${status}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put("/orders/:id/payment", async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, transactionRef } = req.body;
    if (!paymentStatus) {
      res.status(400).json({ success: false, message: "paymentStatus is required" });
      return;
    }
    const order = await updateOrderPayment(req.params.id, paymentStatus, paymentMethod, { transactionRef });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, message: "Payment status updated", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// All stored payment records (admin view)
router.get("/payments", requireAdminAuth, async (req, res) => {
  try {
    const { status, method, orderId } = req.query;
    const payments = await getPayments({ status, method, orderId });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/waiter-requests", async (req, res) => {
  try {
    const { tableNumber, reason, notes } = req.body;
    if (!tableNumber || !reason) {
      res.status(400).json({ success: false, message: "Table number and reason are required" });
      return;
    }
    const reqDoc = await createWaiterRequest(tableNumber, reason, notes);
    res.status(201).json({
      success: true,
      message: `Waiter called for table ${tableNumber}. Staff has been notified!`,
      data: reqDoc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/waiter-requests", async (req, res) => {
  try {
    const status = req.query.status;
    const list = await getWaiterRequests(status);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put("/waiter-requests/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await updateWaiterRequestStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ success: false, message: "Waiter request not found" });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/complaints", async (req, res) => {
  try {
    const complaint = await createComplaint(req.body);
    res.status(201).json({ success: true, message: "Complaint registered. Management has been alerted.", data: complaint });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.get("/complaints", async (req, res) => {
  try {
    const list = await getComplaints();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put("/complaints/:id", requireAdminAuth, async (req, res) => {
  try {
    const updated = await updateComplaintStatus(req.params.id, req.body.status);
    if (!updated) {
      res.status(404).json({ success: false, message: "Complaint not found" });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post("/feedback", async (req, res) => {
  try {
    const fb = await createFeedback(req.body);
    res.status(201).json({ success: true, message: "Thank you for your valuable feedback!", data: fb });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.get("/feedback", async (req, res) => {
  try {
    const list = await getFeedbacks();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/staff", requireAdminAuth, async (req, res) => {
  try {
    const list = await getStaff();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/staff", requireAdminAuth, async (req, res) => {
  try {
    const staff = await createStaff(req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.put("/staff/:id", requireAdminAuth, async (req, res) => {
  try {
    const updated = await updateStaff(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.delete("/staff/:id", requireAdminAuth, async (req, res) => {
  try {
    await deleteStaff(req.params.id);
    res.json({ success: true, message: "Staff deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/attendance", requireAdminAuth, async (req, res) => {
  try {
    const date = req.query.date;
    const list = await getAttendance(date);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/attendance", requireAdminAuth, async (req, res) => {
  try {
    await recordAttendance(req.body);
    res.json({ success: true, message: "Attendance recorded" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.get("/inventory", requireAdminAuth, async (req, res) => {
  try {
    const list = await getInventory();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/inventory", requireAdminAuth, async (req, res) => {
  try {
    const item = await createInventoryItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.put("/inventory/:id", requireAdminAuth, async (req, res) => {
  try {
    const { quantityChange, isAbsolute } = req.body;
    const item = await updateInventoryStock(req.params.id, quantityChange, isAbsolute);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.get("/expenses", requireAdminAuth, async (req, res) => {
  try {
    const list = await getExpenses();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/expenses", requireAdminAuth, async (req, res) => {
  try {
    const exp = await createExpense(req.body);
    res.status(201).json({ success: true, data: exp });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.get("/settings", async (req, res) => {
  try {
    const settings = await getRestaurantSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put("/settings", requireAdminAuth, async (req, res) => {
  try {
    const updated = await updateRestaurantSettings(req.body);
    res.json({ success: true, message: "Settings updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.get("/notifications", async (req, res) => {
  try {
    const notifs = await getNotifications();
    res.json({ success: true, data: notifs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put("/notifications/:id/read", async (req, res) => {
  try {
    await markNotificationRead(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Clear ALL notifications at once (must be defined before the /:id route below)
router.delete("/notifications", requireAdminAuth, async (req, res) => {
  try {
    await clearAllNotifications();
    res.json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Clear a single notification individually
router.delete("/notifications/:id", requireAdminAuth, async (req, res) => {
  try {
    const existed = await deleteNotification(req.params.id);
    if (!existed) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, message: "Notification cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/dashboard", requireAdminAuth, async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/reports", requireAdminAuth, async (req, res) => {
  try {
    const stats = await getDashboardStats();
    const orders = await getOrders();
    const expenses = await getExpenses();
    const totalGst = orders.filter((o) => o.paymentStatus === "Paid").reduce((sum, o) => sum + (o.gstAmount || 0), 0);
    const totalServiceCharge = orders.filter((o) => o.paymentStatus === "Paid").reduce((sum, o) => sum + (o.serviceChargeAmount || 0), 0);
    res.json({
      success: true,
      data: {
        summary: stats,
        taxSummary: {
          totalGstCollected: Math.round(totalGst),
          totalServiceChargeCollected: Math.round(totalServiceCharge)
        },
        recentTransactions: orders.slice(0, 20),
        expensesBreakdown: expenses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/seed", async (req, res) => {
  try {
    await seedAll();
    res.json({ success: true, message: "Database successfully seeded with 105+ menu items, admin, tables and config." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
var apiRoutes_default = router;
export {
  apiRoutes_default as default
};
