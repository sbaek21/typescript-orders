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

export async function create(req: Request, res: Response): Promise<void> {
	try {
		const userId = getUserIdOr401(req, res);
		if (!userId) return;
		

		const { items } = req.body ?? {};
		const order = await createOrder({ userId, items });

		res.status(201).json(order);

		// return;
	} catch (err) {
		const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
		if (msg === "ITEMS_REQUIRED") return void res.status(400).json({ error: "items required" });
    	if (msg === "PRODUCT_NOT_FOUND") return void res.status(404).json({ error: "product not found" });
    	if (msg === "INVALID_QUANTITY") return void res.status(400).json({ error: "invalid quantity" });
    	res.status(500).json({ error: "internal server error" });
	}
}

export async function me(req: Request, res: Response): Promise<void> {
  const userId = getUserIdOr401(req, res);
  if (!userId) return;

  const orders = await listMyOrders(userId);  // ← await 추가
  res.json(orders);
}

export async function cancel(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserIdOr401(req, res);
    if (!userId) return;

    const orderId = req.params.id as string;
    const order = await cancelOrder(orderId, userId);  // ← await 추가

    res.json(order);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    if (msg === "ORDER_NOT_FOUND") return void res.status(404).json({ error: "order not found" });
    if (msg === "FORBIDDEN") return void res.status(403).json({ error: "forbidden" });
    res.status(500).json({ error: "internal server error" });
  }
}