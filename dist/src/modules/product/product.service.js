"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.findProduct = findProduct;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const prisma_1 = require("../../config/prisma");
async function listProducts() {
    return prisma_1.prisma.product.findMany();
}
async function findProduct(id) {
    return prisma_1.prisma.product.findUnique({ where: { id } });
}
