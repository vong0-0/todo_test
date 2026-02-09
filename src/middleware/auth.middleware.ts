import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";
import { prisma } from "../lib/prisma.js";
import { ERROR_CODES } from "../config/constants.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(
        new AppError(
          "You are not logged in! Please log in to get access.",
          401,
          ERROR_CODES.UNAUTHORIZED,
        ),
      );
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET!) as { id: string };

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user) {
      return next(
        new AppError(
          "The user belonging to this token no longer exists.",
          401,
          ERROR_CODES.USER_NOT_FOUND,
        ),
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          "This user account is deactivated.",
          401,
          ERROR_CODES.USER_DEACTIVATED,
        ),
      );
    }

    // Grant access
    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return next(
        new AppError(
          "Invalid token. Please log in again!",
          401,
          ERROR_CODES.INVALID_TOKEN,
        ),
      );
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Your token has expired! Please log in again.",
          401,
          ERROR_CODES.TOKEN_EXPIRED,
        ),
      );
    }
    next(error);
  }
};
