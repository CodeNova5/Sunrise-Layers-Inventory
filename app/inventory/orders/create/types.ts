"use client";
import { Order, PaymentMethod } from "@/lib/@types/order";

export interface InvoiceItem {
    id: string;
    name: string;
    cost: number;
    quantity: number;
    qtyInStock: number;
    costPrice: number;
}

export interface InvoicePayment {
    amount: number;
    paymentMethod: PaymentMethod;
}

export interface CreateInvoiceState {
    total: number;
    notes: string;
    dueDate?: Date;
    issueDate?: Date;
    discount: number;
    customer: string;
    invoiceNo: number;
    items: InvoiceItem[];
    topGoods: {
        id: string;
        name: string;
        costPrice: number;
        qtyInStock: number;
    }[];
    payments: InvoicePayment[];
    setTotal: (total: number) => void;
    setNotes: (notes: string) => void;
    setDueDate: (dueDate?: Date) => void;
    setIssueDate: (issueDate?: Date) => void;
    setDiscount: (discount: number) => void;
    setCustomer: (customer: string) => void;
    setItems: (items: InvoiceItem[]) => void;
    setPayments: (payments: InvoicePayment[]) => void;
    handleSave: () => Promise<Order> | Order;
}