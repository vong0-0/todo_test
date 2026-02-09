import { Router } from "express";
import * as todoController from "../controllers/todo.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all todo routes
router.use(protect);

router.route("/").post(todoController.createTodo).get(todoController.getTodos);

router
  .route("/:id")
  .get(todoController.getTodoById)
  .patch(todoController.updateTodo)
  .delete(todoController.deleteTodo);

export default router;
