import express, { NextFunction, Request, Response } from "express";
import {
  NODE_ENV,
  ALLOWED_ORIGINS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} from "./config/env.js";
import morgan from "morgan";
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

/**
 * Initialize Express application with all middleware and routes
 * @returns {express.Application} Configured Express application
 */
const createApp = (): express.Application => {
  // Initialize Express app
  const app = express();

  // Security middleware - must be first
  app.use(helmet());

  // Attach request trace id for observability
  app.use(traceIdMiddleware);

  // Rate limiting middleware
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
          ERROR_CODES.RATE_LIMIT
        )
      );
    },
  });
  app.use(limiter);

  // Logging based on environment (development/production)
  const logFormat = NODE_ENV === "development" ? "dev" : "combined";
  app.use(morgan(logFormat));

  // Compression middleware - compress all responses
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
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

  // Trust proxy - important for rate limiting behind reverse proxy
  if (NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // Root route
  app.get("/", (req: Request, res: Response) => {
    return new SuccessResponse("Server metadata retrieved", {
      message: "🚀 Express API Server",
      version: "1.0.0",
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    }).send(req, res);
  });

  // Mount API routes
  app.use("/", routes);

  // 404 Handler for non-existent routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(
      new AppError("Route not found", 404, ERROR_CODES.NOT_FOUND, [
        {
          field: "path",
          message: `Cannot ${req.method} ${req.originalUrl}`,
        },
      ])
    );
  });

  // Error Handling Middleware (must be last)
  app.use(errorMiddleware);

  return app;
};

export default createApp;
