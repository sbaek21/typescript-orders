import cors from "cors";
import express from "express";

import authRouter from "./modules/auth/auth.routes";
import orderRouter from "./modules/order/order.routes";
import productRouter from "./modules/product/product.routes";
import healthRouter from "./routes/health.routes";

const app = express();

app.set("trust proxy", 1); // 프록시 1단계 신뢰 (Railway/Vercel 환경)

const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL] : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/orders", orderRouter);
app.use("/products", productRouter);

// 에러 핸들러는 항상 마지막에
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error("ERROR:", err.message, err.stack);
	res.status(500).json({ error: "internal server error" });
});

export default app;
