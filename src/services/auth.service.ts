import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import ms from "ms";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import AppError from "../utils/AppError.js";
import { env } from "../config/env.js";
import { ERROR_CODES } from "../config/constants.js";

export const register = async (data: any) => {
  const { email, password, firstName, lastName } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(
      "User with this email already exists",
      400,
      ERROR_CODES.DUPLICATE_FIELD,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(
      "Invalid email or password",
      401,
      ERROR_CODES.INVALID_CREDENTIALS,
    );
  }

  const accessToken = signAccessToken({ id: user.id });
  const refreshToken = signRefreshToken({ id: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN as any)),
    },
  });

  // Fetch user data without password to return
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    omit: { password: true },
  });

  return {
    user: userData,
    accessToken,
    refreshToken,
  };
};

export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

export const refresh = async (refreshToken: string) => {
  const tokenData = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenData || tokenData.revokedAt || tokenData.expiresAt < new Date()) {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      ERROR_CODES.INVALID_TOKEN,
    );
  }

  const accessToken = signAccessToken({ id: tokenData.userId });
  return { accessToken };
};
