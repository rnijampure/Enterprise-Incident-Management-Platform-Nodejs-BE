import express from "express";
import {
  getIncidents,
  createIncident,
  updateIncident,
  getIncidentById,
} from "../controllers/incidentController.js";

const router = express.Router();

router.get("/", getIncidents);
router.get("/:id", getIncidentById);
router.post("/", createIncident);
router.patch("/:id", updateIncident);

export default router;
