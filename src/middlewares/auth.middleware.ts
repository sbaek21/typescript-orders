import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthPayload = {
	sub: string;
	email: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
	const header = req.header("Authorization");
	if (!header || !header.startsWith("Bearer ")) {
		res.status(401).json({ error: "missing bearer token" });

		return;
	}

	const token = header.slice("Bearer ".length);

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		res.status(500).json({ error: "server misconfigured" });

		return;
	}

	try {
		const decoded = jwt.verify(token, secret) as AuthPayload;
		req.user = { sub: decoded.sub, email: decoded.email };
		next();
	} catch {
		res.status(401).json({ error: "invalid or expired token" });

		return;
	}
}
