export default interface Good {
    id: string;
    name: string;
    description: string;
    categories: string[];
    productCode: string;
    unitPrice: number;
    qtyInStock: number;
    minQtyThreshold: number;
    totalValue: number;
    status: "in-stock" | "low-stock" | "out-of-stock";
}