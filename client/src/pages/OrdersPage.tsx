import { useEffect, useState } from "react";
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/orders/me").then((res) => setOrders(res.data));
  }, []);

  const handleCancel = async (orderId: string) => {
    try {
      await api.post(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "CANCELLED", cancelledAt: new Date().toISOString() } : o
        )
      );
    } catch {
      alert("Cancel failed");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Orders</h2>
        <button onClick={() => navigate("/products")}>Back to Products</button>
      </div>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map((o) => (
        <div key={o.id} style={{ border: "1px solid #ddd", padding: 16, marginBottom: 12, borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontWeight: "bold", color: o.status === "CANCELLED" ? "red" : "green" }}>
                {o.status}
              </span>
              <span style={{ marginLeft: 8, color: "#666", fontSize: 12 }}>
                {new Date(o.createdAt).toLocaleDateString()}
              </span>
            </div>
            {o.status === "PLACED" && (
              <button onClick={() => handleCancel(o.id)} style={{ color: "red" }}>
                Cancel
              </button>
            )}
          </div>
          <ul style={{ marginTop: 8, paddingLeft: 16 }}>
            {o.items.map((item) => (
              <li key={item.id}>
                {item.product.name} x{item.quantity} — ${item.priceAtPurchase}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}