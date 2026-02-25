import type { Request, Response } from "express";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Department from "../models/Department.js";
import Region from "../models/Region.js";

export const getLookups = async (_req: Request, res: Response) => {
  try {
    // Run all queries in parallel
    const [users, teams, departments, regions] = await Promise.all([
      User.find().lean(),
      Team.find().lean(),
      Department.find().lean(),
      Region.find().lean(),
    ]);

    res.set("Cache-Control", "public, max-age=300"); // optional cache

    res.status(200).json({
      users,
      teams,
      departments,
      regions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lookup data",
    });
  }
};
