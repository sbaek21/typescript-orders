import { randomUUID } from "crypto";

import { findProduct } from "../product/product.store";

import { ordersById } from "./order.store";
import type { Order } from "./order.types";

export type CreateOrderInput = {
	userId: string;
	items: { productId: string; quantity: number }[];
};

export function createOrder(input: CreateOrderInput): Order {
	if (!input.items.length) {
		throw new Error("ITEMS_REQUIRED");
	}

	const items = input.items.map((it) => {
		const product = findProduct(it.productId);
		if (!product) {
			throw new Error("PRODUCT_NOT_FOUND");
		}
		if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
			throw new Error("INVALID_QUANTITY");
		}

		return {
			productId: product.id,
			quantity: it.quantity,
			priceAtPurchase: product.price,
		};
	});

	const order: Order = {
		id: randomUUID(),
		userId: input.userId,
		status: "PLACED",
		items,
		createdAt: new Date().toISOString(),
	};

	ordersById.set(order.id, order);

	return order;
}

export function listMyOrders(userId: string): Order[] {
	return Array.from(ordersById.values()).filter((o) => o.userId === userId);
}

export function cancelOrder(orderId: string, userId: string): Order {
	const order = ordersById.get(orderId);
	if (!order) {
		throw new Error("ORDER_NOT_FOUND");
	}
	if (order.userId !== userId) {
		throw new Error("FORBIDDEN");
	}
	if (order.status === "CANCELLED") {
		return order;
	}

	order.status = "CANCELLED";
	order.cancelledAt = new Date().toISOString();
	ordersById.set(order.id, order);

	return order;
}
