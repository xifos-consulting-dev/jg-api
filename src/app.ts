import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import userRoutes from "./routes/exampleRoute";
import { errorHandler } from "middlewares/errorHandler";

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Logging & JSON parser
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Error handling (last middleware)
app.use(errorHandler);

export default app;
