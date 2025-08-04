"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddNewBuyerModal from "./components/modals/create-buyer";
import { DataTable } from "./components/data-table";
import { useBuyerStore } from "@/lib/providers/buyer-provider";
import EditBuyerModal from "./components/modals/edit-buyer";
import DeleteBuyerModal from "./components/modals/delete-buyer";


export default function Home() {
  const { buyers, page, setPage, pageCount, hasNextPage, hasPrevPage } =
    useBuyerStore((state) => state);
  return (
    <>
      <AddNewBuyerModal />
      <EditBuyerModal />
      <DeleteBuyerModal />
      <div className="flex flex-col absolute h-[calc(100vh-60px)] top-[60px] w-full">
        <div className="h-full relative">
          <div className="flex flex-row justify-between items-center p-4 px-[30px]">
            <h1 className="text-xl font-quicksand font-semibold">
              Customers
            </h1>
            <a href="#actions/buyer/create">
              <Button className="flex flex-row gap-2 bg-[#FFE082] border border-[#FFE082] text-black hover:bg-[#FFE8B0]">
                <Plus size={20} strokeWidth={1.5} />
                Add Customer
              </Button>
            </a>
          </div>
          <DataTable
            data={buyers}
            page={page}
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
