import type { Request, Response } from "express";

import { findProduct, listProducts } from "./product.service";

export async function list(_req: Request, res: Response): Promise<void> {
	const products = await listProducts();
	res.json(products);
}

export async function getById(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const product = await findProduct(id);

	if (!product) {
		res.status(404).json({ error: "product not found" });

		return;
	}

	res.json(product);
}
