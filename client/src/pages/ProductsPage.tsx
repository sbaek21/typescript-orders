import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import { useAuthStore } from "../store/authStore";

interface Product {
	id: string;
	name: string;
	price: number;
}

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([]);
	const logout = useAuthStore((s) => s.logout);
	const navigate = useNavigate();

	useEffect(() => {
		void api.get("/products").then((res) => setProducts(res.data));
	}, []);

	const handleQuantityChange = (productId: string, quantity: number) => {
		setSelectedItems((prev) => {
			const existing = prev.find((i) => i.productId === productId);
			if (quantity === 0) {
				return prev.filter((i) => i.productId !== productId);
			}
			if (existing) {
				return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
			}

			return [...prev, { productId, quantity }];
		});
	};

	const handleOrder = async () => {
		if (!selectedItems.length) {
			alert("Select at least one item");

			return;
		}
		try {
			await api.post("/orders", { items: selectedItems });
			alert("Order placed!");
			void navigate("/orders");
		} catch {
			alert("Order failed");
		}
	};

	const handleLogout = () => {
		logout();
		void navigate("/login");
	};

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
			{products.map((p) => (
				<div key={p.id} style={{ border: "1px solid #ddd", padding: 16, marginBottom: 12, borderRadius: 8 }}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<div>
							<strong>{p.name}</strong>
							<span style={{ marginLeft: 8, color: "#666" }}>${p.price}</span>
						</div>
						<input
							type="number"
							min={0}
							defaultValue={0}
							onChange={(e) => handleQuantityChange(p.id, parseInt(e.target.value, 10))}
							style={{ width: 60, padding: 4 }}
						/>
					</div>
				</div>
			))}
			<button onClick={handleOrder} style={{ width: "100%", padding: 12, marginTop: 16 }}>
				Place Order
			</button>
		</div>
	);
}
