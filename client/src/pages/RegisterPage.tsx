import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/client";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await api.post("/auth/register", { email, password });
			void navigate("/login");
		} catch {
			setError("Registration failed");
		}
	};

	return (
		<div style={{ maxWidth: 400, margin: "100px auto", padding: 24 }}>
			<h2>Register</h2>
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
					Register
				</button>
			</form>
			<p>
				Already have an account? <Link to="/login">Login</Link>
			</p>
		</div>
	);
}
