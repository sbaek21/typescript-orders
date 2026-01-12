import type { Request, Response } from "express";
import { registerUser } from "./auth.service";
import { loginUser } from "./auth.service";

export async function register(req: Request, res: Response) {
    try {
        const { email, password } = req.body ?? {};
        const user = await registerUser({ email, password });
        return res.status(201).json(user);
    } catch (err) {
        const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";

        if (message === "EMAIL_AND_PASSWORD_REQUIRED") {
            return res.status(400).json({ error: "email and password are required" });
        }
        if (message === "PASSWORD_TOO_SHORT") {
            return res.status(400).json({ error: "password must be at least 8 characters" });
        }
        if (message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({ error: "email already exists" });
        }
        return res.status(500).json({ error: "internal server error" });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body ?? {};
        const result = await loginUser({ email, password });
        return res.status(200).json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";

        if (message === "EMAIL_AND_PASSWORD_REQUIRED") {
            return res.status(400).json({ error: "email and password are required" });
        }
        if (message === "INVALID_CREDENTIALS") {
            return res.status(401).json({ error: "invalid credentials" });
        }
        if (message === "JWT_SECRET_MISSING") {
            return res.status(500).json({ error: "server misconfigured" });
        }
        return res.status(500).json({ error: "internal server error" });
    }
}

export function me(req: Request, res: Response) {
    return res.json({ user: req.user }); // requireAuth를 통과하면 req.user가 존재
}