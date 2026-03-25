import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "app",
  password: "app_pw",
  database: "app_db",
});
// const adapter = new PrismaPg(pool);
const adapter = new PrismaPg(pool as any);

export const prisma = new PrismaClient({ adapter });