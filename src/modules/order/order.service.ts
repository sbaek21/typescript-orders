/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { OrderStatus, Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma";

export type CreateOrderInput = {
	userId: string;
	items: { productId: string; quantity: number }[];
};

// 허용된 상태 전이 정의
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	PLACED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
	CONFIRMED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
	SHIPPED: [OrderStatus.DELIVERED],
	DELIVERED: [],
	CANCELLED: [],
};

export async function createOrder(input: CreateOrderInput) {
	if (!input.items.length) {
		throw new Error("ITEMS_REQUIRED");
	}

	// 트랜잭션: 재고 확인 + 차감 + 주문 생성 원자적 처리
	return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		// 상품 존재 + quantity + 재고 검증
		const itemsWithPrice = await Promise.all(
			input.items.map(async (it) => {
				const product = await tx.product.findUnique({ where: { id: it.productId } });
				if (!product) {
					throw new Error("PRODUCT_NOT_FOUND");
				}
				if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
					throw new Error("INVALID_QUANTITY");
				}
				if (product.stock < it.quantity) {
					throw new Error("INSUFFICIENT_STOCK");
				}

				// 재고 차감
				await tx.product.update({
					where: { id: it.productId },
					data: { stock: { decrement: it.quantity } },
				});

				return {
					productId: product.id,
					quantity: it.quantity,
					priceAtPurchase: product.price,
				};
			}),
		);

		// Order + OrderItem 한 번에 생성 (nested write)
		return tx.order.create({
			data: {
				userId: input.userId,
				items: { create: itemsWithPrice },
			},
			include: { items: { include: { product: true } } },
		});
	});
}

export async function listMyOrders(userId: string) {
	return prisma.order.findMany({
		where: { userId },
		include: { items: { include: { product: true } } },
		orderBy: { createdAt: "desc" },
	});
}

export async function updateOrderStatus(orderId: string, userId: string, newStatus: OrderStatus) {
	const order = await prisma.order.findUnique({ where: { id: orderId } });
	if (!order) {
		throw new Error("ORDER_NOT_FOUND");
	}
	if (order.userId !== userId) {
		throw new Error("FORBIDDEN");
	}

	// 상태 전이 유효성 검증
	const allowed = VALID_TRANSITIONS[order.status];
	if (!allowed.includes(newStatus)) {
		throw new Error("INVALID_STATUS_TRANSITION");
	}

	// 취소 시 재고 복구 (transaction)
	if (newStatus === OrderStatus.CANCELLED) {
		return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
			const items = await tx.orderItem.findMany({ where: { orderId } });
			await Promise.all(
				items.map((item) =>
					tx.product.update({
						where: { id: item.productId },
						data: { stock: { increment: item.quantity } },
					}),
				),
			);

			return tx.order.update({
				where: { id: orderId },
				data: { status: newStatus, cancelledAt: new Date() },
				include: { items: true },
			});
		});
	}

	return prisma.order.update({
		where: { id: orderId },
		data: { status: newStatus },
		include: { items: true },
	});
}

export async function cancelOrder(orderId: string, userId: string) {
	return updateOrderStatus(orderId, userId, OrderStatus.CANCELLED);
}