import type AppError from "../utils/AppError.js";
import { type Response, type Request, type NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { ERROR_CODES } from "../config/constants.js";

function handlePrismaKnownRequestError(
  err: Prisma.PrismaClientKnownRequestError,
) {
  let message = "Invalid input data";
  let statusCode = 400;
  let errorCode = "DATABASE_REQUEST_ERROR";

  switch (err.code) {
    case "P2002": // Unique constraint
      message = `Duplicate field value. Please use another value.`;
      errorCode = ERROR_CODES.DUPLICATE_FIELD;
      break;
    case "P2025": // Record not found
      message = "No record found with that ID";
      statusCode = 404;
      errorCode = ERROR_CODES.NOT_FOUND;
      break;
    case "P2003": // Foreign key constraint
      message = "Invalid reference data";
      errorCode = ERROR_CODES.INVALID_REFERENCE;
      break;
    default:
      message = `Database error: ${err.code}`;
      errorCode = ERROR_CODES.DATABASE_REQUEST_ERROR;
  }

  const error = err as any;
  error.message = message;
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  error.isOperational = true;
  return error;
}

function handlePrismaValidationError(err: Prisma.PrismaClientValidationError) {
  const error = err as any;
  error.message = "Invalid data format provided";
  error.statusCode = 400;
  error.errorCode = ERROR_CODES.VALIDATION_ERROR;
  error.isOperational = true;
  return error;
}

function handleJWTError() {
  const error = new Error("Invalid token. Please log in again!") as any;
  error.statusCode = 401;
  error.errorCode = ERROR_CODES.INVALID_TOKEN;
  error.isOperational = true;
  return error;
}

function handleJWTExpiredError() {
  const error = new Error(
    "Your token has expired! Please log in again.",
  ) as any;
  error.statusCode = 401;
  error.errorCode = ERROR_CODES.TOKEN_EXPIRED;
  error.isOperational = true;
  return error;
}

function handleRedisError(err: any) {
  let message = "Cache service error";
  let errorCode: string = ERROR_CODES.CACHE_ERROR;

  if (err.code === "ECONNREFUSED") {
    message = "Could not connect to cache service";
    errorCode = ERROR_CODES.CACHE_CONNECTION_REFUSED;
  } else if (err.name === "SocketClosedError") {
    message = "Cache service connection closed";
    errorCode = ERROR_CODES.CACHE_CONNECTION_CLOSED;
  }

  const error = err as any;
  error.message = message;
  error.statusCode = 500;
  error.errorCode = errorCode;
  error.isOperational = true;
  return error;
}

export function sendErrorDev(err: any, res: Response) {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    data: null,
    error: {
      code: err.errorCode || ERROR_CODES.INTERNAL_ERROR,
      details: err.message,
      stack: err.stack,
      raw: err,
    },
  });
}

export function sendErrorProd(err: any, res: Response) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      error: {
        code: err.errorCode || ERROR_CODES.OPERATIONAL_ERROR,
        details: err.message,
      },
    });
  } else {
    // Log error for developers
    console.error("ERROR 💥", err);

    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      data: null,
      error: {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        details: "Please try again later or contact support.",
      },
    });
  }
}

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    console.error("ERROR 💥", err);
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      error = handlePrismaKnownRequestError(err);
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
      error = handlePrismaValidationError(err);
    }
    if (err.name === "JsonWebTokenError") {
      error = handleJWTError();
    }
    if (err.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }
    if (err.code === "ECONNREFUSED" || err.name?.includes("Redis")) {
      error = handleRedisError(err);
    }

    sendErrorProd(error, res);
  }
}
