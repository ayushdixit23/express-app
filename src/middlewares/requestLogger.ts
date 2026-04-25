import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const method = req.method.padEnd(6);
    const url = req.originalUrl.padEnd(20);
    const status = res.statusCode;

    // Color based on status
    let statusStr = status.toString();
    if (status >= 500) statusStr = `\x1b[31m${status}\x1b[0m`; // red
    else if (status >= 400) statusStr = `\x1b[33m${status}\x1b[0m`; // yellow
    else if (status >= 300) statusStr = `\x1b[36m${status}\x1b[0m`; // cyan
    else statusStr = `\x1b[32m${status}\x1b[0m`; // green

    logger.info(
      `${method} ${url} ${statusStr} ${duration}ms`
    );
  });

  next();
};