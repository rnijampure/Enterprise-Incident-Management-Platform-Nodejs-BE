import express from "express";
import { getUserById } from "../controllers/userController.js";

const router = express.Router();

//router.get("/", getIncidents);
router.get("/:id", getUserById);
//router.post("/", createIncident);
//router.patch("/:id", updateIncident);

export default router;
