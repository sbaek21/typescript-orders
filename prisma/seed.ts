import "dotenv/config";

import { prisma } from "../src/db";

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
