"use client";
import { usePaymentStore } from "@/lib/providers/payment-store-provider";
import DataTable from "./components/data-table";


export default function Payments() {
    const { payments, page, setPage, pageCount, hasNextPage, hasPrevPage, status } =
        usePaymentStore((state) => state);
    return (
        <>
            <div className="flex flex-col absolute h-[calc(100vh-60px)] top-[60px] w-full">
                <div className="h-full relative">
                    <div className="flex flex-row justify-between items-center p-4 px-[30px]">
                        <h1 className="text-xl font-quicksand font-semibold">Payments</h1>
                    </div>
                    <DataTable
                        data={payments}
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