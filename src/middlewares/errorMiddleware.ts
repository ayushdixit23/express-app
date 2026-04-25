import { Request, Response, NextFunction } from "express";
import { normalizeError } from "../core/errors/errorHandler.js";
import { ErrorPayload } from "../core/responses/ApiResponse.js";
import { NODE_ENV } from "../config/env.js";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const normalizedError = normalizeError(err);

  if (NODE_ENV !== "test") {
    console.error({
      traceId: req.traceId,
      code: normalizedError.code,
      statusCode: normalizedError.statusCode,
      message: normalizedError.message,
      details: normalizedError.details,
      stack: normalizedError.stack,
    });
  }

  const payload: ErrorPayload = {
    success: false,
    message: normalizedError.message,
    error: {
      code: normalizedError.code,
      message: normalizedError.message,
      traceId: req.traceId ?? "unknown",
      ...(normalizedError.details && { details: normalizedError.details }),
    },
    statusCode: normalizedError.statusCode,
  };

  res.status(normalizedError.statusCode).json(payload);
};
