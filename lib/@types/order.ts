import { PaginatedDocs } from "./pagination";
import { NewPayment, Payment } from "./payments";

export type OrderStatus =
  | "pending"
  | "cancelled"
  | "paid"
  | "overdue"
  | "ongoing";
export type PaymentMethod =
  | "cash"
  | "credit"
  | "debit"
  | "voucher"
  | "bank"
  | "cheque";
export const orderStatusChoices: OrderStatus[] = [
  "pending",
  "ongoing",
  "paid",
  "cancelled",
  "overdue",
];
export const paymentMethodChoices: PaymentMethod[] = [
  "cash",
  "credit",
  "debit",
  "voucher",
  "bank",
  "cheque",
];

export interface OrderItemGood {
  name: string;
  description: string;
  productId: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  costPrice: number;
}

export interface OrderItem {
  id: string;
  qty: number;
  goodId: string;
  orderId: string;
  costPrice: number;
  sellingPrice: number; // Per unit
  good: OrderItemGood;
}

export interface OrderBuyer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNo: number;
  buyerId: string;
  discount: number;
  buyer: OrderBuyer;
  amountPaid: number;
  overdueLimit: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  cancelReason: string | null;
}

export interface OrderSummary extends Omit<Order, "items" | "payments"> {
  totalCost: number;
  numItems: number;
  totalAmount: number;
};

export type OrderSort = Partial<{
  discount: -1 | 1;
  amountPaid: -1 | 1;
  overdueLimit: -1 | 1;
  createdAt: -1 | 1;
}>;

export interface PaginatedOrders extends PaginatedDocs {
  orders: OrderSummary[];
}

export type NewOrderItem = Omit<OrderItem, "orderId" | "id" | "good">;
export type NewOrderPayment = Omit<NewPayment, "order" | "customer" | "confirmedBy">;
export type ExistingOrderPayment = Omit<Payment, "order" | "customer" | "confirmedBy" | "createdAt">;
export type NewOrder = Omit<
  Order,
  "id" | "buyer" | "amountPaid" | "payments" | "items"
> & {
  items: NewOrderItem[];
  payments?: NewOrderPayment[];
};
export type OrderModification = Omit<
  Order,
  "buyer" | "amountPaid" | "payments" | "items"
> & {
  items: (OrderItem | NewOrderItem)[];
  payments?: (ExistingOrderPayment | NewOrderPayment)[];
};
