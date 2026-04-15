"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const pg_1 = __importDefault(require("pg"));
const { Pool } = pg_1.default;
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "app",
    password: "app_pw",
    database: "app_db",
});
// const adapter = new PrismaPg(pool);
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = new client_1.PrismaClient({ adapter });
