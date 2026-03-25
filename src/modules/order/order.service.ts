import { prisma } from "../../config/prisma";

export type CreateOrderInput = {
  userId: string;
  items: { productId: string; quantity: number }[];
};

export async function createOrder(input: CreateOrderInput) {
  if (!input.items.length) throw new Error("ITEMS_REQUIRED");

  // 상품 존재 + quantity 검증
  const itemsWithPrice = await Promise.all(
    input.items.map(async (it) => {
      const product = await prisma.product.findUnique({
        where: { id: it.productId },
      });
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      if (!Number.isInteger(it.quantity) || it.quantity <= 0)
        throw new Error("INVALID_QUANTITY");

      return {
        productId: product.id,
        quantity: it.quantity,
        priceAtPurchase: product.price,
      };
    })
  );

  // Order + OrderItem 한 번에 생성 (nested write)
  const order = await prisma.order.create({
    data: {
      userId: input.userId,
      items: { create: itemsWithPrice },
    },
    include: { items: true },
  });

  return order;
}

export async function listMyOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function cancelOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.userId !== userId) throw new Error("FORBIDDEN");
  if (order.status === "CANCELLED") return order; // 멱등성 유지

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
    include: { items: true },
  });
}
