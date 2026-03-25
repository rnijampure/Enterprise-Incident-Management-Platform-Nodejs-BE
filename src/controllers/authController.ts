// backend/src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User.js";

export const logIn = async (req: Request, res: Response) => {
  console.log("ENV CHECK:", {
    access: process.env.ACCESS_TOKEN_SECRET,
    refresh: process.env.REFRESH_TOKEN_SECRET,
  });
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }, // ✅ better
    );

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }, // ✅ FIXED
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        team: user.team,
        department: user.department,
        region: user.region,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logOut = async (req: Request, res: Response) => {
  // Clear with exact same attributes
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
  res.status(204).send();
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    console.log("Cookies:", req.cookies); // 🔍 DEBUG

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    const accessToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" },
    );

    return res.json({ accessToken });
  } catch (err) {
    console.error("❌ Refresh error:", err); // ✅ VERY IMPORTANT
    return res.status(403).json({
      message: "Invalid or expired refresh token",
    });
  }
};
