//backend\src\server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
import connectDB from "./config/db.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import lookupRoutes from "./routes/lookup.routes.js";

const startServer = async () => {
  try {
    await connectDB();

    const app = express();

    //  app.use(cors({ origin: "http://localhost:5173" }));

    const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

    app.use(
      cors({
        origin: allowedOrigin,
      }),
    );

    app.use(express.json());
    app.use("/api/incidents", incidentRoutes);
    app.use("/api", lookupRoutes);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
