import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
	host: "localhost",
	port: 5432,
	user: "app",
	password: "app_pw",
	database: "app_db",
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const products = [
	{ id: "p1", name: "Mechanical Keyboard", price: 89, stock: 30 },
	{ id: "p2", name: "Wireless Mouse", price: 45, stock: 50 },
	{ id: "p3", name: '27" Monitor', price: 329, stock: 15 },
	{ id: "p4", name: "USB-C Hub", price: 39, stock: 60 },
	{ id: "p5", name: "Webcam HD", price: 79, stock: 25 },
	{ id: "p6", name: "Desk Lamp", price: 35, stock: 4 }, // low stock
	{ id: "p7", name: "Laptop Stand", price: 49, stock: 20 },
	{ id: "p8", name: "Headphones", price: 129, stock: 18 },
	{ id: "p9", name: "Mousepad XL", price: 22, stock: 0 }, // out of stock
	{ id: "p10", name: "Cable Organizer", price: 15, stock: 3 }, // low stock
];

async function main(): Promise<void> {
	await Promise.all(
		products.map((product) =>
			prisma.product.upsert({
				where: { id: product.id },
				update: { name: product.name, price: product.price, stock: product.stock },
				create: product,
			}),
		),
	);
}

main()
	.then(async () => prisma.$disconnect())
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
