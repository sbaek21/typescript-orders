import type { AuthPayload } from "../middlewares/auth.middleware";

export {};

declare global {
	namespace Express {
		interface Request {
			user?: AuthPayload;
		}
	}
}
