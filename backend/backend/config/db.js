import mongoose from "mongoose";
import fs from "fs";
import path from "path";
let isMongoConnected = false;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "smart_restaurant_db.json");
let localStore = {
  users: [],
  foods: [],
  categories: [],
  orders: [],
  tables: [],
  waiterRequests: [],
  complaints: [],
  feedbacks: [],
  staff: [],
  attendance: [],
  inventory: [],
  expenses: [],
  settings: [],
  notifications: [],
  payments: []
};
function initLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      if (raw.trim()) {
        localStore = { ...localStore, ...JSON.parse(raw) };
      }
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(localStore, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("[DB] Local store init warning:", err);
  }
}
function saveLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(localStore, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] Failed to persist store to disk:", err);
  }
}
function getCollection(name) {
  if (!localStore[name]) {
    localStore[name] = [];
  }
  return localStore[name];
}
function setCollection(name, items) {
  localStore[name] = items;
  saveLocalStore();
}
async function connectDB() {
  initLocalStore();
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart_restaurant";
  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    isMongoConnected = true;
    console.log("[DB] \u2705 Successfully connected to MongoDB / Compass!");
  } catch (error) {
    isMongoConnected = false;
    console.log(`[DB] \u2139\uFE0F MongoDB connection not available at ${uri} (${error.message || "connection failed"}).`);
    console.log("[DB] \u26A1 Using persistent embedded JSON engine with full CRUD & durability.");
  }
}
export {
  connectDB,
  getCollection,
  initLocalStore,
  isMongoConnected,
  saveLocalStore,
  setCollection
};
