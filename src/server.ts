// backend/src/server.ts
import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import https, { ServerOptions } from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
// Helper for ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import connectDB from "./config/db.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import lookupRoutes from "./routes/lookup.routes.js";
import usersRoutes from "./routes/usersRoutes.js";

const startServer = async () => {
  try {
    await connectDB();

    const app: Application = express();

    // 1. Properly typed ServerOptions
    // Certificates are 2 levels up from src/server.ts (in project root)
    const options: ServerOptions = {
      key: fs.readFileSync(path.resolve(__dirname, "../localhost+2-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../localhost+2.pem")),
    };

    const allowedOrigin = process.env.CORS_ORIGIN || "https://localhost:5173";

    app.use(
      cors({
        origin: allowedOrigin,
        credentials: true, // Required for Refresh Token cookies
      }),
    );

    app.use(express.json());
    app.use(cookieParser());
    // Routes
    app.use("/api/incidents", incidentRoutes);
    app.use("/api/user", usersRoutes);
    app.use("/api", lookupRoutes);

    const PORT = process.env.PORT || 5000;

    // 2. Pass the typed options to https.createServer
    https.createServer(options, app).listen(PORT, () => {
      console.log(`🚀 Secure Server running on https://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
