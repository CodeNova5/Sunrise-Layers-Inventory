"use client";
import { ColumnDef } from "@tanstack/react-table";
import ProfilePicture from "@/app/inventory/buyers/components/profile-picture";

import { Payment, PaymentSort } from "@/lib/@types/payments";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePaymentStore } from "@/lib/providers/payment-store-provider";
import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import PaymentMethod from "../../orders/components/payment-method";
import BaseSortableHeader from "@/components/ui/sortable-header";
import { Button } from "@/components/ui/button";
import { usePaymentFilter } from "@/lib/hooks/payments";
import PaymentActions from "./actions";

function SortableHeader({
  name,
  children,
}: {
  name: keyof PaymentSort;
  children: ReactNode;
}) {
  const { sort, applySort } = usePaymentStore((state) => state);
  return (
    <BaseSortableHeader name={name} sort={sort} applySort={applySort}>
      {children}
    </BaseSortableHeader>
  );
}

function CustomerCell({ customer }: { customer: Payment["customer"] }) {
  const { customerId, setCustomerId, getFilter } = usePaymentFilter();
  const { applyFilter, filter } = usePaymentStore((state) => state);
  const active = customerId === customer.id;
  const clicked = useRef(false);

  function handleFilter() {
    if (active) {
      setCustomerId(null);
    } else {
      setCustomerId(customer.id);
    }
    clicked.current = true;
  }

  useEffect(() => {
    if (clicked.current) {
      applyFilter({ ...filter, ...getFilter() });
      clicked.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="cursor-pointer text-pri-5 mr-1 text-ellipsis w-[150px]">
          {customer.name}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col items-center">
          <ProfilePicture buyer={customer} />
          <span className="font-bold mt-2">{customer.name}</span>
          <div className="flex items-center justify-center mt-2 flex-col">
            <a
              className="text-pri-5 text-sm cursor-pointer"
              href={`mailto:${customer.email}`}
              target="_blank"
              rel="noreferrer"
            >
              {customer.email}
            </a>
            <a
              className="text-pri-5 text-sm cursor-pointer"
              href={`tel:${customer.phone}`}
              target="_blank"
              rel="noreferrer"
            >
              {customer.phone.replace("+234", "0")}
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 border outline-0"
              onClick={handleFilter}
            >
              {active ? "Reset" : "View history"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const columns: ColumnDef<Payment>[] = [
  {
    id: "invoice",
    header: () => <span className="font-bold">Invoice</span>,
    cell: ({ row }) => (
      <Link href={`/inventory/orders/${row.original.order.id}`}>
        #{`${row.original.order.orderNo}`.padStart(5, "0")}
      </Link>
    ),
  },
  {
    id: "customer",
    header: () => <span className="font-bold">Customer</span>,
    cell: ({ row }) => <CustomerCell customer={row.original.customer} />,
  },
  {
    id: "date",
    header: () => (
      <SortableHeader name="createdAt">
        <span className="font-bold">Date</span>
      </SortableHeader>
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
    id: "amount",
    header: () => (
      <SortableHeader name="amount">
        <span className="font-bold">Amount</span>
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-left pl-4">
        {row.original.amount
          .toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 2,
          })
          .replace("NGN", "₦")}
      </div>
    ),
  },
  {
    id: "confirmedBy",
    header: () => <span className="font-bold">Confirmed By</span>,
    cell: ({ row }) => (
      <div className="text-bold font-medium text-left">
        {row.original.confirmedBy?.name || "N/A"}
      </div>
    ),
  },
  {
    id: "paymentMethod",
    header: () => <span className="font-bold">Mode</span>,
    cell: ({ row }) => (
      <PaymentMethod paymentMethod={row.original.paymentMethod} />
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <PaymentActions {...row.original} />;
    },
  },
];
