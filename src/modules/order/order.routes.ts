import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { create, me, cancel } from "./order.controller";

const router = Router();

router.post("/", requireAuth, create);
router.get("/me", requireAuth, me);
router.post("/:id/cancel", requireAuth, cancel);

export default router;