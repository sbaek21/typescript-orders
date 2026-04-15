"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
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
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = { sub: decoded.sub, email: decoded.email };
        next();
    }
    catch {
        res.status(401).json({ error: "invalid or expired token" });
        return;
    }
}
