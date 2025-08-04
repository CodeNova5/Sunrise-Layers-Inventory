"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ExternalInvoice } from "@/lib/@types/invoice";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExternalInvoiceStore } from "@/lib/providers/invoice-store-provider";
import Link from "next/link";

type SortableColumnHeaderProps = {
  children: React.ReactNode;
  name: keyof ExternalInvoice;
};


export const columns: ColumnDef<ExternalInvoice>[] = [
  {
    id: "id",
    accessorKey: "id",
    enableHiding: false,
    header: () => <span className="font-bold">ID</span>,
    cell: ({ row }) => (
      <Link href={`/inventory/quick-receipts/${row.original.id}`} className="font-bold">
        #{row.original.id.slice(0, 8)}
      </Link>
    ),
  },
  {
    id: "client",
    header: () => <span className="font-bold">Client</span>,
    cell: ({ row }) => {
      const receipt = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{receipt.client.fullName}</span>
          <span className="text-sm text-gray-500">{receipt.client.email}</span>
        </div>
      );
    },
  },
  {
    id: "Date",
    header: () => (
      <span className="font-bold">Date</span>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-left ml-4 font-medium">
          {date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "total",
    header: () => <span className="font-bold">Total Amount</span>,
    cell: ({ row }) => {
      const receipt = row.original;
      const total = receipt.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const afterDiscount = total - (total * (receipt.discount / 100));
      const finalTotal = afterDiscount + receipt.tax + receipt.shipping;

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "NGN",
        currencyDisplay: "code",
        maximumFractionDigits: 0,
      }).format(finalTotal);

      return (
        <div className="text-left font-medium">
          {formatted.replace("NGN", "₦")}
        </div>
      );
    },
  },
]; 