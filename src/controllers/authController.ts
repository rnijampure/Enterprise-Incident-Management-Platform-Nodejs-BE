// backend/src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User.js";

export const logIn = async (req: Request, res: Response) => {
  const { password } = req.body;
  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password no user" });
    }

    // 2. USE BCRYPT.COMPARE
    // 'password' is the plain text from the UI
    // 'user.password' is the $2a$... hash from MongoDB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password BCRYPT" });
    }
    const accessToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "30s" },
    );

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "30s" },
    );

    // Cookie Config for HTTPS/Vite
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Mandatory because of your local CA/SSL setup
      sameSite: "none", // Mandatory for cross-origin (port 5173 to 5000)
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/", // Ensure path is consistent
    });
    // Use the method you defined in the schema!
    if (user && (await user.matchPassword(password))) {
      // SUCCESS: Generate your JWT/Session here
      //   res.json({ message: "Login successful" });

      res.json({
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
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
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
  // Use req.cookies directly (ensure cookie-parser is used in server.ts)
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    );

    const user = await User.findById(decoded.id);
    if (!user) return res.status(403).json({ message: "User not found" });

    const accessToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" },
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};
