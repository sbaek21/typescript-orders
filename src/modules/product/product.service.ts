import { prisma } from "../../config/prisma";

export async function listProducts() {
  return prisma.product.findMany();
}

export async function findProduct(id: string) {
  return prisma.product.findUnique({ where: { id } });
}