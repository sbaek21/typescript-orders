"use strict";
const __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const order_routes_1 = __importDefault(require("./modules/order/order.routes"));
const product_routes_1 = __importDefault(require("./modules/product/product.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));

const app = (0, express_1.default)();
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL] : ["http://localhost:5173"];
app.use(
	(0, cors_1.default)({
		origin: allowedOrigins,
		credentials: true,
	}),
);
app.use(express_1.default.json());
app.use("/health", health_routes_1.default);
app.use("/auth", auth_routes_1.default);
app.use("/orders", order_routes_1.default);
app.use("/products", product_routes_1.default);
exports.default = app;
