import { Request, Response } from "express";
import mongoose from "mongoose";
import { SuccessResponse } from "../core/responses/SuccessResponse.js";
import { AppError } from "../core/errors/AppError.js";
import { ERROR_CODES } from "../core/errors/errorCodes.js";

export const getHealth = (req: Request, res: Response): Response => {
  const databaseConnected = mongoose.connection.readyState === 1;
  const payload = {
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: databaseConnected ? "connected" : "disconnected",
    },
  };

  if (!databaseConnected) {
    throw new AppError(
      "Health check failed",
      503,
      ERROR_CODES.SERVICE_UNAVAILABLE,
      [{ field: "database", message: "Database is not connected" }]
    );
  }

  return new SuccessResponse("Health check passed", payload).send(req, res);
};

export const getLiveness = (req: Request, res: Response): Response => {
  return new SuccessResponse("Service is alive", { status: "alive" }).send(req, res);
};

export const getReadiness = (req: Request, res: Response): Response => {
  const databaseConnected = mongoose.connection.readyState === 1;

  if (!databaseConnected) {
    throw new AppError(
      "Service is not ready",
      503,
      ERROR_CODES.SERVICE_UNAVAILABLE,
      [{ field: "database", message: "Database is not connected" }]
    );
  }

  return new SuccessResponse("Service is ready", { status: "ready" }).send(req, res);
};
