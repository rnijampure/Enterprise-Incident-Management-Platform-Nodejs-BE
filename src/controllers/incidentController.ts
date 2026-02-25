//backend\src\controllers\incidentController.ts
import { type Request, type Response } from "express";
import "../models/User.js";
import Incident from "../models/Incident.js";
export const getIncidents = async (req: Request, res: Response) => {
  try {
    const {
      status,
      severity,
      region,
      type,
      team,
      department,
      escalationLevel,
      startDate,
      endDate,
      page = "1",
      limit = "10",
      sort = "-createdAt",
    } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (region) query.region = region;
    if (type) query.type = type;
    if (team) query.teamId = team;
    if (department) query.department = department;
    if (escalationLevel) query.escalationLevel = escalationLevel;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const skip = (pageNumber - 1) * pageSize;

    const incidents = await Incident.find(query)
      .populate("assignee", "name email")
      .populate("reporter", "name email")
      .sort(sort as string)
      .skip(skip)
      .limit(pageSize);

    const total = await Incident.countDocuments(query);

    res.json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: incidents,
    });
  } catch (error) {
    console.error("Error in getIncidents:", error);
    return res.status(500).json({
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};

export const createIncident = async (req: Request, res: Response) => {
  try {
    const incident = await Incident.create(req.body);
    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ message: "Invalid data", error });
  }
};

export const updateIncident = async (req: Request, res: Response) => {
  try {
    const updated = await Incident.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("GET /api/incidents error:", error); // <-- add this
    res
      .status(500)
      .json({ message: "Server Error", error: (error as Error).message });
  }
};
/* =========================================================
   NEW: Get single incident by ID
========================================================= */
export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // this should match :id in route
    const incident = await Incident.findById(id)
      .populate("assignee", "name email")
      .populate("reporter", "name email");

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(incident);
  } catch (error) {
    console.error("GET /api/incidents/:id error:", error);
    res
      .status(500)
      .json({ message: "Server Error", error: (error as Error).message });
  }
};
