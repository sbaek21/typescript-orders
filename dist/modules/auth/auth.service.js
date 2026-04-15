"use strict";
const __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");

async function registerUser(input) {
	const email = input.email.trim().toLowerCase();
	const { password } = input;
	if (!email || !password) {
		throw new Error("EMAIL_AND_PASSWORD_REQUIRED");
	}
	if (password.length < 8) {
		throw new Error("PASSWORD_TOO_SHORT");
	}
	const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
	if (existing) {
		throw new Error("EMAIL_ALREADY_EXISTS");
	}
	const passwordHash = await bcrypt_1.default.hash(password, 10); // 10 = 비용(보안/속도 trade off
	const user = await prisma_1.prisma.user.create({
		data: { email, passwordHash },
	});

	return { id: user.id, email: user.email, createdAt: user.createdAt };
}
async function loginUser(input) {
	const email = input.email.trim().toLowerCase();
	const { password } = input;
	if (!email || !password) {
		throw new Error("EMAIL_AND_PASSWORD_REQUIRED");
	}
	const user = await prisma_1.prisma.user.findUnique({ where: { email } });
	if (!user) {
		throw new Error("INVALID_CREDENTIALS");
	}
	const ok = await bcrypt_1.default.compare(password, user.passwordHash);
	if (!ok) {
		throw new Error("INVALID_CREDENTIALS");
	}
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET_MISSING");
	}
	const accessToken = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email }, secret, { expiresIn: "1h" });

	return { accessToken };
}
