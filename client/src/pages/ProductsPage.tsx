import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import { useAuthStore } from "../store/authStore";

interface Product {
	id: string;
	name: string;
	price: number;
	stock: number;
}

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [quantities, setQuantities] = useState<Record<string, number>>({});
	const [loading, setLoading] = useState(true);
	const [ordering, setOrdering] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const logout = useAuthStore((s) => s.logout);
	const navigate = useNavigate();

	const fetchProducts = async () => {
		try {
			const res = await api.get("/products");
			setProducts(res.data);
		} catch {
			setError("Failed to load products");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchProducts();
	}, []);

	const handleQuantityChange = (productId: string, value: number) => {
		setQuantities((prev) => ({ ...prev, [productId]: value }));
	};

	const handleOrder = async () => {
		const items = Object.entries(quantities)
			.filter(([, qty]) => qty > 0)
			.map(([productId, quantity]) => ({ productId, quantity }));

		if (!items.length) {
			setError("Select at least one item");

			return;
		}

		setOrdering(true);
		setError("");
		setSuccess("");

		try {
			await api.post("/orders", { items });
			setSuccess("Order placed!");
			setQuantities({});
			// 주문 후 재고 반영을 위해 products 재조회
			await fetchProducts();
			setTimeout(() => void navigate("/orders"), 1000);
		} catch (err: unknown) {
			const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
			setError(msg === "insufficient stock" ? "Some items are out of stock" : "Order failed");
		} finally {
			setOrdering(false);
		}
	};

	const handleLogout = () => {
		logout();
		void navigate("/login");
	};

	const getStockLabel = (stock: number) => {
		if (stock === 0) { return { text: "Out of stock", color: "red" }; }
		if (stock <= 5) { return { text: `Low stock: ${stock} left`, color: "orange" }; }

		return { text: `In stock: ${stock}`, color: "green" };
	};

	if (loading) {
		return <div style={{ textAlign: "center", marginTop: 100 }}>Loading...</div>;
	}

	return (
		<div style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<h2>Products</h2>
				<div>
					<button onClick={() => void navigate("/orders")} style={{ marginRight: 8 }}>
						My Orders
					</button>
					<button onClick={handleLogout}>Logout</button>
				</div>
			</div>

			{error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}
			{success && <p style={{ color: "green", marginBottom: 12 }}>{success}</p>}

			{products.map((p) => {
				const stockLabel = getStockLabel(p.stock);
				const isOutOfStock = p.stock === 0;

				return (
					<div key={p.id} style={{ border: "1px solid #ddd", padding: 16, marginBottom: 12, borderRadius: 8, opacity: isOutOfStock ? 0.6 : 1 }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<div>
								<strong>{p.name}</strong>
								<span style={{ marginLeft: 8, color: "#666" }}>${p.price}</span>
								<span style={{ marginLeft: 8, fontSize: 12, color: stockLabel.color }}>
									{stockLabel.text}
								</span>
							</div>
							<input
								type="number"
								min={0}
								max={p.stock}
								value={quantities[p.id] ?? 0}
								disabled={isOutOfStock}
								onChange={(e) => handleQuantityChange(p.id, parseInt(e.target.value, 10) || 0)}
								style={{ width: 60, padding: 4 }}
							/>
						</div>
					</div>
				);
			})}

			<button
				onClick={() => void handleOrder()}
				disabled={ordering}
				style={{ width: "100%", padding: 12, marginTop: 16 }}
			>
				{ordering ? "Placing order..." : "Place Order"}
			</button>
		</div>
	);
}