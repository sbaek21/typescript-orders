"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getById = getById;
const product_service_1 = require("./product.service");

async function list(_req, res) {
	const products = await (0, product_service_1.listProducts)();
	res.json(products);
}
async function getById(req, res) {
	const id = req.params.id;
	const product = await (0, product_service_1.findProduct)(id);
	if (!product) {
		res.status(404).json({ error: "product not found" });

		return;
	}
	res.json(product);
}
