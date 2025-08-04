"use client";
import { PaymentMethod } from "@/lib/@types/order";
import { addDays } from "date-fns";

import { useState } from "react";
import InvoicePayments from "./invoice-payments";
import InvoiceItems from "./invoice-items";
import { InvoiceItem, InvoicePayment, CreateInvoiceState } from "./types";
import { createOrder } from "@/lib/stores/order-store";

export default function CreateInvoice({invoiceNumber, topGoods}: {invoiceNumber: number, topGoods: CreateInvoiceState["topGoods"]}) {
    const [invoiceNo, setInvoiceNo] = useState(invoiceNumber);
    const [customer, setCustomer] = useState("");
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [total, setTotal] = useState(0);
    const [notes, setNotes] = useState("");
    const [issueDate, setIssueDate] = useState<Date | undefined>(new Date());
    const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 7));
    const [discount, setDiscount] = useState(0);
    const [payments, setPayments] = useState<InvoicePayment[]>([]);

    async function saveInvoice() {
        const createdAt = issueDate?.toISOString();
        const overdueLimit = dueDate?.toISOString();
        const buyerId = customer.trim() ? customer : null;
        const nonEmptyItems = items.filter(item => item.cost && item.quantity);
        const nonEmptyPayments = payments.filter(payment => payment.amount);

        if (!buyerId) {
            throw new Error("Please select a customer");
        }
        if (!createdAt) {
            throw new Error("Please select an issue date");
        }
        if (!overdueLimit) {
            throw new Error("Please select a due date");
        }
        if (!items.length) {
            throw new Error("Please add items to the invoice");
        }
        for (const item of items) {
            if (item.cost == item.costPrice) {
                throw new Error(`Please set a selling price for ${item.name}`)
            }
            if (item.qtyInStock < item.quantity) {
                throw new Error(`Only ${item.qtyInStock} ${item.name} available in stock`);
            }
            if (item.quantity < 1) {
                throw new Error(`Please set a quantity for ${item.name}`);
            }
            if (item.cost < 0) {
                throw new Error(`Please set a valid selling price for ${item.name}`);
            }
        }

        return await createOrder({
            orderNo: invoiceNo,
            buyerId,
            items: nonEmptyItems.map(item => ({
                goodId: item.id,
                qty: item.quantity,
                sellingPrice: item.cost,
                costPrice: item.costPrice,
            })),
            // TODO: add notes
            // notes,
            createdAt,
            overdueLimit,
            status: "pending",
            cancelReason: null,
            discount,
            payments: nonEmptyPayments.map(payment => ({
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
            })),
        });
    }

    const state: CreateInvoiceState = {
        total,
        notes,
        dueDate,
        issueDate,
        discount,
        customer,
        invoiceNo,
        items,
        payments,
        topGoods,
        setTotal,
        setNotes,
        setDueDate,
        setIssueDate,
        setDiscount,
        setCustomer,
        setItems,
        setPayments,
        handleSave: saveInvoice,
    };

    return (
      <section className="grid w-full grid-cols-1 md:grid-cols-[minmax(0,_3fr)_minmax(0,_2fr)] gap-x-4 gap-y-4 pb-16">
          <InvoiceItems {...state} />
          <InvoicePayments {...state} />
      </section>
    );
}