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

    // Logic: Only use HTTPS if explicitly requested AND not on Render/Production
    const isProduction = process.env.NODE_ENV === "production";
    const useHttps = process.env.USE_HTTPS === "true" && !isProduction;

    app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "https://localhost:5173",
        credentials: true,
      }),
    );
    app.use(express.json());
    app.use(cookieParser());

    app.use("/api/incidents", incidentRoutes);
    app.use("/api/user", usersRoutes);
    app.use("/api", lookupRoutes);

    if (useHttps) {
      // LOCAL DEVELOPMENT HTTPS
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
      // PRODUCTION / RENDER HTTP
      // Render provides SSL at the load balancer, so the app stays as HTTP
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
