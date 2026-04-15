"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");

const router = (0, express_1.Router)();
router.get("/", product_controller_1.list);
router.get("/:id", product_controller_1.getById);
exports.default = router;
