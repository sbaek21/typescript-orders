import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { usersByEmail } from "./auth.store";
import type { User } from "./auth.types";

export type RegisterInput = {
    email: string;
    password: string;
};

export type PublicUser = {
    id: string;
    email: string;
    createdAt: string;
};

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
        throw new Error("EMAIL_AND_PASSWORD_REQUIRED");
    }
    if (password.length < 8) {
        throw new Error("PASSWORD_TOO_SHORT");
    }
    if (usersByEmail.has(email)) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 10); // 10 = 비용(보안/속도 trade off
    const user: User = {
        id: randomUUID(),
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
    };

    usersByEmail.set(email, user);

    return { id: user.id, email: user.email, createdAt: user.createdAt };
}

export type LoginInput = {
    email: string;
    password: string;
};

export type LoginOutput = {
    accessToken: string;
};

export async function loginUser(input: LoginInput): Promise<LoginOutput> {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
        throw new Error("EMAIL_AND_PASSWORD_REQUIRED");
    }

    const user = usersByEmail.get(email);
    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET_MISSING");
    }

    const accessToken = jwt.sign(
        { sub: user.id, email: user.email },
        secret,
        { expiresIn: "1h" }
    );
    return { accessToken };
}