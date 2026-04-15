"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const order_controller_1 = require("./order.controller");

const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.requireAuth, order_controller_1.create);
router.get("/me", auth_middleware_1.requireAuth, order_controller_1.me);
router.post("/:id/cancel", auth_middleware_1.requireAuth, order_controller_1.cancel);
router.patch("/:id/status", auth_middleware_1.requireAuth, order_controller_1.updateStatus);
exports.default = router;
