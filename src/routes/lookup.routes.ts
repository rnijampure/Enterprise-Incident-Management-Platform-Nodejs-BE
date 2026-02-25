import { Router } from "express";
import { getLookups } from "../controllers/lookup.controller.js";

const router = Router();

router.get("/lookups", getLookups);

export default router;
