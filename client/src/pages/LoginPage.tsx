import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/client";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const login = useAuthStore((s) => s.login);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await api.post("/auth/login", { email, password });
			login(res.data.accessToken);
			void navigate("/products");
		} catch {
			setError("Invalid email or password");
		}
	};

	return (
		<div style={{ maxWidth: 400, margin: "100px auto", padding: 24 }}>
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<input
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						style={{ width: "100%", marginBottom: 8, padding: 8 }}
					/>
				</div>
				<div>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						style={{ width: "100%", marginBottom: 8, padding: 8 }}
					/>
				</div>
				{error && <p style={{ color: "red" }}>{error}</p>}
				<button type="submit" style={{ width: "100%", padding: 8 }}>
					Login
				</button>
			</form>
			<p>
				No account? <Link to="/register">Register</Link>
			</p>
		</div>
	);
}
