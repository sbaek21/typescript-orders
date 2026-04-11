import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware";

import { cancel, create, me, updateStatus } from "./order.controller";

const router = Router();

router.post("/", requireAuth, create);
router.get("/me", requireAuth, me);
router.post("/:id/cancel", requireAuth, cancel);
router.patch("/:id/status", requireAuth, updateStatus);

export default router;
