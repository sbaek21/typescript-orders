import { Router } from "express";
import { list, getById } from "./product.controller";

const router = Router();

router.get("/", list);
router.get("/:id", getById);

export default router;