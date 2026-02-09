import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { sendSuccessResponse } from "../utils/ApiResponse.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.register(req.body);
    return sendSuccessResponse(res, 201, "User registered successfully", {
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccessResponse(res, 200, "Login successful", {
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new Error("Refresh token missing"));
    }

    const { accessToken } = await authService.refresh(refreshToken);
    return sendSuccessResponse(res, 200, "Token refreshed successfully", {
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken");
    return sendSuccessResponse(res, 200, "Logout successful");
  } catch (error) {
    next(error);
  }
};
