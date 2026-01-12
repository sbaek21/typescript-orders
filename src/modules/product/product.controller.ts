import type { Request, Response } from "express";

import { findProduct, products } from "./product.store";

export function list(_req: Request, res: Response): void {
	res.json(products);
}

export function getById(req: Request, res: Response): void {
	const id = req.params.id as string;
	const product = findProduct(id);

	if (!product) {
		res.status(404).json({ error: "product not found" });

		return;
	}

	res.json(product);
}
