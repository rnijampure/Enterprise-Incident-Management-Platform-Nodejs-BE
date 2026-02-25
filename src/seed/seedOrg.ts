// src/seedOrg.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import Region from "../models/Region.js";
import Department from "../models/Department.js";
import Team from "../models/Team.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedOrg = async () => {
  try {
    await connectDB();

    // 1️⃣ Clear existing collections (optional)
    await Region.deleteMany({});
    await Department.deleteMany({});
    await Team.deleteMany({});

    // 2️⃣ Seed Regions
    const regions = await Region.create([
      { name: "North America" },
      { name: "Europe" },
      { name: "Asia" },
    ]);
    if (regions.length < 3) {
      throw new Error("Expected 3 regions");
    }

    const [na, eu, asia] = regions!;

    const departments = await Department.create([
      { name: "Engineering", regionId: na!._id! },
      { name: "Security", regionId: na!._id! },
      { name: "Operations", regionId: eu!._id! },
      { name: "IT Support", regionId: eu!._id! },
      { name: "Development", regionId: asia!._id! },
      { name: "Software", regionId: asia!._id! },
    ]);

    const [eng, sec, ops, its, dev, sw] = departments;

    // 4️⃣ Seed Teams
    const teams = await Team.create([
      { name: "Cloud Infra", departmentId: eng!._id },
      { name: "Payment Gateway", departmentId: eng!._id },
      { name: "SOC", departmentId: sec!._id },
      { name: "Helpdesk", departmentId: its!._id },
      { name: "Frontend", departmentId: dev!._id },
      { name: "Backend", departmentId: sw!._id },
    ]);

    console.log("✅ Regions, Departments, Teams seeded successfully");
    console.log(
      "Regions:",
      regions.map((r) => r.name),
    );
    console.log(
      "Departments:",
      departments.map((d) => d.name),
    );
    console.log(
      "Teams:",
      teams.map((t) => t.name),
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedOrg();
