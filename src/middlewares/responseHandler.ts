/**
 * Base API Response class
 */
export class ApiResponse {
  constructor(
    public success: boolean,
    public message: string,
    public data?: any
  ) {}
}

/**
 * Success Response class
 * Use for successful operations
 */
export class SuccessResponse extends ApiResponse {
  constructor(
    message: string,
    data?: any,
    public statusCode: number = 200
  ) {
    super(true, message, data);
  }
}

/**
 * Error Response class
 * Use for error responses - extends Error for throwing
 */
export class ErrorResponse extends Error {
  public success: boolean;
  public isOperational: boolean;

  constructor(
    message: string,
    public statusCode: number = 500,
    public data?: any
  ) {
    super(message);
    this.success = false;
    this.isOperational = true; // to distinguish between operational errors and programming bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

