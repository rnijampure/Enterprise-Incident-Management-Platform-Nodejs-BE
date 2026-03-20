//backend\src\routes\usersRoutes.ts
import express from "express";
import { getUserById } from "../controllers/userController.js";
import {
  logIn,
  handleRefreshToken,
  logOut,
} from "../controllers/authController.js";
const router = express.Router();
router.post("/login", logIn);
router.get("/refresh", handleRefreshToken);
router.post("/logout", logOut);
//router.get("/", getIncidents);
router.get("/:id", getUserById);
//router.post("/", createIncident);
//router.patch("/:id", updateIncident);

export default router;
