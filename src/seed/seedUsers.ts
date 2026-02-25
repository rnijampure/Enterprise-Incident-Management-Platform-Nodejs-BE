import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Department from "../models/Department.js";
import Region from "../models/Region.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    // 1️⃣ Clear existing users
    await User.deleteMany({});

    // 2️⃣ Fetch teams, departments, regions
    const teams = await Team.find();
    const departments = await Department.find();
    const regions = await Region.find();

    if (!teams.length || !departments.length || !regions.length) {
      throw new Error(
        "Teams, Departments, or Regions missing! Seed Org first.",
      );
    }

    // Helper to get names
    const getTeamName = (teamId: string) =>
      teams.find((t: any) => t._id.toString() === teamId)?.name || "Unknown";

    const getDepartmentName = (deptId: string) =>
      departments.find((d: any) => d._id.toString() === deptId)?.name ||
      "Unknown";

    const getRegionName = (regionId: string) =>
      regions.find((r: any) => r._id.toString() === regionId)?.name ||
      "Unknown";

    // 3️⃣ Seed Users
    const users = await User.create([
      {
        name: "Sarah Admin",
        email: "sarah.admin@example.com",
        role: "admin",
        team: getTeamName(teams[0]!._id.toString()),
        department: getDepartmentName(departments[0]!._id.toString()),
        region: getRegionName(regions[0]!._id.toString()),
      },
      {
        name: "Marcus Engineer",
        email: "marcus.engineer@example.com",
        role: "engineer",
        team: getTeamName(teams[1]!._id.toString()),
        department: getDepartmentName(departments[0]!._id.toString()),
        region: getRegionName(regions[0]!._id.toString()),
      },
      {
        name: "Anita Engineer",
        email: "anita.engineer@example.com",
        role: "engineer",
        team: getTeamName(teams[2]!._id.toString()),
        department: getDepartmentName(departments[1]!._id.toString()),
        region: getRegionName(regions[1]!._id.toString()),
      },
    ]);

    console.log("✅ Users seeded successfully");
    console.log(
      users.map(
        (u) =>
          `${u.name} | ${u.role} | ${u.team} | ${u.department} | ${u.region}`,
      ),
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding users failed:", error);
    process.exit(1);
  }
};

seedUsers();
