"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.listMyOrders = listMyOrders;
exports.updateOrderStatus = updateOrderStatus;
exports.cancelOrder = cancelOrder;

const client_1 = require("@prisma/client");
const prisma_1 = require("../../config/prisma");
// 허용된 상태 전이 정의
const VALID_TRANSITIONS = {
	PLACED: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.CANCELLED],
	CONFIRMED: [client_1.OrderStatus.SHIPPED, client_1.OrderStatus.CANCELLED],
	SHIPPED: [client_1.OrderStatus.DELIVERED],
	DELIVERED: [],
	CANCELLED: [],
};
async function createOrder(input) {
	if (!input.items.length) {
		throw new Error("ITEMS_REQUIRED");
	}

	// 트랜잭션: 재고 확인 + 차감 + 주문 생성 원자적 처리
	return prisma_1.prisma.$transaction(async (tx) => {
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
async function listMyOrders(userId) {
	return prisma_1.prisma.order.findMany({
		where: { userId },
		include: { items: { include: { product: true } } },
		orderBy: { createdAt: "desc" },
	});
}
async function updateOrderStatus(orderId, userId, newStatus) {
	const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId } });
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
	if (newStatus === client_1.OrderStatus.CANCELLED) {
		return prisma_1.prisma.$transaction(async (tx) => {
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

	return prisma_1.prisma.order.update({
		where: { id: orderId },
		data: { status: newStatus },
		include: { items: true },
	});
}
async function cancelOrder(orderId, userId) {
	return updateOrderStatus(orderId, userId, client_1.OrderStatus.CANCELLED);
}
