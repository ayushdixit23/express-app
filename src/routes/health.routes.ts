import { Router, Request, Response } from "express";
import mongoose from "mongoose";

const router = Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get("/", async (_req: Request, res: Response) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "unknown",
    },
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      health.services.database = "connected";
    } else {
      health.services.database = "disconnected";
    }

    const statusCode = health.services.database === "connected" ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    health.message = "Error checking services";
    res.status(503).json(health);
  }
});

/**
 * Liveness probe - simple check if server is running
 * GET /health/live
 */
router.get("/live", (_req: Request, res: Response) => {
  res.status(200).json({ status: "alive" });
});

/**
 * Readiness probe - check if server is ready to accept traffic
 * GET /health/ready
 */
router.get("/ready", async (_req: Request, res: Response) => {
  try {
    // Check if critical services are ready
    const dbReady = mongoose.connection.readyState === 1;
    
    if (dbReady) {
      res.status(200).json({ status: "ready" });
    } else {
      res.status(503).json({ status: "not ready", reason: "database not connected" });
    }
  } catch (error) {
    res.status(503).json({ status: "not ready", error: "health check failed" });
  }
});

export default router;

