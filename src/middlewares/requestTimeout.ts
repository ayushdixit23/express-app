import { Request, Response, NextFunction } from "express";

export const requestTimeout = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timeout = 60000;

  const timer = setTimeout(() => {
    clearTimeout(timer);
    if (!res.writableEnded) {
      res.status(408).json({
        success: false,
        message: "Request timeout",
        error: {
          code: "REQUEST_TIMEOUT",
          message: "Request timeout after 60 seconds",
          traceId: req.traceId,
        },
        statusCode: 408,
      });
    }
  }, timeout);

  res.on("finish", () => {
    clearTimeout(timer);
  });

  next();
};