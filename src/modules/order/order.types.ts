export type OrderStatus = "PLACED" | "CANCELLED";

export type OrderItem = {
	productId: string;
	quantity: number;
	priceAtPurchase: number;
};

export type Order = {
	id: string;
	userId: string;
	status: OrderStatus;
	items: OrderItem[];
	createdAt: string;
	cancelledAt?: string;
};
