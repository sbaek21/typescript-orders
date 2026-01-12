import type { Request, Response } from "express";

import { cancelOrder, createOrder, listMyOrders } from "./order.service";

function getUserIdOr401(req: Request, res: Response): string | null {
	const user = req.user;
	if (!user) {
		res.status(401).json({ error: "unauthorized" });

		return null;
	}

	return user.sub;
}

export function create(req: Request, res: Response): void {
	try {
		const userId = getUserIdOr401(req, res);
		if (!userId) {
			return;
		}

		const { items } = req.body ?? {};
		const order = createOrder({ userId, items });

		res.status(201).json(order);

		return;
	} catch (err) {
		const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
		if (msg === "ITEMS_REQUIRED") {
			res.status(400).json({ error: "items required" });

			return;
		}
		if (msg === "PRODUCT_NOT_FOUND") {
			res.status(404).json({ error: "product not found" });

			return;
		}
		if (msg === "INVALID_QUANTITY") {
			res.status(400).json({ error: "invalid quantity" });

			return;
		}

		res.status(500).json({ error: "internal server error" });
	}
}

export function me(req: Request, res: Response): void {
	const userId = getUserIdOr401(req, res);
	if (!userId) {
		return;
	}

	res.json(listMyOrders(userId));
}

export function cancel(req: Request, res: Response): void {
	try {
		const userId = getUserIdOr401(req, res);
		if (!userId) {
			return;
		}

		const orderId = req.params.id as string;
		const order = cancelOrder(orderId, userId);

		res.json(order);

		return;
	} catch (err) {
		const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
		if (msg === "ORDER_NOT_FOUND") {
			res.status(404).json({ error: "order not found" });

			return;
		}
		if (msg === "FORBIDDEN") {
			res.status(403).json({ error: "forbidden" });

			return;
		}

		res.status(500).json({ error: "internal server error" });
	}
}
