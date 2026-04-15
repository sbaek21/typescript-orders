"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
const auth_service_1 = require("./auth.service");
async function register(req, res) {
    try {
        const { email, password } = req.body ?? {};
        const user = await (0, auth_service_1.registerUser)({ email, password });
        res.status(201).json(user);
        return;
    }
    catch (err) {
        console.error("Register error:", err);
        const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
        if (message === "EMAIL_AND_PASSWORD_REQUIRED") {
            res.status(400).json({ error: "email and password are required" });
            return;
        }
        if (message === "PASSWORD_TOO_SHORT") {
            res.status(400).json({ error: "password must be at least 8 characters" });
            return;
        }
        if (message === "EMAIL_ALREADY_EXISTS") {
            res.status(409).json({ error: "email already exists" });
            return;
        }
        res.status(500).json({ error: "internal server error" });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body ?? {};
        const result = await (0, auth_service_1.loginUser)({ email, password });
        res.status(200).json(result);
        return;
    }
    catch (err) {
        console.error("Login error:", err);
        const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
        if (message === "EMAIL_AND_PASSWORD_REQUIRED") {
            res.status(400).json({ error: "email and password are required" });
            return;
        }
        if (message === "INVALID_CREDENTIALS") {
            res.status(401).json({ error: "invalid credentials" });
            return;
        }
        if (message === "JWT_SECRET_MISSING") {
            res.status(500).json({ error: "server misconfigured" });
            return;
        }
        res.status(500).json({ error: "internal server error" });
    }
}
function me(req, res) {
    res.json({ user: req.user }); // requireAuth를 통과하면 req.user가 존재
}
