import express, { NextFunction, Request, Response } from "express";
import {
  NODE_ENV,
  ALLOWED_ORIGINS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} from "./config/env.js";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { rateLimit } from "express-rate-limit";
import routes from "./routes/index.js";
import { traceIdMiddleware } from "./middlewares/traceId.js";
import { SuccessResponse } from "./core/responses/SuccessResponse.js";
import { AppError } from "./core/errors/AppError.js";
import { ERROR_CODES } from "./core/errors/errorCodes.js";
import { logger } from "./utils/logger.js";
import { requestLogger } from "./middlewares/requestLogger.js";

const createApp = (): express.Application => {
  const app = express();

  app.use(helmet());

  app.use(traceIdMiddleware);

  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, _res, next) => {
      next(
        new AppError(
          "Too many requests from this IP, please try again later.",
          429,
          ERROR_CODES.RATE_LIMIT_EXCEEDED
        )
      );
    },
  });
  app.use(limiter);

  app.use(requestLogger)

  app.use(compression());

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  if (NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.get("/", (req: Request, res: Response) => {
    return new SuccessResponse("Server metadata retrieved", {
      message: "Express API Server",
      version: "1.0.0",
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    }).send(req, res);
  });

  app.use("/", routes);

  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(
      new AppError(
        `Route not found: ${req.method} ${req.originalUrl}`,
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        [{ field: "path", message: `Cannot ${req.method} ${req.originalUrl}` }]
      )
    );
  });

  app.use(errorMiddleware);

  return app;
};

export default createApp;