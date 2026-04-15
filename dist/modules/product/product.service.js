"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.findProduct = findProduct;

const prisma_1 = require("../../config/prisma");

async function listProducts() {
	return prisma_1.prisma.product.findMany();
}
async function findProduct(id) {
	return prisma_1.prisma.product.findUnique({ where: { id } });
}
