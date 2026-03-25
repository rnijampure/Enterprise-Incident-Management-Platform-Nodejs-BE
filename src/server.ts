import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

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
    const PORT = process.env.PORT || 5000;

    // Logic: Only use HTTPS if explicitly requested AND not in production
    const isProduction = process.env.NODE_ENV === "production";
    const useHttps = process.env.USE_HTTPS === "true" && !isProduction;

    const defaultOrigins = [
      "http://localhost:5173",
      "https://localhost:5173",
      "https://enterprise-incident-management-plat.vercel.app",
      "https://enterprise-incident-management-platform.onrender.com", // ✅ FIXED (removed /api)
    ];

    const allowedOrigins = (
      process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : defaultOrigins
    )
      .map((o) => o.trim())
      .filter(Boolean);

    // ✅ CORS (handles preflight automatically)
    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true); // Postman, curl

          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }

          console.error("❌ CORS blocked:", origin);
          return callback(null, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );

    // ❌ REMOVED problematic app.options()

    app.use(express.json());
    app.use(cookieParser());

    // Routes
    app.use("/api/incidents", incidentRoutes);
    app.use("/api/user", usersRoutes);
    app.use("/api", lookupRoutes);

    if (useHttps) {
      // LOCAL HTTPS (DEV ONLY)
      try {
        const keyPath = path.resolve(
          process.cwd(),
          process.env.SSL_KEY_PATH || "localhost+2-key.pem",
        );
        const certPath = path.resolve(
          process.cwd(),
          process.env.SSL_CERT_PATH || "localhost+2.pem",
        );

        const options = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };

        https.createServer(options, app).listen(PORT, () => {
          console.log(`🔐 Local HTTPS Server: https://localhost:${PORT}`);
        });
      } catch (sslErr) {
        console.error(
          "❌ SSL File Error: Make sure .pem files are in the root folder.",
        );
        process.exit(1);
      }
    } else {
      // HTTP (Production / Render)
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} (HTTP)`);
      });
    }
  } catch (error) {
    console.error("Critical: Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
