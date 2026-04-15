import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";

interface OrderItem {
	id: string;
	productId: string;
	quantity: number;
	priceAtPurchase: number;
	product: { name: string };
}

interface Order {
	id: string;
	status: string;
	createdAt: string;
	cancelledAt: string | null;
	items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
	PLACED: "#2563eb",
	CONFIRMED: "#7c3aed",
	SHIPPED: "#d97706",
	DELIVERED: "#16a34a",
	CANCELLED: "#dc2626",
};

const canCancel = (status: string) => status === "PLACED" || status === "CONFIRMED";

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [cancellingId, setCancellingId] = useState<string | null>(null);
	const navigate = useNavigate();

	const fetchOrders = useCallback(async () => {
		try {
			const res = await api.get("/orders/me");
			setOrders(res.data);
		} catch {
			setError("Failed to load orders");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchOrders();
	}, [fetchOrders]);

	const handleCancel = async (orderId: string) => {
		setCancellingId(orderId);
		setError("");
		try {
			await api.post(`/orders/${orderId}/cancel`);
			// 취소 후 서버에서 재조회 (stock 복구 반영)
			await fetchOrders();
		} catch {
			setError("Cancel failed");
		} finally {
			setCancellingId(null);
		}
	};

	const getOrderTotal = (items: OrderItem[]) =>
		items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);

	if (loading) {
		return <div style={{ textAlign: "center", marginTop: 100 }}>Loading...</div>;
	}

	return (
		<div style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<h2>My Orders</h2>
				<button onClick={() => void navigate("/products")}>Back to Products</button>
			</div>

			{error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

			{orders.length === 0 && <p style={{ color: "#666" }}>No orders yet.</p>}

			{orders.map((o) => (
				<div key={o.id} style={{ border: "1px solid #ddd", padding: 16, marginBottom: 12, borderRadius: 8 }}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<span style={{
								fontWeight: "bold",
								color: STATUS_COLORS[o.status] ?? "#333",
								background: "#f3f4f6",
								padding: "2px 8px",
								borderRadius: 4,
								fontSize: 13,
							}}>
								{o.status}
							</span>
							<span style={{ color: "#666", fontSize: 12 }}>
								{new Date(o.createdAt).toLocaleDateString()}
							</span>
							{!canCancel(o.status) && o.status !== "CANCELLED" && (
								<span style={{ fontSize: 11, color: "#999" }}>· cancellation not available</span>
							)}
						</div>
						{canCancel(o.status) && (
							<button
								onClick={() => void handleCancel(o.id)}
								disabled={cancellingId === o.id}
								style={{ color: "red", fontSize: 13 }}
							>
								{cancellingId === o.id ? "Cancelling..." : "Cancel"}
							</button>
						)}
					</div>

					<ul style={{ margin: "8px 0", paddingLeft: 16 }}>
						{o.items.map((item) => (
							<li key={item.id} style={{ fontSize: 14, marginBottom: 4 }}>
								{item.product.name} × {item.quantity} — ${item.priceAtPurchase}
							</li>
						))}
					</ul>

					<div style={{ textAlign: "right", fontSize: 13, color: "#444", marginTop: 8 }}>
						Total: <strong>${getOrderTotal(o.items)}</strong>
					</div>
				</div>
			))}
		</div>
	);
}