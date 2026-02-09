import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Todo API is running...");
});

app.use(globalErrorHandler);

export default app;
