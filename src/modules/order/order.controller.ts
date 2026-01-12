import type { Request, Response } from "express";
import { createOrder, listMyOrders, cancelOrder } from "./order.service";

export function create(req: Request, res: Response) {
    try {
        const userId = req.user!.sub;
        const { items } = req.body ?? {};
        const order = createOrder({ userId, items });
        return res.status(201).json(order);
    } catch (err) {
        const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
        if (msg === "ITEMS_REQUIRED") return res.status(400).json({ error: "items required" });
        if (msg === "PRODUCT_NOT_FOUND") return res.status(404).json({ error: "product not found" });
        if (msg === "INVALID_QUANTITY") return res.status(400).json({ error: "invalid quantity" });
        return res.status(500).json({ error: "internal server error" });
    }
}

export function me(req: Request, res: Response) {
    const userId = req.user!.sub;
    return res.json(listMyOrders(userId));
}

export function cancel(req: Request, res: Response) {
    try {
        const userId = req.user!.sub;
        const orderId = req.params.id as string;
        const order = cancelOrder(orderId, userId);
        return res.json(order);
    } catch (err) {
        const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
        if (msg === "ORDER_NOT_FOUND") return res.status(404).json({ error: "order not found" });
        if (msg === "FORBIDDEN") return res.status(403).json({ error: "forbidden" });
        return res.status(500).json({ error: "internal server error" });
    }
}