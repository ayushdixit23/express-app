declare module "express-timeout-handler" {
  import { Request, Response, NextFunction } from "express";

  interface TimeoutOptions {
    timeout?: number;
    onTimeout?: (req: Request, res: Response, next: NextFunction) => void;
    status?: number;
    message?: string;
  }

  const timeout: (options?: TimeoutOptions) => (req: Request, res: Response, next: NextFunction) => void;
  export default timeout;
}