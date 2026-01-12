import express from "express";

import authRouter from "./modules/auth/auth.routes";
import orderRouter from "./modules/order/order.routes";
import productRouter from "./modules/product/product.routes";
import healthRouter from "./routes/health.routes";

const app = express();

app.use(express.json());
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/orders", orderRouter);
app.use("/products", productRouter);

export default app;
