import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error: unknown) => {
		const err = error as { response?: { status?: number }; config?: { url?: string } };
		const isLoginRequest = err.config?.url?.includes("/auth/login");
		if (err.response?.status === 401 && !isLoginRequest) {
			useAuthStore.getState().logout();
			window.location.href = "/login";
		}

		return Promise.reject(error);
	},
);

export default api;