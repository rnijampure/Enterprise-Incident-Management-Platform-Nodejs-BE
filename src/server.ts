// backend/src/server.ts
import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
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

    const useHttps = process.env.USE_HTTPS === "true";

    // 1. Properly typed ServerOptions
    // Certificates are 2 levels up from src/server.ts (in project root)
    const options: ServerOptions = {
      key: fs.readFileSync(path.resolve(__dirname, "../localhost+2-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../localhost+2.pem")),
    };
    // Define paths to your local certs
    const keyPath = path.resolve(__dirname, "../localhost+2-key.pem");
    const certPath = path.resolve(__dirname, "../localhost+2.pem");
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
    // Check if BOTH files exist (they only exist on your laptop)
    if (useHttps) {
      try {
        const keyPath = path.resolve(process.env.SSL_KEY_PATH!);
        const certPath = path.resolve(process.env.SSL_CERT_PATH!);

        const options = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };

        https.createServer(options, app).listen(PORT, () => {
          console.log(`🔐 HTTPS Server running on https://localhost:${PORT}`);
        });
      } catch (err) {
        console.error("❌ HTTPS setup failed:", err);
        process.exit(1);
      }
    } else {
      app.listen(PORT, () => {
        console.log(`🚀 HTTP Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
