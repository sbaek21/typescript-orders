export type Product = { id: string; name: string; price: number };

export const products: Product[] = [
    { id: "p1", name: "Keyboard", price: 50 },
    { id: "p2", name: "Mouse", price: 25 },
    { id: "p3", name: "Monitor", price: 200 },
];

export function findProduct(id: string) {
    return products.find((p) => p.id === id);
}