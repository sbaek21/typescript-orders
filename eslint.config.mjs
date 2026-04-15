import eslintConfigCodely from "eslint-config-codely";

export default [
	...eslintConfigCodely.full,
	{
		ignores: ["client/**", "dist/**", "prisma/**", "prisma.config.ts"],
	},
];
