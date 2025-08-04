"use client";
import { OrderItem } from "@/lib/@types/order";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const columns: ColumnDef<OrderItem>[] = [
  {
    id: "good.name",
    header: () => <span className="font-bold">Product Name</span>,
    cell: ({ row }) => <span>{row.original.good.name}</span>,
  },
  {
    id: "good.sku",
    header: () => <span className="font-bold">SKU</span>,
    cell: ({ row }) => <span>{row.original.goodId.slice(0, 8)}</span>,
  },
  {
    id: "costPrice",
    header: () => <span className="font-bold">Cost Price</span>,
    cell: ({ row }) => (
        <div className="text-left">
            {Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NGN",
            })
            .format(row.original.costPrice)
            .replace("NGN", "₦")}
        </div>
        ),
  },
  {
    id: "qty",
    header: () => <span className="font-bold">Quantity</span>,
    cell: ({ row }) => (
      <div className="font-semibold text-center">{row.original.qty}</div>
    ),
  },
  {
    id: "total",
    header: () => <span className="font-bold">Total</span>,
    cell: ({ row }) => {
      const total = row.original.costPrice * row.original.qty;
      return (
        <div className="text-left">
          {Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NGN",
          })
            .format(total)
            .replace("NGN", "₦")}
        </div>
      );
    },
  },
];

export default function OrderItemsTable({ items }: { items: OrderItem[] }) {
  const table = useReactTable({
    columns,
    data: items,
    getCoreRowModel: getCoreRowModel(),
    getRowId(originalRow) {
      return originalRow.id;
    },
  });
  return (
    <div className="relative flex flex-col h-full w-full p-2 border border-neu-3 mt-4">
      <div className="p-2">
        <h1 className="text-2xl font-bold text-gray-800">Items Ordered</h1>
      </div>
      <div className="h-full scrollbar-thin overflow-auto border-t-2 border-neu-3">
        <Table className="scrollbar-thin w-full">
          <TableHeader className="border-b border-pri-3">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        (idx == 0 ? " left-0 z-[1]" : "") +
                        " sticky top-0 bg-neu-1"
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-neu-3"
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <TableCell
                      key={cell.id}
                      className={`${idx == 0 ? "sticky left-0" : ""} ${
                        cell.column.columnDef.id === "actions"
                          ? "text-right cursor-pointer"
                          : ""
                      } bg-neu-1`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No items in this order.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
