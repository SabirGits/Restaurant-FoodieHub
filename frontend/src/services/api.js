const BASE_URL = import.meta.env?.VITE_API_URL || "/api";
function getHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("smart_restaurant_token");
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  let clientId = localStorage.getItem("smart_restaurant_client_id");
  if (!clientId) {
    clientId = "guest_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("smart_restaurant_client_id", clientId);
  }
  headers["x-client-id"] = clientId;
  return headers;
}
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: getHeaders(options.headers)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}
const api = {
  // Auth
  login: (email, password) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  }),
  getMe: () => request("/auth/me"),
  // Menu
  getMenu: (params) => {
    const q = new URLSearchParams();
    if (params?.search) q.append("search", params.search);
    if (params?.category) q.append("category", params.category);
    if (params?.vegOnly) q.append("vegOnly", "true");
    if (params?.nonVegOnly) q.append("nonVegOnly", "true");
    if (params?.sortBy) q.append("sortBy", params.sortBy);
    if (params?.availableOnly) q.append("availableOnly", "true");
    const queryStr = q.toString() ? `?${q.toString()}` : "";
    return request(`/menu${queryStr}`);
  },
  getFoodById: (id) => request(`/menu/${id}`),
  createFood: (food) => request("/menu", {
    method: "POST",
    body: JSON.stringify(food)
  }),
  updateFood: (id, updates) => request(`/menu/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates)
  }),
  deleteFood: (id) => request(`/menu/${id}`, {
    method: "DELETE"
  }),
  toggleLike: (id) => request(`/menu/${id}/like`, {
    method: "POST"
  }),
  addRating: (id, rating) => request(`/menu/${id}/rate`, {
    method: "POST",
    body: JSON.stringify({ rating })
  }),
  // Categories
  getCategories: () => request("/categories"),
  // Tables
  getTables: () => request("/tables"),
  verifyTable: (tableNumber) => request(`/tables/verify/${encodeURIComponent(tableNumber)}`),
  createTable: (tableData) => request("/tables", {
    method: "POST",
    body: JSON.stringify(tableData)
  }),
  updateTable: (id, updates) => request(`/tables/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates)
  }),
  deleteTable: (id) => request(`/tables/${id}`, {
    method: "DELETE"
  }),
  // Orders
  createOrder: (orderData) => request("/orders", {
    method: "POST",
    body: JSON.stringify(orderData)
  }),
  getOrders: (params) => {
    const q = new URLSearchParams();
    if (params?.status) q.append("status", params.status);
    if (params?.table) q.append("table", params.table);
    if (params?.search) q.append("search", params.search);
    if (params?.paymentStatus) q.append("paymentStatus", params.paymentStatus);
    const queryStr = q.toString() ? `?${q.toString()}` : "";
    return request(`/orders${queryStr}`);
  },
  getOrderById: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, status, note) => request(`/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, note })
  }),
  updateOrderPayment: (id, paymentStatus, paymentMethod) => request(`/orders/${id}/payment`, {
    method: "PUT",
    body: JSON.stringify({ paymentStatus, paymentMethod })
  }),
  // Waiter Requests
  callWaiter: (tableNumber, reason, notes) => request("/waiter-requests", {
    method: "POST",
    body: JSON.stringify({ tableNumber, reason, notes })
  }),
  getWaiterRequests: (status) => {
    const query = status ? `?status=${status}` : "";
    return request(`/waiter-requests${query}`);
  },
  updateWaiterRequest: (id, status) => request(`/waiter-requests/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status })
  }),
  // Feedback & Complaints
  submitFeedback: (payload) => request("/feedback", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  getFeedbacks: () => request("/feedback"),
  getFeedback: () => request("/feedback"),
  submitComplaint: (payload) => request("/complaints", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  getComplaints: () => request("/complaints"),
  updateComplaintStatus: (id, status) => request(`/complaints/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status })
  }),
  // Staff & Attendance
  getStaff: () => request("/staff"),
  createStaff: (data) => request("/staff", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  updateStaff: (id, updates) => request(`/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates)
  }),
  deleteStaff: (id) => request(`/staff/${id}`, {
    method: "DELETE"
  }),
  getAttendance: (date) => {
    const q = date ? `?date=${date}` : "";
    return request(`/attendance${q}`);
  },
  recordAttendance: (data) => request("/attendance", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  // Inventory
  getInventory: () => request("/inventory"),
  createInventoryItem: (data) => request("/inventory", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  updateInventoryStock: (id, quantityChange, isAbsolute = false) => request(`/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify({ quantityChange, isAbsolute })
  }),
  updateInventoryItem: (id, updates) => request(`/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates)
  }),
  // Expenses
  getExpenses: () => request("/expenses"),
  createExpense: (data) => request("/expenses", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  // Restaurant Settings
  getSettings: () => request("/settings"),
  updateSettings: (data) => request("/settings", {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  // Notifications
  getNotifications: () => request("/notifications"),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, {
    method: "PUT"
  }),
  clearNotification: (id) => request(`/notifications/${id}`, {
    method: "DELETE"
  }),
  clearAllNotifications: () => request("/notifications", {
    method: "DELETE"
  }),
  // Dashboard & Reports
  getDashboard: () => request("/dashboard"),
  getReports: () => request("/reports"),
  // Seed trigger
  triggerSeed: () => request("/seed", { method: "POST" })
};
export {
  api
};
