import type { Request, Response } from "express";
import { products, findProduct } from "./product.store";

export function list(_req: Request, res: Response) {
    return res.json(products);
}

export function getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const product = findProduct(id);

    if (!product) {
        return res.status(404).json({ error: "product not found" });
    }

    return res.json(product);
}