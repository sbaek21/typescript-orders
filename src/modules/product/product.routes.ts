import { Router } from "express";

import { getById, list } from "./product.controller";

const router = Router();

router.get("/", list);
router.get("/:id", getById);

export default router;
