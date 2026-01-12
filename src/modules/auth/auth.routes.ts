import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";

import { login, me, register } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me); //보호된 route

export default router;
