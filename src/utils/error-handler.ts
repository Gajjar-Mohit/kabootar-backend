import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);
  res.status(401).json({
    success: false,
    message: "Internal server error",
    error: err instanceof Error ? err.message : "Unknown error",
  });
};

export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "CustomError";
    this.statusCode = statusCode;
  }
}

