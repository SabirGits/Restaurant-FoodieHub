import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.js";
import { seedAll } from "./services/dbService.js";
async function runSeed() {
  console.log("==================================================");
  console.log("\u{1F331} Starting Smart Restaurant Database Seeding");
  console.log("==================================================");
  await connectDB();
  await seedAll();
  console.log("==================================================");
  console.log("\u2728 Seed Finished Successfully!");
  console.log("Admin Email:    admin@restaurant.com");
  console.log("Admin Password: Admin@123456");
  console.log("==================================================");
  process.exit(0);
}
runSeed().catch((err) => {
  console.error("\u274C Seeding failed:", err);
  process.exit(1);
});
