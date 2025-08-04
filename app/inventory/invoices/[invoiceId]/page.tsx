"use client";

import { useEffect, useState } from "react";
import { useExternalInvoiceStore } from "@/lib/providers/invoice-store-provider";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { formatCurrencyShort, formatDate } from "@/lib/utils";
import { MoveLeft } from "lucide-react";
import PDFReceipt from "../../components/pdf-receipt";
import { useRouter } from "next/navigation";
import { ExternalInvoice } from "@/lib/@types/invoice";
import { companyEmail, companyName, companyPhoneNumber } from "@/data";

export default function InvoiceViewPage({
  params,
}: {
  params: { invoiceId: string };
}) {
  const router = useRouter();
  const { getInvoice, updateInvoice, status } = useExternalInvoiceStore(
    (s) => s
  );
  const [invoice, setInvoice] = useState<ExternalInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await getInvoice(params.invoiceId);
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }
    };
    fetchInvoice();
  }, [params.invoiceId, getInvoice]);

  if (status === "loading" || !invoice) {
    return (
      <main className="p-6 pt-10 pb-20 w-full">
        <div className="flex justify-center items-center mb-6">Loading...</div>
      </main>
    );
  }

  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * invoice.discount) / 100;
  const taxAmount = (subtotal * invoice.tax) / 100;
  const total = subtotal - discountAmount + taxAmount + invoice.shipping;
  const balance = total - invoice.paymentMade;
  const isPaid = balance <= 0;
  const isOverdue = new Date(invoice.dueDate) < new Date() && !isPaid;

  return (
    <main className="p-6 pt-10 pb-20 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/inventory/invoices"
            className="text-black hover:text-pri-5 bg-white p-2 border-2 rounded-sm border-neu-4 transition"
          >
            <MoveLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              Invoice #{invoice.id.slice(0, 8)}
            </h1>
            <p className="text-gray-500 text-sm">
              Created on {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PDFReceipt
            id={invoice.id}
            createdAt={invoice.createdAt}
            items={invoice.items}
            client={invoice.client}
            discount={invoice.discount}
            tax={invoice.tax}
            shipping={invoice.shipping}
            type="invoice"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Bill From</h2>
          <p className="text-gray-600">{companyName}</p>
          <p className="text-gray-600">{companyEmail}</p>
          <p className="text-gray-600">{companyPhoneNumber}</p>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Bill To</h2>
          <p className="text-gray-600">{invoice.client.fullName}</p>
          <p className="text-gray-600">{invoice.client.email}</p>
          <p className="text-gray-600">{invoice.client.phone}</p>
          <p className="text-gray-600">{invoice.client.address}</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Item</th>
                <th className="text-left p-4">Description</th>
                <th className="text-right p-4">Quantity</th>
                <th className="text-right p-4">Price</th>
                <th className="text-right p-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.description || "-"}</td>
                  <td className="text-right p-4">{item.quantity}</td>
                  <td className="text-right p-4">
                    {formatCurrencyShort(item.price)}
                  </td>
                  <td className="text-right p-4">
                    {formatCurrencyShort(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t">
          <div className="w-72 ml-auto space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrencyShort(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount ({invoice.discount}%):</span>
              <span>{formatCurrencyShort(discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({invoice.tax}%):</span>
              <span>{formatCurrencyShort(taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{formatCurrencyShort(invoice.shipping)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span>Total:</span>
              <span>{formatCurrencyShort(total)}</span>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
