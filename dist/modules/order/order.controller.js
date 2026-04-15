"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.me = me;
exports.cancel = cancel;
exports.updateStatus = updateStatus;
const client_1 = require("@prisma/client");
const order_service_1 = require("./order.service");

function getUserIdOr401(req, res) {
	const user = req.user;
	if (!user) {
		res.status(401).json({ error: "unauthorized" });

		return null;
	}

	return user.sub;
}
async function create(req, res) {
	try {
		const userId = getUserIdOr401(req, res);
		if (!userId) {
			return;
		}
		const { items } = req.body ?? {};
		const order = await (0, order_service_1.createOrder)({ userId, items });
		res.status(201).json(order);
		// return;
	} catch (err) {
		const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
		if (msg === "ITEMS_REQUIRED") {
			return void res.status(400).json({ error: "items required" });
		}
		if (msg === "PRODUCT_NOT_FOUND") {
			return void res.status(404).json({ error: "product not found" });
		}
		if (msg === "INVALID_QUANTITY") {
			return void res.status(400).json({ error: "invalid quantity" });
		}
		if (msg === "INSUFFICIENT_STOCK") {
			return void res.status(409).json({ error: "insufficient stock" });
		}
		res.status(500).json({ error: "internal server error" });
	}
}
async function me(req, res) {
	const userId = getUserIdOr401(req, res);
	if (!userId) {
		return;
	}
	const orders = await (0, order_service_1.listMyOrders)(userId); // ← await 추가
	res.json(orders);
}
async function cancel(req, res) {
	try {
		const userId = getUserIdOr401(req, res);
		if (!userId) {
			return;
		}
		const orderId = req.params.id;
		const order = await (0, order_service_1.cancelOrder)(orderId, userId); // ← await 추가
		res.json(order);
	} catch (err) {
		const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
		if (msg === "ORDER_NOT_FOUND") {
			return void res.status(404).json({ error: "order not found" });
		}
		if (msg === "FORBIDDEN") {
			return void res.status(403).json({ error: "forbidden" });
		}
		res.status(500).json({ error: "internal server error" });
	}
}
// 관리자용 주문 상태 변경 (CONFIRMED → SHIPPED → DELIVERED)
async function updateStatus(req, res) {
	try {
		const userId = getUserIdOr401(req, res);
		if (!userId) {
			return;
		}
		const orderId = req.params.id;
		const { status } = req.body ?? {};
		if (!Object.values(client_1.OrderStatus).includes(status)) {
			return void res.status(400).json({ error: "invalid status" });
		}
		const order = await (0, order_service_1.updateOrderStatus)(orderId, userId, status);
		res.json(order);
	} catch (err) {
		const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
		if (msg === "ORDER_NOT_FOUND") {
			return void res.status(404).json({ error: "order not found" });
		}
		if (msg === "FORBIDDEN") {
			return void res.status(403).json({ error: "forbidden" });
		}
		if (msg === "INVALID_STATUS_TRANSITION") {
			return void res.status(400).json({ error: "invalid status transition" });
		}
		res.status(500).json({ error: "internal server error" });
	}
}
