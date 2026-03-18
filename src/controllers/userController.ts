import { type Request, type Response } from "express";
import User from "../models/User.js";

/* =========================================================
   NEW: Get single user by ID
========================================================= */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // this should match :id in route
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("GET /api/user/:id error:", error);
    res
      .status(500)
      .json({ message: "Server Error", error: (error as Error).message });
  }
};
