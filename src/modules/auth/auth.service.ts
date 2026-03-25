import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import jwt from "jsonwebtoken";


export type RegisterInput = {
	email: string;
	password: string;
};

export type PublicUser = {
	id: string;
	email: string;
	createdAt: Date;
};

export type LoginInput = { email: string; password: string };

export type LoginOutput = { accessToken: string };

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
	const email = input.email.trim().toLowerCase();
	const { password } = input;

	if (!email || !password) throw new Error("EMAIL_AND_PASSWORD_REQUIRED");

	if (password.length < 8) throw new Error("PASSWORD_TOO_SHORT");

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) throw new Error("EMAIL_ALREADY_EXISTS");

	const passwordHash = await bcrypt.hash(password, 10); // 10 = 비용(보안/속도 trade off
	const user = await prisma.user.create({
		data: { email, passwordHash },
	});


	return { id: user.id, email: user.email, createdAt: user.createdAt };
}

export async function loginUser(input: LoginInput): Promise<LoginOutput> {
	const email = input.email.trim().toLowerCase();
	const { password } = input;

	if (!email || !password) throw new Error("EMAIL_AND_PASSWORD_REQUIRED");

	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) throw new Error("INVALID_CREDENTIALS");

	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) throw new Error("INVALID_CREDENTIALS");

	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error("JWT_SECRET_MISSING");

	const accessToken = jwt.sign(
		{ sub: user.id, email: user.email },
		secret,
		{ expiresIn: "1h" }
	);
	return { accessToken };
}
