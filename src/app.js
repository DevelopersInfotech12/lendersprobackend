import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "https://lendersprofrontend.vercel.app/"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "LenderPro API running 🚀" });
});

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
