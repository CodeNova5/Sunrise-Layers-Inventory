"use client";

import { ColumnDef } from "@tanstack/react-table";
import Good from "@/lib/@types/goods";
import GoodActions from "./actions";


export const columns: ColumnDef<Good>[] = [
    {
        accessorKey: "name",
        header: "Name",
        enableHiding: false,
    },
    {
        accessorKey: "categories",
        header: "Categories",
        cell: ({ row }) => {
            // display the categories as badges
            return (
                <div className="flex flex-wrap gap-2">
                    {(row.getValue("categories") as string[]).map(
                        (category) => (
                            <span
                                key={category}
                                className="px-2 py-1 text-xs font-medium text-white bg-acc-7 rounded-sm"
                            >
                                {category}
                            </span>
                        )
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "productCode",
        header: "Product Code",
        cell: ({ row }) => {
            return (
                <div className="text-left font-medium">
                    {(row.getValue("productCode") as string).slice(0, 8)}
                </div>
            );
        },
    },
    {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("unitPrice"));
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "NGN",
                currencyDisplay: "code",
                maximumFractionDigits: 0,
            }).format(amount);

            return (
                <div className="text-left font-medium">
                    {formatted.replace("NGN", "₦")}
                </div>
            );
        },
    },
    {
        accessorKey: "qtyInStock",
        header: "Qty In Stock",
    },
    {
        accessorKey: "totalValue",
        header: "Total Value",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalValue"));
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "NGN",
                currencyDisplay: "code",
                maximumFractionDigits: 0,
            }).format(amount);

            return (
                <div className="text-left font-medium">
                    {formatted.replace("NGN", "₦")}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            return (
                <GoodActions goodId={row.id} />
            );
        },
    },
];