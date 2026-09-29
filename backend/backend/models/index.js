import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager", "staff", "customer"], default: "admin" },
  createdAt: { type: Date, default: Date.now }
});
const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "Utensils" }
});
const CategoryModel = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const FoodSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  ingredients: [{ type: String }],
  price: { type: Number, required: true },
  category: { type: String, required: true },
  isVeg: { type: Boolean, default: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.8 },
  ratingsCount: { type: Number, default: 24 },
  likes: { type: Number, default: 45 },
  likedBy: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  preparationTimeMinutes: { type: Number, default: 15 },
  createdAt: { type: Date, default: Date.now }
});
const FoodModel = mongoose.models.Food || mongoose.model("Food", FoodSchema);
const TableSchema = new Schema({
  tableNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ["Available", "Occupied", "Reserved", "Cleaning"], default: "Available" },
  qrCodeUrl: { type: String },
  currentOrderId: { type: String },
  // Running count of customers/orders served at this table over time — used to
  // auto-label guests who don't type in their name (e.g. "Table 5 - Guest 11").
  customerCounter: { type: Number, default: 0 }
});
const TableModel = mongoose.models.Table || mongoose.model("Table", TableSchema);
const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  tableNumber: { type: String, required: true },
  customerName: { type: String, default: "" },
  customerPhone: { type: String },
  items: [
    {
      foodId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      isVeg: { type: Boolean, default: true },
      image: { type: String },
      preparationTimeMinutes: { type: Number, default: 15 }
    }
  ],
  subtotal: { type: Number, required: true },
  gstRate: { type: Number, default: 5 },
  gstAmount: { type: Number, required: true },
  serviceChargeRate: { type: Number, default: 0 },
  serviceChargeAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["Cash", "UPI", "Online"], default: "Cash" },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Cash Pending", "Failed", "Refunded"], default: "Pending" },
  orderStatus: { type: String, enum: ["Pending", "Confirmed", "Preparing", "Ready", "Served", "Completed", "Cancelled"], default: "Pending" },
  estimatedPrepMinutes: { type: Number, default: 15 },
  estimatedReadyAt: { type: Date },
  autoStageMinutes: { type: [Number], default: void 0 },
  preparingStartedAt: { type: Date },
  readyAt: { type: Date },
  paidAt: { type: Date },
  isGuestLabel: { type: Boolean, default: false },
  guestNumber: { type: Number },
  notes: { type: String },
  timeline: [
    {
      status: { type: String, required: true },
      time: { type: Date, default: Date.now },
      note: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});
const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const WaiterRequestSchema = new Schema({
  tableNumber: { type: String, required: true },
  reason: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ["Pending", "Accepted", "Completed"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});
const WaiterRequestModel = mongoose.models.WaiterRequest || mongoose.model("WaiterRequest", WaiterRequestSchema);
const ComplaintSchema = new Schema({
  category: { type: String, required: true },
  description: { type: String, required: true },
  tableNumber: { type: String, required: true },
  orderId: { type: String },
  status: { type: String, enum: ["Open", "Under Review", "Resolved", "Rejected"], default: "Open" },
  createdAt: { type: Date, default: Date.now }
});
const ComplaintModel = mongoose.models.Complaint || mongoose.model("Complaint", ComplaintSchema);
const FeedbackSchema = new Schema({
  tableNumber: { type: String },
  orderId: { type: String },
  customerName: { type: String },
  foodRating: { type: Number, default: 5 },
  serviceRating: { type: Number, default: 5 },
  cleanlinessRating: { type: Number, default: 5 },
  overallRating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const FeedbackModel = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
const StaffSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  salary: { type: Number, required: true },
  joiningDate: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
});
const StaffModel = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
const AttendanceSchema = new Schema({
  staffId: { type: String, required: true },
  staffName: { type: String, required: true },
  date: { type: String, required: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String },
  status: { type: String, enum: ["Present", "Absent", "Late", "Leave"], default: "Present" }
});
const AttendanceModel = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
const InventorySchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  minStockThreshold: { type: Number, required: true },
  costPerUnit: { type: Number, default: 0 },
  lastRestockedAt: { type: Date, default: Date.now }
});
const InventoryModel = mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);
const ExpenseSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const ExpenseModel = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
const RestaurantSettingsSchema = new Schema({
  restaurantName: { type: String, default: "Royal Spice Gourmet" },
  tagline: { type: String, default: "Crafted Culinary Experiences & Smart Dining" },
  logoUrl: { type: String, default: "" },
  stampUrl: { type: String, default: "/assets/hotel-stamp.svg" },
  address: { type: String, default: "42 Gourmet Boulevard, Culinary District, Metro City" },
  phone: { type: String, default: "+91 98765 43210" },
  email: { type: String, default: "reservations@royalspice.com" },
  gstNumber: { type: String, default: "27AAAAA0000A1Z5" },
  gstPercentage: { type: Number, default: 5 },
  serviceChargePercentage: { type: Number, default: 2.5 },
  upiId: { type: String, default: "royalspice@okhdfcbank" },
  upiMerchantName: { type: String, default: "Royal Spice Gourmet" },
  upiQrImage: { type: String },
  isCustomQrImage: { type: Boolean, default: false },
  openingHours: { type: String, default: "11:00 AM" },
  closingHours: { type: String, default: "11:30 PM" },
  isOpen: { type: Boolean, default: true }
});
const RestaurantSettingsModel = mongoose.models.RestaurantSettings || mongoose.model("RestaurantSettings", RestaurantSettingsSchema);
const NotificationSchema = new Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const NotificationModel = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
// Dedicated payment records — one document per payment event, so every
// settled/attempted payment is stored in MongoDB independently of the order.
const PaymentSchema = new Schema({
  paymentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  tableNumber: { type: String },
  customerName: { type: String },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["Cash", "UPI", "Online"], default: "Cash" },
  status: { type: String, enum: ["Pending", "Paid", "Cash Pending", "Failed", "Refunded"], default: "Pending" },
  // GST/tax breakdown captured at the moment of payment
  subtotal: { type: Number, default: 0 },
  gstRate: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  serviceChargeAmount: { type: Number, default: 0 },
  transactionRef: { type: String, default: "" },
  upiId: { type: String, default: "" },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
const PaymentModel = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export {
  AttendanceModel,
  AttendanceSchema,
  CategoryModel,
  CategorySchema,
  ComplaintModel,
  ComplaintSchema,
  ExpenseModel,
  ExpenseSchema,
  FeedbackModel,
  FeedbackSchema,
  FoodModel,
  FoodSchema,
  InventoryModel,
  InventorySchema,
  NotificationModel,
  NotificationSchema,
  OrderModel,
  OrderSchema,
  PaymentModel,
  PaymentSchema,
  RestaurantSettingsModel,
  RestaurantSettingsSchema,
  StaffModel,
  StaffSchema,
  TableModel,
  TableSchema,
  UserModel,
  UserSchema,
  WaiterRequestModel,
  WaiterRequestSchema
};
