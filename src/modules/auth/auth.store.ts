import type { User } from "./auth.types";

export const usersByEmail = new Map<string, User>(); // 메모리 저장소 (서버 재시작하면 날아감)