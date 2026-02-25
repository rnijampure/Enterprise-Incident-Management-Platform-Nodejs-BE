import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Incident from "../models/Incident.js";

dotenv.config();

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing from .env");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
