"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const pg_1 = __importDefault(require("pg"));
const { Pool } = pg_1.default;
const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "app",
    password: "app_pw",
    database: "app_db",
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const products = [
    { id: "p1", name: "Mechanical Keyboard", price: 89, stock: 30 },
    { id: "p2", name: "Wireless Mouse", price: 45, stock: 50 },
    { id: "p3", name: '27" Monitor', price: 329, stock: 15 },
    { id: "p4", name: "USB-C Hub", price: 39, stock: 60 },
    { id: "p5", name: "Webcam HD", price: 79, stock: 25 },
    { id: "p6", name: "Desk Lamp", price: 35, stock: 4 },
    { id: "p7", name: "Laptop Stand", price: 49, stock: 20 },
    { id: "p8", name: "Headphones", price: 129, stock: 18 },
    { id: "p9", name: "Mousepad XL", price: 22, stock: 0 },
    { id: "p10", name: "Cable Organizer", price: 15, stock: 3 },
];
async function main() {
    // 1. 상품 upsert
    await Promise.all(products.map((product) => prisma.product.upsert({
        where: { id: product.id },
        update: { name: product.name, price: product.price, stock: product.stock },
        create: product,
    })));
    // 2. demo user 생성
    const passwordHash = await bcrypt_1.default.hash("demo1234", 10);
    const demoUser = await prisma.user.upsert({
        where: { email: "demo@shopflow.dev" },
        update: {},
        create: {
            email: "demo@shopflow.dev",
            passwordHash,
        },
    });
    // 3. demo orders 생성 (없을 때만)
    const existingOrders = await prisma.order.findMany({
        where: { userId: demoUser.id },
    });
    if (existingOrders.length === 0) {
        // PLACED 주문
        await prisma.order.create({
            data: {
                userId: demoUser.id,
                status: client_1.OrderStatus.PLACED,
                items: {
                    create: [
                        { productId: "p1", quantity: 1, priceAtPurchase: 89 },
                        { productId: "p2", quantity: 2, priceAtPurchase: 45 },
                    ],
                },
            },
        });
        // CONFIRMED 주문
        await prisma.order.create({
            data: {
                userId: demoUser.id,
                status: client_1.OrderStatus.CONFIRMED,
                items: {
                    create: [{ productId: "p5", quantity: 1, priceAtPurchase: 79 }],
                },
            },
        });
        // DELIVERED 주문
        await prisma.order.create({
            data: {
                userId: demoUser.id,
                status: client_1.OrderStatus.DELIVERED,
                items: {
                    create: [
                        { productId: "p8", quantity: 1, priceAtPurchase: 129 },
                        { productId: "p4", quantity: 1, priceAtPurchase: 39 },
                    ],
                },
            },
        });
        // CANCELLED 주문
        await prisma.order.create({
            data: {
                userId: demoUser.id,
                status: client_1.OrderStatus.CANCELLED,
                cancelledAt: new Date(),
                items: {
                    create: [{ productId: "p7", quantity: 1, priceAtPurchase: 49 }],
                },
            },
        });
    }
}
main()
    .then(async () => prisma.$disconnect())
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
