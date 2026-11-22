
import { AppError } from "../error/AppError.js";

export function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      status: error.status,
      timestamp: error.timestamp
    });
  }

  console.error(error);

  return res.status(500).json({
    error: "Error interno del servidor"
  });
}
