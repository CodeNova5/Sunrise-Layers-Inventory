"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { faker } from "@faker-js/faker";
import { Plus } from "lucide-react";
import EditGoodModal from "@/components/modals/EditGoodModal";
import DeleteGoodModal from "@/components/modals/DeleteGoodModal";
import AddGoodModal from "@/components/modals/AddGoodModal";
import axios from "@/lib/axios";
import Good from "@/lib/@types/goods";
import { DataTable } from "@/components/goods/data-table";
import { GoodStoreProvider, useGoodStore } from "@/lib/providers/good-store-provider";
import { useQueryState } from "nuqs";

export default function Home() {
    const { goods, page, setPage, pageCount, hasNextPage, hasPrevPage } = useGoodStore((state) => state);
    return (
        <>
            <EditGoodModal />
            <DeleteGoodModal />
            <AddGoodModal />
            <div className="flex flex-col absolute h-[calc(100vh-60px)] top-[60px] w-full">
                <div className="h-full relative">
                    <div className="flex flex-row justify-between items-center p-4 px-[30px]">
                        <h1 className="text-xl font-quicksand font-semibold">
                            Inventory Summary
                        </h1>
                        <a href="#actions/product/add-new">
                            <Button className="flex flex-row gap-2 bg-[#FFE082] border border-[#FFD965] text-[#6D4C41] hover:bg-[#FFD965]">
                                <Plus size={20} strokeWidth={1.5} />
                                Add Product
                            </Button>
                        </a>
                    </div>
                    <div className="flex flex-row flex-wrap gap-[30px] px-[30px] mx-0 items-center justify-evenly">
                        <div className="min-w-[300px] bg-[#FFFDE7] p-4 flex grow-1 flex-col rounded-md w-[30%] gap-3 border border-[#FFE082] shadow-inner">
                            <h3 className="text-2xl text-[#BF9000]">Categories</h3>
                            <p className="text-lg text-[#8D6E63]">Total: 17 </p>
                        </div>
                        <div className="min-w-[300px] bg-[#FFF9C4] p-4 flex grow-1 flex-col rounded-md w-[30%] gap-3 border border-[#FFE082] shadow-inner">
                            <h3 className="text-2xl text-[#BF9000]">Goods</h3>
                            <p className="text-lg text-[#8D6E63]">
                                Total: 45 (Goods)
                            </p>
                        </div>
                        <div className="min-w-[300px] bg-[#FFE8B0] p-4 flex grow-1 flex-col rounded-md w-[30%] gap-3 border border-[#FFD965] shadow-inner">
                            <h3 className="text-2xl text-[#BF9000]">
                                Low on Stock
                            </h3>
                            <p className="text-lg text-[#8D6E63]">
                                Total: 34 (Goods)
                            </p>
                        </div>
                    </div>
                    <DataTable
                        data={goods}
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
