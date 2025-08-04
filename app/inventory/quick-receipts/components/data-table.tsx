"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { FC, useState } from "react";
import {
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { columns } from "./columns";
import { ExternalInvoice } from "@/lib/@types/invoice";
import ReceiptSearch from "./search";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import ReceiptFilters from "./filters";
import { LoaderCircle, TriangleAlert } from "lucide-react";

interface DataTableProps {
  data: ExternalInvoice[];
  onNext: () => void;
  onPrev: () => void;
  status: "idle" | "loading" | "loaded" | "error";
  page: number;
  pageCount: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

const TableRows = ({
  table,
}: {
  table: import("@tanstack/table-core").Table<ExternalInvoice>;
}) => {
  return (
    <>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className="hover:bg-neu-3"
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export const DataTable: FC<DataTableProps> = ({
  data,
  status,
  onNext,
  onPrev,
  page,
  pageCount,
  hasPrevPage,
  hasNextPage,
}) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  return (
    <div className="relative flex flex-col h-full w-full">

      <div className="w-inherit md:w-[calc(100%-60px)] box-border flex flex-col bg-[#FFF8E1] py-3 overflow-auto rounded-t-md lg:m-[30px] m-[10px] h-[calc(100% - 550px)] border border-[#FFE082]">
        <div className="px-3">
          <div className="flex flex-row justify-between flex-wrap items-center mb-5">
            <Suspense>
              <ReceiptSearch />
            </Suspense>
            <div className="flex flex-row justify-start items-center gap-[10px] py-3">
              <Suspense>
                <ReceiptFilters />
              </Suspense>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto bg-[#FFF9C4] border-[#FFE082] text-[#8D6E63]">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#FFFDE7] border-[#FFE082]">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize text-[#8D6E63]"
                          checked={column.getIsVisible()}
                          onCheckedChange={column.toggleVisibility}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <Table className="scrollbar-thin w-full">
          <TableHeader className="border-b border-[#FFE082]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-[#FFF9C4]">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-[#FFFDE7] text-[#8D6E63]">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(() => {
              if (["loading", "idle"].includes(status)) {
                return (
                  <TableRow className="bg-[#FFFDE7]">
                    <TableCell colSpan={columns.length} className="h-24">
                      <LoaderCircle className="animate-spin h-6 w-6 mx-auto text-[#FFD54F]" />
                    </TableCell>
                  </TableRow>
                );
              }
              if (status === "error") {
                return (
                  <TableRow className="bg-[#FFFDE7]">
                    <TableCell colSpan={columns.length} className="h-24">
                      <div className="flex justify-center items-center text-[#8D6E63]">
                        <TriangleAlert className="h-6 w-6 mr-2 text-yellow-600" />
                        Error fetching data.
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }
              return <TableRows table={table} />;
            })()}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-row items-center justify-between p-3 mx-[30px] pt-0 h-[70px]">
        <div className="flex flex-row items-center justify-start gap-3">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={!hasPrevPage}
            className="bg-white text-black font-extrabold text-lg px-6 py-2 rounded shadow border border-[#FFD54F] hover:bg-[#FFE082] hover:text-[#4E342E] hover:scale-105 transition-all duration-150 disabled:opacity-50"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={!hasNextPage}
            className="bg-white text-black font-extrabold text-lg px-6 py-2 rounded shadow border border-[#FFD54F] hover:bg-[#FFE082] hover:text-[#4E342E] hover:scale-105 transition-all duration-150 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
        <p className="text-[#4E342E] font-bold text-lg bg-white px-4 py-2 rounded shadow border border-[#FFD54F]">
          Page <span className="text-[#FFD54F] text-2xl">{page}</span> of{" "}
          <span className="text-[#FFD54F] text-2xl">{pageCount}</span>
        </p>
      </div>
    </div>
  );
}; 