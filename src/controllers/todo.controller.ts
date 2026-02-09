import type { Request, Response, NextFunction } from "express";
import * as todoService from "../services/todo.service.js";
import { sendSuccessResponse } from "../utils/ApiResponse.js";

export const createTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const todo = await todoService.createTodo(req.user!.id, req.body);
    return sendSuccessResponse(res, 201, "Todo created successfully", { todo });
  } catch (error) {
    next(error);
  }
};

export const getTodos = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const todos = await todoService.getTodos(req.user!.id);
    return sendSuccessResponse(res, 200, "Todos fetched successfully", {
      todos,
    });
  } catch (error) {
    next(error);
  }
};

export const getTodoById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const todo = await todoService.getTodoById(
      req.user!.id,
      req.params.id as string,
    );
    return sendSuccessResponse(res, 200, "Todo fetched successfully", { todo });
  } catch (error) {
    next(error);
  }
};

export const updateTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const todo = await todoService.updateTodo(
      req.user!.id,
      req.params.id as string,
      req.body,
    );
    return sendSuccessResponse(res, 200, "Todo updated successfully", { todo });
  } catch (error) {
    next(error);
  }
};

export const deleteTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await todoService.deleteTodo(req.user!.id, req.params.id as string);
    return sendSuccessResponse(res, 200, "Todo deleted successfully");
  } catch (error) {
    next(error);
  }
};
