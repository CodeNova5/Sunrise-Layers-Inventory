import { OrderBuyer, PaymentMethod } from "./order";
import { PaginatedDocs } from "./pagination";

// the customer who made the payment
export interface PaymentCustomer extends OrderBuyer {}

// the staff who confirmed the payment
export interface PaymentVerifier {
  id: string;
  name: string;
}

// the order for which the payment was made
export interface PaymentOrder {
  id: string;
  orderNo: number;
}

export type PaymentSort = Partial<{
  amount: -1 | 1;
  createdAt: -1 | 1;
}>;

export interface Payment {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  order: PaymentOrder;
  customer: PaymentCustomer;
  confirmedBy: PaymentVerifier;
  createdAt: string;
}

export interface PaginatedPayments extends PaginatedDocs {
  payments: Payment[];
}

export interface NewPayment
  extends Omit<
    Payment,
    "id" | "confirmedBy" | "order" | "customer" | "createdAt"
  > {
  order: string;
  customer: string;
  confirmedBy: string;
}

export interface PaymentModification
  extends Partial<Omit<NewPayment, "order" | "customer" | "createdAt" | "confirmedBy">>,
    Pick<Payment, "id"> {}
