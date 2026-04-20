import { Router } from "express";
import rateLimit from "express-rate-limit";

import { requireAuth } from "../../middlewares/auth.middleware";

import { login, me, register } from "./auth.controller";

const router = Router();

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15분
	max: 10, // 15분당 10회
	message: { error: "too many attempts, try again later" },
	standardHeaders: true, // 응답에 RateLimit 헤더 포함
	legacyHeaders: false,
});

router.post("/register", register);
router.post("/login", loginLimiter, login); // limiter → login 핸들러 순서
router.get("/me", requireAuth, me);

export default router;
