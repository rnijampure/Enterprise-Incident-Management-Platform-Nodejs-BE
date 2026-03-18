import express from "express";
import {
  getIncidents,
  createIncident,
  updateIncident,
  getIncidentById,
  getIncidentUpdates,
  getIncidentCommentsUpdates,
} from "../controllers/incidentController.js";

const router = express.Router();

router.get("/", getIncidents);
router.get("/:id", getIncidentById);

router.get("/updates/comments/:id", getIncidentCommentsUpdates);
router.get("/updates/:id", getIncidentUpdates);
router.post("/", createIncident);
router.patch("/:id", updateIncident);

export default router;
