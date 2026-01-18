import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger";
import logger from "../middlewares/loggers";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import productRouter from "./product";
import cartRouter from "./cart";
import usersRouter from "./users";
import ordersRouter from "./orders";
import adminRouter from "./admin";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    try {
      console.log("[body-debug]", req.method, req.originalUrl, "Content-Type:", req.headers["content-type"]);
      console.log("[body-debug] body:", JSON.stringify(req.body));
    } catch (err) {
      console.log("[body-debug] could not stringify body", err);
    }
  }
  next();
});

app.use(logger);

app.use((req, res, next) => {
  console.log("My first middleware Function");
  next();
});

app.get("/", (req, res) => {
  return res.send("Welcome to E-commerce API - Use /api/* endpoints or visit /api-docs for documentation");
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-Commerce API Documentation'
}));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);

export default app;
