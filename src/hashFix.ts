// backend/src/hashFix.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const hashExistingPasswords = async () => {
  try {
    // 1. Connect to your DB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB...");

    // 2. Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users. Checking passwords...`);

    for (let user of users) {
      // 3. Only hash if it's not already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.password && !user.password.startsWith("$2a$")) {
        const salt = await bcrypt.genSalt(10);
        const originalPassword = user.password;
        user.password = await bcrypt.hash(originalPassword, salt);

        await user.save();
        console.log(`✅ Hashed password for: ${user.email}`);
      } else {
        console.log(`ℹ️ Skipping ${user.email} (Already hashed or empty)`);
      }
    }

    console.log("Done! You can now delete this file.");
    process.exit(0);
  } catch (error) {
    console.error("Error hashing passwords:", error);
    process.exit(1);
  }
};

hashExistingPasswords();
