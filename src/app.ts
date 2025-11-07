import express, { Request, Response } from "express";
import { 
  NODE_ENV, 
  ALLOWED_ORIGINS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS
} from "./config/env.js";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { rateLimit } from "express-rate-limit";
import routes from "./routes/index.js";

/**
 * Initialize Express application with all middleware and routes
 * @returns {express.Application} Configured Express application
 */
const createApp = (): express.Application => {
  // Initialize Express app
  const app = express();

  // Security middleware - must be first
  app.use(helmet());

  // Rate limiting middleware
  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
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
          callback(new Error("Not allowed by CORS"));
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
  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      message: "🚀 Express API Server",
      version: "1.0.0",
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes
  app.use("/", routes);

  // 404 Handler for non-existent routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ 
      success: false,
      message: "Route not found",
      statusCode: 404
    });
  });

  // Error Handling Middleware (must be last)
  app.use(errorMiddleware);

  return app;
};

export default createApp;

