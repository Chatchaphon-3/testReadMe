import type { NextFunction, Request, Response } from "express";
import { AppError } from "../types/errors.js";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: fromZodError(err).message,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
