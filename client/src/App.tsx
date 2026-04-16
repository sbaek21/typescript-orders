import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuthStore } from "./store/authStore";

function PrivateRoute({ children }: { children: React.ReactNode }) {
	const token = useAuthStore((s) => s.token);

	return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route
					path="/products"
					element={
						<PrivateRoute>
							<ProductsPage />
						</PrivateRoute>
					}
				/>
				<Route
					path="/orders"
					element={
						<PrivateRoute>
							<OrdersPage />
						</PrivateRoute>
					}
				/>
				<Route path="*" element={<Navigate to="/login" />} />
			</Routes>
		</BrowserRouter>
	);
}
