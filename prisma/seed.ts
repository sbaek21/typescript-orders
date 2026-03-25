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
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
	await prisma.product.upsert({
		where: { id: "p1" },
		update: {},
		create: { id: "p1", name: "Keyboard", price: 50 },
	});

	await prisma.product.upsert({
		where: { id: "p2" },
		update: {},
		create: { id: "p2", name: "Mouse", price: 25 },
	});

	await prisma.product.upsert({
		where: { id: "p3" },
		update: {},
		create: { id: "p3", name: "Monitor", price: 200 },
	});
}

main()
	.then(async () => prisma.$disconnect())
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
