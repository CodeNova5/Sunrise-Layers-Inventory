"use client";

import { useExternalInvoiceStore } from "@/lib/providers/invoice-store-provider";
import { DataTable } from "./components/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ExternalInvoicePage() {
  const { invoices, page, setPage, pageCount, hasNextPage, hasPrevPage, status } =
    useExternalInvoiceStore((state) => state);

  return (
    <>
      <div className="flex flex-col absolute h-[calc(100vh-60px)] top-[60px] w-full">
        <div className="h-full relative">
          <div className="flex flex-row justify-between items-center p-4 px-[30px]">
            <h1 className="text-xl font-quicksand font-semibold">Invoice</h1>
            <Link href={"/inventory/invoices/new"}>
              <Button className="flex flex-row gap-2 bg-[#FFE082] text-black hover:bg-[#FFD54F]">
                <Plus size={20} strokeWidth={1.5} />
                New Invoice
              </Button>
            </Link>
          </div>
          <DataTable
            data={invoices}
            page={page}
            status={status}
            pageCount={pageCount}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onNext={() => setPage(page + 1)}
            onPrev={() => setPage(page - 1)}
          />
        </div>
      </div>
    </>
  );
}