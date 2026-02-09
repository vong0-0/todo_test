import { prisma } from "../lib/prisma.js";
import redisClient from "../lib/redis.js";
import AppError from "../utils/AppError.js";
import { CACHE_CONFIG, ERROR_CODES } from "../config/constants.js";

const getCacheKey = (userId: string) =>
  `${CACHE_CONFIG.PREFIX.USER}:${userId}:todos`;

export const createTodo = async (userId: string, data: any) => {
  const todo = await prisma.todo.create({
    data: {
      ...data,
      userId,
    },
    omit: { userId: true },
  });

  // Invalidate cache
  await redisClient.del(getCacheKey(userId));

  return todo;
};

export const getTodos = async (userId: string) => {
  const cacheKey = getCacheKey(userId);

  // Try cache
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  // Fetch from DB
  const todos = await prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    omit: { userId: true },
  });

  // Save to cache
  await redisClient.setEx(
    cacheKey,
    CACHE_CONFIG.TTL.ONE_HOUR,
    JSON.stringify(todos),
  );

  return todos;
};

export const getTodoById = async (userId: string, id: string) => {
  const todo = await prisma.todo.findFirst({
    where: { id, userId },
    omit: { userId: true },
  });

  if (!todo) {
    throw new AppError(
      "No todo found with that ID",
      404,
      ERROR_CODES.NOT_FOUND,
    );
  }

  return todo;
};

export const updateTodo = async (userId: string, id: string, data: any) => {
  // Check ownership
  await getTodoById(userId, id);

  const updatedTodo = await prisma.todo.update({
    where: { id },
    data,
    omit: { userId: true },
  });

  // Invalidate cache
  await redisClient.del(getCacheKey(userId));

  return updatedTodo;
};

export const deleteTodo = async (userId: string, id: string) => {
  // Check ownership
  await getTodoById(userId, id);

  await prisma.todo.delete({
    where: { id },
  });

  // Invalidate cache
  await redisClient.del(getCacheKey(userId));
};
