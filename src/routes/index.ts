import { Router } from "express";
import authRoutes from "./auth.routes.js";
import todoRoutes from "./todo.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/todos", todoRoutes);

export default router;
