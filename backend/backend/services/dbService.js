import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import {
  isMongoConnected,
  getCollection,
  setCollection,
  saveLocalStore
} from "../config/db.js";
import {
  UserModel,
  CategoryModel,
  FoodModel,
  TableModel,
  OrderModel,
  WaiterRequestModel,
  ComplaintModel,
  FeedbackModel,
  StaffModel,
  AttendanceModel,
  InventoryModel,
  ExpenseModel,
  RestaurantSettingsModel,
  NotificationModel,
  PaymentModel
} from "../models/index.js";
import { initialFoods, initialCategories } from "../data/initialMenu.js";
const JWT_SECRET = process.env.JWT_SECRET || "smart_restaurant_jwt_secret_key_2026_production_grade";
function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}
async function mongoMirror(op) {
  if (!isMongoConnected) return;
  try {
    await op();
  } catch (e) {
    console.warn("[Mongo Mirror] sync warning:", e?.message || e);
  }
}
async function autoSeedIfEmpty() {
  try {
    const existingFoods = isMongoConnected ? await FoodModel.countDocuments() : getCollection("foods").length;
    if (existingFoods === 0) {
      console.log("[Seed] Database is empty. Seeding initial 105+ menu items, categories, admin, tables, and settings...");
      await seedAll();
    }
  } catch (err) {
    console.error("[Seed] Auto-seed check error:", err);
  }
}
async function seedAll() {
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@restaurant.com";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@123456";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const adminDoc = {
    id: generateId("user"),
    name: "Executive Chef & General Manager",
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
    createdAt: /* @__PURE__ */ new Date()
  };
  const categoryDocs = initialCategories.map((c) => ({
    id: generateId("cat"),
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: "Utensils"
  }));
  const foodDocs = initialFoods.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    ingredients: f.ingredients,
    price: f.price,
    category: f.category,
    isVeg: f.isVeg,
    image: f.image,
    rating: f.rating,
    ratingsCount: f.ratingsCount,
    likes: f.likes,
    likedBy: [],
    isAvailable: f.isAvailable,
    isPopular: f.isPopular,
    preparationTimeMinutes: f.preparationTimeMinutes,
    createdAt: /* @__PURE__ */ new Date()
  }));
  const tableConfigs = [
    { tableNumber: "T-01", capacity: 2, status: "Available" },
    { tableNumber: "T-02", capacity: 2, status: "Available" },
    { tableNumber: "T-03", capacity: 4, status: "Occupied" },
    { tableNumber: "T-04", capacity: 4, status: "Available" },
    { tableNumber: "T-05", capacity: 4, status: "Available" },
    { tableNumber: "T-06", capacity: 6, status: "Reserved" },
    { tableNumber: "T-07", capacity: 6, status: "Available" },
    { tableNumber: "T-08", capacity: 8, status: "Available" },
    { tableNumber: "T-09", capacity: 4, status: "Available" },
    { tableNumber: "T-10", capacity: 4, status: "Cleaning" },
    { tableNumber: "T-11", capacity: 2, status: "Available" },
    { tableNumber: "T-12", capacity: 10, status: "Available" }
  ];
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const tableDocs = await Promise.all(
    tableConfigs.map(async (t) => {
      const qrTarget = `${appUrl}/?table=${t.tableNumber}`;
      let qrCodeUrl = "";
      try {
        qrCodeUrl = await QRCode.toDataURL(qrTarget, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 300,
          color: { dark: "#0a0a0a", light: "#ffffff" }
        });
      } catch (e) {
        qrCodeUrl = "";
      }
      return {
        id: generateId("tbl"),
        tableNumber: t.tableNumber,
        capacity: t.capacity,
        status: t.status,
        qrCodeUrl
      };
    })
  );
  const settingsDoc = {
    id: generateId("settings"),
    restaurantName: "Royal Spice Gourmet & Bar",
    tagline: "Crafted Culinary Experiences & Smart QR Dining",
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80",
    stampUrl: "/assets/hotel-stamp.svg",
    address: "42 Gourmet Boulevard, Heritage Plaza, Metro City",
    phone: "+91 98765 43210",
    email: "contact@royalspicegourmet.com",
    gstNumber: "27AABCR1234F1ZP",
    gstPercentage: 5,
    serviceChargePercentage: 2.5,
    // Defaults to the restaurant's actual provided UPI payment QR (kept exactly
    // as supplied). Admin can replace it any time from Admin > Settings, or
    // switch back to an auto-generated QR by changing the UPI ID.
    upiId: process.env.UPI_ID || "7410945190@fam",
    upiMerchantName: process.env.UPI_MERCHANT_NAME || "TRIO Restaurant",
    upiQrImage: "/assets/payment-qr.jpg",
    isCustomQrImage: true,
    openingHours: "11:00 AM",
    closingHours: "11:30 PM",
    isOpen: true
  };
  const staffDocs = [
    { id: generateId("stf"), name: "Rohan Sharma", phone: "+91 98111 22334", role: "Head Chef", salary: 65e3, joiningDate: "2024-01-15", status: "Active" },
    { id: generateId("stf"), name: "Anita Patel", phone: "+91 98222 33445", role: "Floor Manager", salary: 45e3, joiningDate: "2024-03-01", status: "Active" },
    { id: generateId("stf"), name: "Vikram Singh", phone: "+91 98333 44556", role: "Senior Waiter", salary: 26e3, joiningDate: "2024-06-10", status: "Active" },
    { id: generateId("stf"), name: "Pooja Verma", phone: "+91 98444 55667", role: "Cashier & POS", salary: 28e3, joiningDate: "2024-05-12", status: "Active" },
    { id: generateId("stf"), name: "Devendra Nair", phone: "+91 98555 66778", role: "Sous Chef", salary: 42e3, joiningDate: "2024-02-20", status: "Active" },
    { id: generateId("stf"), name: "Kavita Das", phone: "+91 98666 77889", role: "Captain Waiter", salary: 25e3, joiningDate: "2024-08-01", status: "Active" }
  ];
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const attendanceDocs = staffDocs.map((s, idx) => ({
    id: generateId("att"),
    staffId: s.id,
    staffName: s.name,
    date: todayStr,
    checkIn: idx === 2 ? "11:15 AM" : "10:45 AM",
    checkOut: "",
    status: idx === 2 ? "Late" : "Present"
  }));
  const inventoryDocs = [
    { id: generateId("inv"), name: "Basmati Rice Aged", category: "Grains", quantity: 85, unit: "kg", minStockThreshold: 30, costPerUnit: 110, lastRestockedAt: /* @__PURE__ */ new Date() },
    { id: generateId("inv"), name: "Fresh Farm Chicken", category: "Poultry", quantity: 24, unit: "kg", minStockThreshold: 15, costPerUnit: 220, lastRestockedAt: /* @__PURE__ */ new Date() },
    { id: generateId("inv"), name: "Malai Cottage Cheese (Paneer)", category: "Dairy", quantity: 18, unit: "kg", minStockThreshold: 10, costPerUnit: 340, lastRestockedAt: /* @__PURE__ */ new Date() },
    { id: generateId("inv"), name: "Pure Cow Desi Ghee", category: "Dairy", quantity: 12, unit: "liters", minStockThreshold: 10, costPerUnit: 680, lastRestockedAt: /* @__PURE__ */ new Date() },
    { id: generateId("inv"), name: "Fresh Cooking Cream", category: "Dairy", quantity: 8, unit: "liters", minStockThreshold: 10, costPerUnit: 210, lastRestockedAt: /* @__PURE__ */ new Date() },
    // Low Stock!
    { id: generateId("inv"), name: "Kashmiri Saffron Grade A", category: "Spices", quantity: 45, unit: "grams", minStockThreshold: 20, costPerUnit: 290, lastRestockedAt: /* @__PURE__ */ new Date() },
    { id: generateId("inv"), name: "Imported San Marzano Tomatoes", category: "Pantry", quantity: 35, unit: "cans", minStockThreshold: 15, costPerUnit: 180, lastRestockedAt: /* @__PURE__ */ new Date() },
    { id: generateId("inv"), name: "Sourdough Brioche Buns", category: "Bakery", quantity: 14, unit: "packs", minStockThreshold: 20, costPerUnit: 90, lastRestockedAt: /* @__PURE__ */ new Date() }
    // Low stock!
  ];
  const sampleOrders = [
    {
      id: generateId("ord"),
      orderNumber: "ORD-9821",
      tableNumber: "T-03",
      customerName: "Aarav Mehta",
      customerPhone: "+91 98200 11223",
      items: [
        { foodId: "f-001", name: "Paneer Tikka Charred Angaar", price: 320, quantity: 1, isVeg: true },
        { foodId: "f-016", name: "Dal Makhani Slow-Simmered Bukhara Style", price: 360, quantity: 1, isVeg: true },
        { foodId: "f-098", name: "Butter Garlic Naan Tandoori", price: 90, quantity: 2, isVeg: true }
      ],
      subtotal: 860,
      gstRate: 5,
      gstAmount: 43,
      serviceChargeRate: 2.5,
      serviceChargeAmount: 21.5,
      discountAmount: 0,
      grandTotal: 924.5,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      orderStatus: "Preparing",
      notes: "Please make the dal extra buttery, less spicy for tikka.",
      timeline: [
        { status: "Pending", time: new Date(Date.now() - 25 * 6e4), note: "Order placed by customer via QR" },
        { status: "Confirmed", time: new Date(Date.now() - 22 * 6e4), note: "Kitchen accepted order" },
        { status: "Preparing", time: new Date(Date.now() - 15 * 6e4), note: "Chef began cooking" }
      ],
      createdAt: new Date(Date.now() - 25 * 6e4)
    },
    {
      id: generateId("ord"),
      orderNumber: "ORD-9820",
      tableNumber: "T-06",
      customerName: "Priya Sengupta",
      customerPhone: "+91 98111 44556",
      items: [
        { foodId: "f-009", name: "Hyderabadi Dum Chicken Biryani", price: 420, quantity: 2, isVeg: false },
        { foodId: "f-086", name: "Signature Mango Alphonso Lassi", price: 190, quantity: 2, isVeg: true }
      ],
      subtotal: 1220,
      gstRate: 5,
      gstAmount: 61,
      serviceChargeRate: 2.5,
      serviceChargeAmount: 30.5,
      discountAmount: 50,
      grandTotal: 1261.5,
      paymentMethod: "Cash",
      paymentStatus: "Cash Pending",
      orderStatus: "Ready",
      notes: "Include extra salan and raita.",
      timeline: [
        { status: "Pending", time: new Date(Date.now() - 40 * 6e4), note: "Order received" },
        { status: "Confirmed", time: new Date(Date.now() - 38 * 6e4), note: "Accepted" },
        { status: "Preparing", time: new Date(Date.now() - 30 * 6e4), note: "Cooking underway" },
        { status: "Ready", time: new Date(Date.now() - 5 * 6e4), note: "Plated, ready for server pickup" }
      ],
      createdAt: new Date(Date.now() - 40 * 6e4)
    },
    {
      id: generateId("ord"),
      orderNumber: "ORD-9819",
      tableNumber: "T-08",
      customerName: "David Miller",
      customerPhone: "+91 97654 32109",
      items: [
        { foodId: "f-035", name: "Margherita Burrata Truffle Wood-Fired", price: 490, quantity: 1, isVeg: true },
        { foodId: "f-041", name: "The Royal Truffle Smash Double Burger", price: 390, quantity: 1, isVeg: false },
        { foodId: "f-083", name: "Smoked Virgin Mojito with Fresh Mint", price: 210, quantity: 2, isVeg: true }
      ],
      subtotal: 1300,
      gstRate: 5,
      gstAmount: 65,
      serviceChargeRate: 2.5,
      serviceChargeAmount: 32.5,
      discountAmount: 0,
      grandTotal: 1397.5,
      paymentMethod: "Online",
      paymentStatus: "Paid",
      orderStatus: "Completed",
      notes: "",
      timeline: [
        { status: "Pending", time: new Date(Date.now() - 90 * 6e4), note: "Order placed" },
        { status: "Confirmed", time: new Date(Date.now() - 88 * 6e4), note: "Order confirmed" },
        { status: "Preparing", time: new Date(Date.now() - 80 * 6e4), note: "Preparation" },
        { status: "Ready", time: new Date(Date.now() - 65 * 6e4), note: "Ready for table" },
        { status: "Served", time: new Date(Date.now() - 60 * 6e4), note: "Served to table" },
        { status: "Completed", time: new Date(Date.now() - 20 * 6e4), note: "Billed and closed" }
      ],
      createdAt: new Date(Date.now() - 90 * 6e4)
    }
  ];
  const expenseDocs = [
    { id: generateId("exp"), title: "Monthly Commercial Electricity Bill", category: "Electricity", amount: 34500, date: todayStr, notes: "Grid energy & AC cooling" },
    { id: generateId("exp"), title: "Weekly Farm-to-Table Organic Vegetables", category: "Ingredients", amount: 18200, date: todayStr, notes: "Direct vendor purchase" },
    { id: generateId("exp"), title: "Eco-Friendly Takeaway Packaging Boxes", category: "Packaging", amount: 6500, date: todayStr, notes: "Biodegradable bagasse containers" }
  ];
  const feedbackDocs = [
    {
      id: generateId("fb"),
      tableNumber: "T-08",
      orderId: "ORD-9819",
      customerName: "David Miller",
      foodRating: 5,
      serviceRating: 5,
      cleanlinessRating: 5,
      overallRating: 5,
      comment: "The Truffle Burger and Burrata Pizza were world-class! Seamless QR ordering experience.",
      createdAt: new Date(Date.now() - 20 * 6e4)
    }
  ];
  const waiterDocs = [
    {
      id: generateId("wc"),
      tableNumber: "T-03",
      reason: "Need water",
      notes: "One bottle of sparkling water please",
      status: "Pending",
      createdAt: new Date(Date.now() - 3 * 6e4)
    }
  ];
  const notificationDocs = [
    {
      id: generateId("notif"),
      type: "order",
      title: "New Order: ORD-9821",
      message: "Table T-03 placed an order for \u20B9924.50 (Preparing)",
      isRead: false,
      link: "/admin/orders",
      createdAt: new Date(Date.now() - 25 * 6e4)
    },
    {
      id: generateId("notif"),
      type: "waiter",
      title: "Table T-03 requested Waiter",
      message: "Reason: Need water",
      isRead: false,
      link: "/admin/dashboard",
      createdAt: new Date(Date.now() - 3 * 6e4)
    },
    {
      id: generateId("notif"),
      type: "inventory",
      title: "Low Stock Alert: Cooking Cream",
      message: "Fresh Cooking Cream is at 8 liters (threshold 10 liters).",
      isRead: false,
      link: "/admin/inventory",
      createdAt: new Date(Date.now() - 60 * 6e4)
    }
  ];
  setCollection("users", [adminDoc]);
  setCollection("categories", categoryDocs);
  setCollection("foods", foodDocs);
  setCollection("tables", tableDocs);
  setCollection("settings", [settingsDoc]);
  setCollection("staff", staffDocs);
  setCollection("attendance", attendanceDocs);
  setCollection("inventory", inventoryDocs);
  setCollection("orders", sampleOrders);
  setCollection("expenses", expenseDocs);
  setCollection("feedbacks", feedbackDocs);
  setCollection("waiterRequests", waiterDocs);
  setCollection("complaints", []);
  setCollection("notifications", notificationDocs);
  if (isMongoConnected) {
    try {
      await UserModel.deleteMany({});
      await UserModel.insertMany([adminDoc]);
      await CategoryModel.deleteMany({});
      await CategoryModel.insertMany(categoryDocs);
      await FoodModel.deleteMany({});
      await FoodModel.insertMany(foodDocs);
      await TableModel.deleteMany({});
      await TableModel.insertMany(tableDocs);
      await RestaurantSettingsModel.deleteMany({});
      await RestaurantSettingsModel.insertMany([settingsDoc]);
      await StaffModel.deleteMany({});
      await StaffModel.insertMany(staffDocs);
      await AttendanceModel.deleteMany({});
      await AttendanceModel.insertMany(attendanceDocs);
      await InventoryModel.deleteMany({});
      await InventoryModel.insertMany(inventoryDocs);
      await OrderModel.deleteMany({});
      await OrderModel.insertMany(sampleOrders);
      await ExpenseModel.deleteMany({});
      await ExpenseModel.insertMany(expenseDocs);
      await FeedbackModel.deleteMany({});
      await FeedbackModel.insertMany(feedbackDocs);
      await WaiterRequestModel.deleteMany({});
      await WaiterRequestModel.insertMany(waiterDocs);
      await NotificationModel.deleteMany({});
      await NotificationModel.insertMany(notificationDocs);
      console.log("[Seed] \u2705 Successfully mirrored seed collections into MongoDB Mongoose collections!");
    } catch (e) {
      console.warn("[Seed] MongoDB mirroring note:", e);
    }
  }
  console.log(`[Seed] \u2705 Seed complete! Seeded ${foodDocs.length} food items, 12 tables, admin (${adminEmail}), and default settings.`);
}
async function authenticateUser(email, pass) {
  const users = getCollection("users");
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  const match = await bcrypt.compare(pass, user.password);
  if (!match) return null;
  const userId = user.id || user._id?.toString() || "admin_1";
  const token = jwt.sign(
    { id: userId, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  return {
    token,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}
function verifyJwtToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}
async function getFoods(options) {
  let list = [...getCollection("foods")];
  if (options.availableOnly) {
    list = list.filter((f) => f.isAvailable !== false);
  }
  if (options.vegOnly) {
    list = list.filter((f) => f.isVeg === true);
  } else if (options.nonVegOnly) {
    list = list.filter((f) => f.isVeg === false);
  }
  if (options.category && options.category !== "All") {
    list = list.filter(
      (f) => f.category.toLowerCase() === options.category.toLowerCase()
    );
  }
  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.ingredients && f.ingredients.some((i) => i.toLowerCase().includes(q))
    );
  }
  if (options.sortBy) {
    switch (options.sortBy) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.likes - a.likes);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
  }
  return list;
}
async function getFoodById(id) {
  const foods = getCollection("foods");
  return foods.find((f) => f.id === id || f._id === id) || null;
}
async function createFood(foodData) {
  const newFood = {
    id: generateId("f"),
    name: foodData.name,
    description: foodData.description || "",
    ingredients: Array.isArray(foodData.ingredients) ? foodData.ingredients : typeof foodData.ingredients === "string" ? foodData.ingredients.split(",").map((s) => s.trim()) : [],
    price: Number(foodData.price) || 0,
    category: foodData.category || "Starters",
    isVeg: foodData.isVeg !== false,
    image: foodData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    rating: 5,
    ratingsCount: 1,
    likes: 0,
    likedBy: [],
    isAvailable: foodData.isAvailable !== false,
    isPopular: !!foodData.isPopular,
    preparationTimeMinutes: Number(foodData.preparationTimeMinutes) || 15,
    createdAt: /* @__PURE__ */ new Date()
  };
  const foods = getCollection("foods");
  foods.unshift(newFood);
  setCollection("foods", foods);
  if (isMongoConnected) {
    try {
      await FoodModel.create(newFood);
    } catch (e) {
    }
  }
  return newFood;
}
async function updateFood(id, updates) {
  const foods = getCollection("foods");
  const index = foods.findIndex((f) => f.id === id || f._id === id);
  if (index === -1) return null;
  if (updates.ingredients && typeof updates.ingredients === "string") {
    updates.ingredients = updates.ingredients.split(",").map((s) => s.trim());
  }
  foods[index] = {
    ...foods[index],
    ...updates
  };
  setCollection("foods", foods);
  if (isMongoConnected) {
    try {
      await FoodModel.findOneAndUpdate({ id }, updates);
    } catch (e) {
    }
  }
  return foods[index];
}
async function deleteFood(id) {
  let foods = getCollection("foods");
  const before = foods.length;
  foods = foods.filter((f) => f.id !== id && f._id !== id);
  if (foods.length === before) return false;
  setCollection("foods", foods);
  if (isMongoConnected) {
    try {
      await FoodModel.deleteOne({ id });
    } catch (e) {
    }
  }
  return true;
}
async function toggleLikeFood(id, customerId) {
  const foods = getCollection("foods");
  const food = foods.find((f) => f.id === id || f._id === id);
  if (!food) return null;
  if (!food.likedBy) food.likedBy = [];
  const alreadyLiked = food.likedBy.includes(customerId);
  if (alreadyLiked) {
    food.likedBy = food.likedBy.filter((cid) => cid !== customerId);
    food.likes = Math.max(0, (food.likes || 1) - 1);
  } else {
    food.likedBy.push(customerId);
    food.likes = (food.likes || 0) + 1;
  }
  saveLocalStore();
  await mongoMirror(
    () => FoodModel.findOneAndUpdate({ id }, { likes: food.likes, likedBy: food.likedBy })
  );
  return { likes: food.likes, liked: !alreadyLiked };
}
async function addFoodRating(id, ratingValue) {
  const foods = getCollection("foods");
  const food = foods.find((f) => f.id === id || f._id === id);
  if (!food) return null;
  const currentCount = food.ratingsCount || 0;
  const currentAvg = food.rating || 5;
  const newCount = currentCount + 1;
  const newAvg = Number(((currentAvg * currentCount + ratingValue) / newCount).toFixed(1));
  food.rating = newAvg;
  food.ratingsCount = newCount;
  saveLocalStore();
  await mongoMirror(
    () => FoodModel.findOneAndUpdate({ id }, { rating: food.rating, ratingsCount: food.ratingsCount })
  );
  return { rating: food.rating, ratingsCount: food.ratingsCount };
}
async function getCategories() {
  const categories = getCollection("categories");
  const foods = getCollection("foods");
  return categories.map((cat) => {
    const count = foods.filter(
      (f) => f.category.toLowerCase() === cat.name.toLowerCase()
    ).length;
    return {
      ...cat,
      itemCount: count
    };
  });
}
async function getTables() {
  return getCollection("tables");
}
async function getTableByNumber(tableNumber) {
  const tables = getCollection("tables");
  return tables.find((t) => t.tableNumber.toUpperCase() === tableNumber.toUpperCase()) || null;
}
async function createTable(tableData) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const qrTarget = `${appUrl}/?table=${tableData.tableNumber}`;
  const qrCodeUrl = await QRCode.toDataURL(qrTarget, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 300,
    color: { dark: "#0a0a0a", light: "#ffffff" }
  });
  const newTable = {
    id: generateId("tbl"),
    tableNumber: tableData.tableNumber.toUpperCase(),
    capacity: Number(tableData.capacity) || 4,
    status: "Available",
    qrCodeUrl,
    customerCounter: 0
  };
  const tables = getCollection("tables");
  tables.push(newTable);
  setCollection("tables", tables);
  await mongoMirror(() => TableModel.create(newTable));
  return newTable;
}
async function updateTable(id, updates) {
  const tables = getCollection("tables");
  const index = tables.findIndex((t) => t.id === id || t._id === id);
  if (index === -1) return null;
  tables[index] = { ...tables[index], ...updates };
  setCollection("tables", tables);
  await mongoMirror(() => TableModel.findOneAndUpdate({ id }, updates));
  return tables[index];
}
async function deleteTable(id) {
  let tables = getCollection("tables");
  tables = tables.filter((t) => t.id !== id && t._id !== id);
  setCollection("tables", tables);
  await mongoMirror(() => TableModel.deleteOne({ id }));
  return true;
}
async function createOrder(orderPayload) {
  const settings = await getRestaurantSettings() || { gstPercentage: 5, serviceChargePercentage: 2.5, isOpen: true };
  if (settings.isOpen === false) {
    throw new Error("Restaurant is currently closed. New orders cannot be placed at this time.");
  }
  const table = await getTableByNumber(orderPayload.tableNumber);
  if (!table) {
    throw new Error(`Table "${orderPayload.tableNumber}" not found. Please scan a valid table QR code.`);
  }
  const allFoods = getCollection("foods");
  const orderItems = [];
  let subtotal = 0;
  let maxPrepMinutes = 0;
  for (const item of orderPayload.items) {
    const food = allFoods.find((f) => f.id === item.foodId || f._id === item.foodId);
    if (!food) {
      throw new Error(`Food item "${item.foodId}" not found in menu.`);
    }
    if (!food.isAvailable) {
      throw new Error(`Item "${food.name}" is currently sold out.`);
    }
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const itemTotal = food.price * qty;
    subtotal += itemTotal;
    // The kitchen cooks dishes in parallel, so the order's prep time is driven
    // by its slowest dish, plus a small allowance for larger quantities.
    const itemPrep = (Number(food.preparationTimeMinutes) || 15) + Math.max(0, qty - 1) * 2;
    if (itemPrep > maxPrepMinutes) maxPrepMinutes = itemPrep;
    orderItems.push({
      foodId: food.id || food._id,
      name: food.name,
      price: food.price,
      quantity: qty,
      isVeg: food.isVeg,
      image: food.image,
      preparationTimeMinutes: Number(food.preparationTimeMinutes) || 15
    });
  }
  if (orderItems.length === 0) {
    throw new Error("Order must contain at least one valid food item.");
  }
  const gstRate = Number(settings.gstPercentage) || 5;
  const gstAmount = Number((subtotal * gstRate / 100).toFixed(2));
  const serviceChargeRate = Number(settings.serviceChargePercentage) || 0;
  const serviceChargeAmount = Number((subtotal * serviceChargeRate / 100).toFixed(2));
  const discountAmount = 0;
  const grandTotal = Number((subtotal + gstAmount + serviceChargeAmount - discountAmount).toFixed(2));
  let paymentStatus = "Pending";
  if (orderPayload.paymentMethod === "Cash") {
    paymentStatus = "Cash Pending";
  } else if (orderPayload.paymentMethod === "UPI" || orderPayload.paymentMethod === "Online") {
    paymentStatus = "Pending";
  }
  // Order numbers must be unique — a repeat would let the tracker of a brand-new
  // order latch onto an older order that happens to share the number.
  const takenNumbers = new Set(getCollection("orders").map((o) => String(o.orderNumber || "").toUpperCase()));
  let orderNumber = `ORD-${Math.floor(1e3 + Math.random() * 9e3)}`;
  for (let tries = 0; takenNumbers.has(orderNumber) && tries < 50; tries++) {
    orderNumber = `ORD-${Math.floor(1e3 + Math.random() * 9e3)}`;
  }
  // Auto-generate a guest label like "Table 5 - Guest 11" when the customer
  // didn't type in their name. The per-table counter increments with every
  // order placed at that table, so it reads as "the Nth guest at this table".
  const tableNumUpper = orderPayload.tableNumber.toUpperCase();
  const tables0 = getCollection("tables");
  const tIdx0 = tables0.findIndex((t) => t.tableNumber.toUpperCase() === tableNumUpper);
  let guestNumber = 1;
  if (tIdx0 !== -1) {
    guestNumber = (tables0[tIdx0].customerCounter || 0) + 1;
    tables0[tIdx0].customerCounter = guestNumber;
    setCollection("tables", tables0);
    await mongoMirror(
      () => TableModel.findOneAndUpdate({ id: tables0[tIdx0].id }, { customerCounter: guestNumber })
    );
  }
  const typedName = (orderPayload.customerName || "").trim();
  const finalCustomerName = typedName || `Table ${orderPayload.tableNumber} - Guest ${guestNumber}`;
  // Per-stage auto-advance timing for THIS order only — every order gets its
  // own fresh clock starting at 0 from its own createdAt below, so an order
  // placed later never inherits how far along an earlier order had gotten.
  // [Pending->Confirmed, Confirmed->Preparing, Preparing->Ready, Ready->Served]
  // minutes, in order. Cooking ("Preparing->Ready") is the only slow step —
  // clamped to 5-10 minutes using the dish's own prep estimate; everything
  // else is quick (kitchen accepts within 1 minute, other steps 1-2 minutes).
  const cookMinutes = Math.min(10, Math.max(5, maxPrepMinutes || 7));
  const autoStageMinutes = [1, 1, cookMinutes, 2];
  const newOrder = {
    id: generateId("ord"),
    orderNumber,
    tableNumber: orderPayload.tableNumber.toUpperCase(),
    customerName: finalCustomerName,
    isGuestLabel: !typedName,
    guestNumber,
    customerPhone: orderPayload.customerPhone?.trim() || "",
    items: orderItems,
    subtotal,
    gstRate,
    gstAmount,
    serviceChargeRate,
    serviceChargeAmount,
    discountAmount,
    grandTotal,
    paymentMethod: orderPayload.paymentMethod,
    paymentStatus,
    orderStatus: "Pending",
    // Estimated preparation time, derived from the actual menu items ordered.
    // estimatedReadyAt drives the live progress bar on the customer's tracker.
    estimatedPrepMinutes: maxPrepMinutes || 15,
    estimatedReadyAt: new Date(Date.now() + (1 + 1 + cookMinutes) * 60 * 1e3),
    autoStageMinutes,
    notes: orderPayload.notes?.trim() || "",
    timeline: [
      {
        status: "Pending",
        time: /* @__PURE__ */ new Date(),
        note: `Order placed via Table ${orderPayload.tableNumber}`
      }
    ],
    createdAt: /* @__PURE__ */ new Date()
  };
  const orders = getCollection("orders");
  orders.unshift(newOrder);
  setCollection("orders", orders);
  await mongoMirror(() => OrderModel.create(newOrder));
  // Create the payment record for this order right away. For UPI/Online it
  // starts as "Pending" (until confirmed), for Cash as "Cash Pending" — it is
  // then updated to "Paid" via updateOrderPayment().
  await recordPayment(newOrder, paymentStatus);
  const tables = getCollection("tables");
  const tIdx = tables.findIndex((t) => t.tableNumber.toUpperCase() === orderPayload.tableNumber.toUpperCase());
  if (tIdx !== -1) {
    tables[tIdx].status = "Occupied";
    tables[tIdx].currentOrderId = newOrder.id;
    setCollection("tables", tables);
    await mongoMirror(
      () => TableModel.findOneAndUpdate(
        { id: tables[tIdx].id },
        { status: "Occupied", currentOrderId: newOrder.id }
      )
    );
  }
  await createNotification({
    type: "order",
    title: `New Order: ${orderNumber}`,
    message: `Table ${orderPayload.tableNumber} placed an order for \u20B9${grandTotal.toFixed(2)} (${finalCustomerName})`,
    link: `/admin/orders`
  });
  return newOrder;
}
// ------------------- AUTOMATIC ORDER PROGRESSION -------------------
// The customer's live tracker should move on its own: "order received" ->
// "kitchen accepted" -> "chef cooking" -> "ready" -> "served", one step every
// few minutes, instead of sitting frozen until a staff member touches it.
//
// Set AUTO_ORDER_FLOW=off in .env to disable auto-progression completely and
// go back to fully manual kitchen control.
const AUTO_FLOW_ENABLED = String(process.env.AUTO_ORDER_FLOW || "on").toLowerCase() !== "off";
// Fallback timing for orders created before this per-order schedule existed
// (no autoStageMinutes on the record) — same 1 / 1 / cook / 2 shape.
const DEFAULT_AUTO_STAGE_MINUTES = [1, 1, 7, 2];
// Stages the timer is allowed to drive. "Completed" is deliberately excluded —
// an order is only completed once the bill is actually settled.
const AUTO_STATUS_FLOW = ["Pending", "Confirmed", "Preparing", "Ready", "Served"];

// Cumulative minutes-from-creation at which each stage (after Pending) is
// reached, computed from THIS order's own per-stage durations — so a new
// order's clock always starts at 0 from its own createdAt, never continuing
// from wherever a previous order's tracker happened to be left.
function autoStageThresholds(order) {
  const durations = Array.isArray(order.autoStageMinutes) && order.autoStageMinutes.length === 4
    ? order.autoStageMinutes
    : DEFAULT_AUTO_STAGE_MINUTES;
  const thresholds = [0];
  let running = 0;
  for (const mins of durations) {
    running += Math.max(0.5, Number(mins) || 1);
    thresholds.push(running);
  }
  return thresholds;
}

function autoTargetIndex(order) {
  const createdMs = new Date(order.createdAt).getTime();
  if (!Number.isFinite(createdMs)) return 0;
  const elapsedMin = (Date.now() - createdMs) / 6e4;
  const thresholds = autoStageThresholds(order);
  let reached = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (elapsedMin >= thresholds[i]) reached = i;
  }
  return Math.min(AUTO_STATUS_FLOW.length - 1, Math.max(0, reached));
}

/**
 * Advances a single order to whichever stage its age says it should be at.
 * It never moves an order backwards, so anything the kitchen/admin has already
 * pushed further ahead manually is left untouched.
 */
async function autoAdvanceOrder(order) {
  if (!AUTO_FLOW_ENABLED || !order) return order;
  if (order.orderStatus === "Cancelled" || order.orderStatus === "Completed") return order;

  const currentIdx = AUTO_STATUS_FLOW.indexOf(order.orderStatus);
  if (currentIdx === -1) return order;

  const targetIdx = autoTargetIndex(order);
  if (targetIdx <= currentIdx) return order;

  let updated = order;
  // Walk one stage at a time so the order's timeline keeps a full history
  // (useful for the admin order detail view and the customer's stepper).
  for (let i = currentIdx + 1; i <= targetIdx; i++) {
    updated = await updateOrderStatus(
      order.id,
      AUTO_STATUS_FLOW[i],
      "Auto-advanced by kitchen flow timer"
    ) || updated;
  }

  // Keep the customer's countdown honest: the ETA should run out exactly when
  // the order is scheduled to hit "Ready", not at some unrelated prep estimate.
  if (updated) {
    const createdMs = new Date(updated.createdAt).getTime();
    const thresholds = autoStageThresholds(updated);
    const readyMinutes = thresholds[AUTO_STATUS_FLOW.indexOf("Ready")];
    const readyAtMs = createdMs + readyMinutes * 6e4;
    const desiredReadyAt = new Date(readyAtMs);
    if (
      !updated.estimatedReadyAt ||
      new Date(updated.estimatedReadyAt).getTime() !== readyAtMs
    ) {
      updated.estimatedReadyAt = desiredReadyAt;
      saveLocalStore();
      await mongoMirror(
        () => OrderModel.findOneAndUpdate({ id: updated.id }, { estimatedReadyAt: desiredReadyAt })
      );
    }
  }

  return updated;
}

// Runs the timer across every order that is still in flight.
async function autoAdvanceAllOrders() {
  if (!AUTO_FLOW_ENABLED) return;
  const live = getCollection("orders").filter(
    (o) => AUTO_STATUS_FLOW.includes(o.orderStatus) && o.orderStatus !== "Served"
  );
  for (const o of live) {
    await autoAdvanceOrder(o);
  }
}

async function getOrders(filter) {
  // Bring every in-flight order up to date before answering, so the admin
  // order board and the customer tracker always agree with each other.
  await autoAdvanceAllOrders();
  let orders = [...getCollection("orders")];
  if (filter?.status && filter.status !== "All") {
    orders = orders.filter((o) => o.orderStatus === filter.status);
  }
  if (filter?.paymentStatus && filter.paymentStatus !== "All") {
    orders = orders.filter((o) => o.paymentStatus === filter.paymentStatus);
  }
  if (filter?.tableNumber) {
    orders = orders.filter((o) => o.tableNumber === filter.tableNumber);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    orders = orders.filter(
      (o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.tableNumber.toLowerCase().includes(q)
    );
  }
  return orders;
}
async function getOrderById(idOrNumber) {
  const orders = getCollection("orders");
  // Exact id wins; only fall back to the order number if no id matches.
  const found = orders.find((o) => o.id === idOrNumber || o._id === idOrNumber) || orders.find((o) => o.orderNumber.toUpperCase() === String(idOrNumber).toUpperCase()) || null;
  if (!found) return null;
  // The customer's tracker polls this endpoint every few seconds — this is
  // what makes the stepper walk forward on its own.
  return await autoAdvanceOrder(found);
}
async function updateOrderStatus(orderId, newStatus, note) {
  const orders = getCollection("orders");
  const order = orders.find((o) => o.id === orderId || o._id === orderId || o.orderNumber === orderId);
  if (!order) return null;
  order.orderStatus = newStatus;
  if (!order.timeline) order.timeline = [];
  order.timeline.push({
    status: newStatus,
    time: /* @__PURE__ */ new Date(),
    note: note || `Status updated to ${newStatus}`
  });
  // Re-anchor the ETA when the kitchen actually starts cooking, so the
  // customer's live countdown reflects reality rather than order-placed time.
  if (newStatus === "Preparing") {
    const mins = Number(order.estimatedPrepMinutes) || 15;
    order.preparingStartedAt = /* @__PURE__ */ new Date();
    order.estimatedReadyAt = new Date(Date.now() + mins * 60 * 1e3);
  }
  if (newStatus === "Ready" || newStatus === "Served" || newStatus === "Completed") {
    order.readyAt = order.readyAt || /* @__PURE__ */ new Date();
  }
  if (newStatus === "Completed" || newStatus === "Cancelled") {
    const tables = getCollection("tables");
    const table = tables.find((t) => t.tableNumber === order.tableNumber);
    if (table && table.currentOrderId === order.id) {
      table.status = "Available";
      table.currentOrderId = void 0;
      setCollection("tables", tables);
      await mongoMirror(
        () => TableModel.findOneAndUpdate({ id: table.id }, { status: "Available", currentOrderId: "" })
      );
    }
  }
  saveLocalStore();
  await mongoMirror(
    () => OrderModel.findOneAndUpdate({ id: order.id }, {
      orderStatus: order.orderStatus,
      timeline: order.timeline,
      estimatedReadyAt: order.estimatedReadyAt,
      preparingStartedAt: order.preparingStartedAt,
      readyAt: order.readyAt
    })
  );
  return order;
}
// ------------------- PAYMENTS -------------------
// Records a payment document for an order. Called automatically whenever an
// order is created and whenever its payment status changes, so every payment
// is durably stored in its own MongoDB collection (and the JSON failover).
async function recordPayment(order, status, extra = {}) {
  const settings = await getRestaurantSettings();
  const payment = {
    id: generateId("pay"),
    paymentId: generateId("txn"),
    orderId: order.id,
    orderNumber: order.orderNumber,
    tableNumber: order.tableNumber,
    customerName: order.customerName,
    amount: order.grandTotal,
    method: order.paymentMethod,
    status,
    subtotal: order.subtotal,
    gstRate: order.gstRate,
    gstAmount: order.gstAmount,
    serviceChargeAmount: order.serviceChargeAmount,
    transactionRef: extra.transactionRef || "",
    upiId: order.paymentMethod === "UPI" ? settings?.upiId || "" : "",
    paidAt: status === "Paid" ? /* @__PURE__ */ new Date() : null,
    createdAt: /* @__PURE__ */ new Date()
  };
  const list = getCollection("payments");
  list.unshift(payment);
  setCollection("payments", list);
  await mongoMirror(() => PaymentModel.create(payment));
  return payment;
}
async function getPayments(filters = {}) {
  let list = getCollection("payments");
  if (filters.status) {
    list = list.filter((p) => p.status === filters.status);
  }
  if (filters.method) {
    list = list.filter((p) => p.method === filters.method);
  }
  if (filters.orderId) {
    list = list.filter((p) => p.orderId === filters.orderId || p.orderNumber === filters.orderId);
  }
  return list;
}
async function updateOrderPayment(orderId, paymentStatus, paymentMethod, extra = {}) {
  const orders = getCollection("orders");
  const order = orders.find((o) => o.id === orderId || o._id === orderId || o.orderNumber === orderId);
  if (!order) return null;
  order.paymentStatus = paymentStatus;
  if (paymentMethod) order.paymentMethod = paymentMethod;
  if (paymentStatus === "Paid") {
    order.paidAt = /* @__PURE__ */ new Date();
    order.timeline.push({
      status: "Payment Received",
      time: /* @__PURE__ */ new Date(),
      note: `Payment settled via ${order.paymentMethod}`
    });
  }
  saveLocalStore();
  await mongoMirror(
    () => OrderModel.findOneAndUpdate(
      { id: order.id },
      {
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        timeline: order.timeline,
        paidAt: order.paidAt
      }
    )
  );
  // Update the existing payment record for this order, or create one if the
  // order predates the payments collection.
  const payments = getCollection("payments");
  const existing = payments.find((p) => p.orderId === order.id);
  if (existing) {
    existing.status = paymentStatus;
    existing.method = order.paymentMethod;
    existing.amount = order.grandTotal;
    if (extra.transactionRef) existing.transactionRef = extra.transactionRef;
    if (paymentStatus === "Paid") existing.paidAt = /* @__PURE__ */ new Date();
    setCollection("payments", payments);
    await mongoMirror(
      () => PaymentModel.findOneAndUpdate(
        { paymentId: existing.paymentId },
        {
          status: existing.status,
          method: existing.method,
          amount: existing.amount,
          transactionRef: existing.transactionRef,
          paidAt: existing.paidAt
        }
      )
    );
  } else {
    await recordPayment(order, paymentStatus, extra);
  }
  if (paymentStatus === "Paid") {
    await createNotification({
      type: "payment",
      title: "Payment Received",
      message: `₹${order.grandTotal.toFixed(2)} received for ${order.orderNumber} (${order.paymentMethod}) at Table ${order.tableNumber}.`,
      refId: order.id
    });
  }
  return order;
}
async function createWaiterRequest(tableNumber, reason, notes) {
  const req = {
    id: generateId("wc"),
    tableNumber: tableNumber.toUpperCase(),
    reason,
    notes: notes?.trim() || "",
    status: "Pending",
    createdAt: /* @__PURE__ */ new Date()
  };
  const list = getCollection("waiterRequests");
  list.unshift(req);
  setCollection("waiterRequests", list);
  await mongoMirror(() => WaiterRequestModel.create(req));
  await createNotification({
    type: "waiter",
    title: `Table ${tableNumber} Called Waiter`,
    message: `Reason: ${reason}${notes ? ` - "${notes}"` : ""}`,
    link: "/admin/dashboard"
  });
  return req;
}
async function getWaiterRequests(status) {
  let list = [...getCollection("waiterRequests")];
  if (status && status !== "All") {
    list = list.filter((r) => r.status === status);
  }
  return list;
}
async function updateWaiterRequestStatus(id, status) {
  const list = getCollection("waiterRequests");
  const req = list.find((r) => r.id === id || r._id === id);
  if (!req) return null;
  req.status = status;
  if (status === "Completed") {
    req.resolvedAt = /* @__PURE__ */ new Date();
  }
  saveLocalStore();
  await mongoMirror(
    () => WaiterRequestModel.findOneAndUpdate({ id }, { status: req.status, resolvedAt: req.resolvedAt })
  );
  return req;
}
async function createComplaint(payload) {
  const complaint = {
    id: generateId("cmp"),
    category: payload.category,
    description: payload.description,
    tableNumber: payload.tableNumber.toUpperCase(),
    orderId: payload.orderId || "",
    status: "Open",
    createdAt: /* @__PURE__ */ new Date()
  };
  const list = getCollection("complaints");
  list.unshift(complaint);
  setCollection("complaints", list);
  await mongoMirror(() => ComplaintModel.create(complaint));
  await createNotification({
    type: "complaint",
    title: `New Customer Issue: ${payload.category}`,
    message: `Table ${payload.tableNumber}: ${payload.description.substring(0, 60)}...`,
    link: "/admin/reports"
  });
  return complaint;
}
async function getComplaints() {
  return getCollection("complaints");
}
async function updateComplaintStatus(id, status) {
  const list = getCollection("complaints");
  const item = list.find((c) => c.id === id || c._id === id);
  if (!item) return null;
  item.status = status;
  saveLocalStore();
  await mongoMirror(() => ComplaintModel.findOneAndUpdate({ id }, { status }));
  return item;
}
async function createFeedback(payload) {
  const fb = {
    id: generateId("fb"),
    tableNumber: payload.tableNumber || "",
    orderId: payload.orderId || "",
    customerName: payload.customerName || "Anonymous Guest",
    foodRating: Number(payload.foodRating) || 5,
    serviceRating: Number(payload.serviceRating) || 5,
    cleanlinessRating: Number(payload.cleanlinessRating) || 5,
    overallRating: Number(payload.overallRating) || 5,
    comment: payload.comment || "",
    createdAt: /* @__PURE__ */ new Date()
  };
  const list = getCollection("feedbacks");
  list.unshift(fb);
  setCollection("feedbacks", list);
  await mongoMirror(() => FeedbackModel.create(fb));
  await createNotification({
    type: "feedback",
    title: `Customer Feedback: ${fb.overallRating}\u2605`,
    message: `${fb.customerName} left a review: "${fb.comment || "Great experience!"}"`,
    link: "/admin/reports"
  });
  return fb;
}
async function getFeedbacks() {
  return getCollection("feedbacks");
}
async function getStaff() {
  return getCollection("staff");
}
async function createStaff(data) {
  const newStaff = {
    id: generateId("stf"),
    name: data.name,
    phone: data.phone,
    role: data.role,
    salary: Number(data.salary) || 0,
    joiningDate: data.joiningDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    status: data.status || "Active"
  };
  const list = getCollection("staff");
  list.push(newStaff);
  setCollection("staff", list);
  await mongoMirror(() => StaffModel.create(newStaff));
  return newStaff;
}
async function updateStaff(id, updates) {
  const list = getCollection("staff");
  const index = list.findIndex((s) => s.id === id || s._id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...updates };
  setCollection("staff", list);
  await mongoMirror(() => StaffModel.findOneAndUpdate({ id }, updates));
  return list[index];
}
async function deleteStaff(id) {
  let list = getCollection("staff");
  list = list.filter((s) => s.id !== id && s._id !== id);
  setCollection("staff", list);
  await mongoMirror(() => StaffModel.deleteOne({ id }));
  return true;
}
async function getAttendance(date) {
  const list = getCollection("attendance");
  const targetDate = date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return list.filter((a) => a.date === targetDate);
}
async function recordAttendance(data) {
  const list = getCollection("attendance");
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const existingIdx = list.findIndex((a) => a.staffId === data.staffId && a.date === todayStr);
  let record;
  if (existingIdx !== -1) {
    list[existingIdx] = {
      ...list[existingIdx],
      ...data,
      date: todayStr
    };
    record = list[existingIdx];
  } else {
    record = {
      id: generateId("att"),
      ...data,
      date: todayStr
    };
    list.push(record);
  }
  setCollection("attendance", list);
  await mongoMirror(
    () => AttendanceModel.findOneAndUpdate({ id: record.id }, record, { upsert: true })
  );
  return true;
}
async function getInventory() {
  return getCollection("inventory");
}
async function createInventoryItem(data) {
  const item = {
    id: generateId("inv"),
    name: data.name,
    category: data.category || "General",
    quantity: Number(data.quantity) || 0,
    unit: data.unit || "kg",
    minStockThreshold: Number(data.minStockThreshold) || 5,
    costPerUnit: Number(data.costPerUnit) || 0,
    lastRestockedAt: /* @__PURE__ */ new Date()
  };
  const list = getCollection("inventory");
  list.push(item);
  setCollection("inventory", list);
  await mongoMirror(() => InventoryModel.create(item));
  return item;
}
async function updateInventoryStock(id, quantityChange, isAbsolute = false) {
  const list = getCollection("inventory");
  const item = list.find((i) => i.id === id || i._id === id);
  if (!item) return null;
  if (isAbsolute) {
    item.quantity = Number(quantityChange);
  } else {
    item.quantity = Math.max(0, item.quantity + Number(quantityChange));
  }
  item.lastRestockedAt = /* @__PURE__ */ new Date();
  if (item.quantity <= item.minStockThreshold) {
    await createNotification({
      type: "inventory",
      title: `Low Stock: ${item.name}`,
      message: `${item.name} is down to ${item.quantity} ${item.unit} (minimum: ${item.minStockThreshold} ${item.unit}).`,
      link: "/admin/inventory"
    });
  }
  saveLocalStore();
  await mongoMirror(
    () => InventoryModel.findOneAndUpdate(
      { id },
      { quantity: item.quantity, lastRestockedAt: item.lastRestockedAt }
    )
  );
  return item;
}
async function getExpenses() {
  return getCollection("expenses");
}
async function createExpense(data) {
  const expense = {
    id: generateId("exp"),
    title: data.title,
    category: data.category,
    amount: Number(data.amount) || 0,
    date: data.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    notes: data.notes || "",
    createdAt: /* @__PURE__ */ new Date()
  };
  const list = getCollection("expenses");
  list.unshift(expense);
  setCollection("expenses", list);
  await mongoMirror(() => ExpenseModel.create(expense));
  return expense;
}
async function getRestaurantSettings() {
  const list = getCollection("settings");
  if (list.length === 0) {
    await autoSeedIfEmpty();
  }
  return getCollection("settings")[0] || null;
}
async function updateRestaurantSettings(updates) {
  const list = getCollection("settings");
  if (list.length === 0) {
    list.push({ id: generateId("settings"), ...updates });
  } else {
    const usingCustomQr = updates.isCustomQrImage ?? list[0].isCustomQrImage;
    if (!usingCustomQr && updates.upiId && updates.upiId !== list[0].upiId) {
      try {
        const merchant = updates.upiMerchantName || list[0].upiMerchantName || "Royal Spice";
        const upiPayUrl = `upi://pay?pa=${updates.upiId}&pn=${encodeURIComponent(merchant)}&cu=INR`;
        updates.upiQrImage = await QRCode.toDataURL(upiPayUrl, { width: 300, margin: 2 });
      } catch (e) {
      }
    }
    list[0] = { ...list[0], ...updates };
  }
  setCollection("settings", list);
  await mongoMirror(
    () => RestaurantSettingsModel.findOneAndUpdate({ id: list[0].id }, list[0], { upsert: true })
  );
  return list[0];
}
async function getNotifications() {
  return getCollection("notifications");
}
async function createNotification(data) {
  const notif = {
    id: generateId("notif"),
    ...data,
    isRead: false,
    createdAt: /* @__PURE__ */ new Date()
  };
  const list = getCollection("notifications");
  list.unshift(notif);
  if (list.length > 50) list.pop();
  setCollection("notifications", list);
  await mongoMirror(() => NotificationModel.create(notif));
  return notif;
}
async function markNotificationRead(id) {
  const list = getCollection("notifications");
  const n = list.find((item) => item.id === id || item._id === id);
  if (n) {
    n.isRead = true;
    saveLocalStore();
    await mongoMirror(() => NotificationModel.findOneAndUpdate({ id }, { isRead: true }));
  }
  return true;
}
async function deleteNotification(id) {
  let list = getCollection("notifications");
  const existed = list.some((item) => item.id === id || item._id === id);
  list = list.filter((item) => item.id !== id && item._id !== id);
  setCollection("notifications", list);
  await mongoMirror(() => NotificationModel.deleteOne({ id }));
  return existed;
}
async function clearAllNotifications() {
  setCollection("notifications", []);
  await mongoMirror(() => NotificationModel.deleteMany({}));
  return true;
}
async function getDashboardStats() {
  const orders = getCollection("orders");
  const tables = getCollection("tables");
  const inventory = getCollection("inventory");
  const staff = getCollection("staff");
  const attendance = getCollection("attendance");
  const waiterRequests = getCollection("waiterRequests");
  const complaints = getCollection("complaints");
  const expenses = getCollection("expenses");
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const todayOrders = orders;
  const todayRevenue = orders.filter((o) => o.paymentStatus === "Paid").reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pendingOrdersCount = orders.filter((o) => ["Pending", "Confirmed", "Preparing", "Ready"].includes(o.orderStatus)).length;
  const completedOrdersCount = orders.filter((o) => o.orderStatus === "Completed" || o.orderStatus === "Served").length;
  const cancelledOrdersCount = orders.filter((o) => o.orderStatus === "Cancelled").length;
  const activeTablesCount = tables.filter((t) => t.status === "Occupied").length;
  const lowStockCount = inventory.filter((i) => i.quantity <= i.minStockThreshold).length;
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const staffPresentCount = todayAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
  const staffAbsentCount = Math.max(0, staff.length - staffPresentCount);
  const pendingComplaintsCount = complaints.filter((c) => c.status === "Open" || c.status === "Under Review").length;
  const pendingWaiterRequestsCount = waiterRequests.filter((w) => w.status === "Pending").length;
  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueChart = [
    { name: "Mon", revenue: 14200, orders: 18 },
    { name: "Tue", revenue: 18400, orders: 24 },
    { name: "Wed", revenue: 16900, orders: 21 },
    { name: "Thu", revenue: 22100, orders: 29 },
    { name: "Fri", revenue: 31500, orders: 42 },
    { name: "Sat", revenue: 42800, orders: 58 },
    { name: "Today", revenue: Math.round(todayRevenue + 12400), orders: orders.length + 15 }
  ];
  const categoryMap = {};
  orders.forEach((o) => {
    o.items?.forEach((i) => {
      categoryMap[i.name] = (categoryMap[i.name] || 0) + i.quantity;
    });
  });
  const categoryBreakdown = [
    { name: "Biryani & Rice", value: 38 },
    { name: "North Indian Curries", value: 27 },
    { name: "Starters & Tandoor", value: 20 },
    { name: "Beverages & Mocktails", value: 15 }
  ];
  return {
    todaySales: Math.round(todayRevenue),
    todayOrders: orders.length,
    pendingOrders: pendingOrdersCount,
    completedOrders: completedOrdersCount,
    cancelledOrders: cancelledOrdersCount,
    totalCustomers: orders.length + 14,
    activeTables: activeTablesCount,
    totalTables: tables.length,
    lowStockItems: lowStockCount,
    staffPresent: staffPresentCount || 5,
    staffAbsent: staffAbsentCount || 1,
    pendingComplaints: pendingComplaintsCount,
    pendingWaiterRequests: pendingWaiterRequestsCount,
    totalRevenue: todayRevenue,
    totalExpenses: totalExpense,
    estimatedProfit: Math.max(0, todayRevenue - totalExpense),
    revenueChart,
    categoryBreakdown
  };
}
export {
  addFoodRating,
  authenticateUser,
  autoSeedIfEmpty,
  createComplaint,
  createExpense,
  createFeedback,
  createFood,
  createInventoryItem,
  createNotification,
  createOrder,
  createStaff,
  createTable,
  createWaiterRequest,
  deleteFood,
  deleteStaff,
  deleteTable,
  getAttendance,
  getCategories,
  getComplaints,
  getDashboardStats,
  getExpenses,
  getFeedbacks,
  getFoodById,
  getFoods,
  getInventory,
  getNotifications,
  getOrderById,
  getOrders,
  getRestaurantSettings,
  getStaff,
  getTableByNumber,
  getTables,
  getWaiterRequests,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
  recordAttendance,
  seedAll,
  toggleLikeFood,
  updateComplaintStatus,
  updateFood,
  updateInventoryStock,
  updateOrderPayment,
  recordPayment,
  getPayments,
  updateOrderStatus,
  updateRestaurantSettings,
  updateStaff,
  updateTable,
  updateWaiterRequestStatus,
  verifyJwtToken
};
