import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthPayload = {
    sub: string;
    email: string;
};

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.header("Authorization");
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "missing bearer token" });
    }

    const token = header.slice("Bearer ".length);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ error: "server misconfigured" });
    }

    try {
        const decoded = jwt.verify(token, secret) as AuthPayload;
        req.user = { sub: decoded.sub, email: decoded.email };
        return next();
    } catch {
        return res.status(401).json({ error: "invalid or expired token" });
    }
}