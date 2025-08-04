"use client"
import { useEffect, useState } from "react"
import { DataTable } from "@/app/inventory/staffs/components/data-table";
import { useStaffStore } from "@/lib/providers/staff-store-provider";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";


const Staffs = () => {
  const [activeTab, setTab] = useQueryState("group", { defaultValue: "", clearOnDefault: true });
  const { groups, staff, page, setPage, hasNextPage, hasPrevPage, totalPages, applyFilter, filter, loaded } = useStaffStore((state) => state);
  // const [selectedGroup, setSelectedGroup] = useQueryState<string>("group", {defaultValue: ""});

  useEffect(() => {
    if (!loaded) return;
    if (activeTab == 'all') applyFilter({ ...filter, group: '' })
    else applyFilter({ ...filter, group: activeTab });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const changeStaff = () => { }
  return (
    <div className="flex flex-col absolute h-[calc(100vh-60px)] top-[60px] w-full">
      <div className="h-full relative bg-[#FFF8E1] overflow-auto md:m-6">
        <div className="flex flex-row justify-between items-center p-4 px-[30px]">
          <h1 className="text-xl font-quicksand font-semibold">Staffs</h1>
          <a href="#actions/staff/create">
            <Button className="flex flex-row gap-2 bg-[#FFE082] text-[#6D4C41] hover:bg-[#FFD965]">
              <Plus size={20} strokeWidth={1.5} />
              Register Staff
            </Button>
          </a>
        </div>
        <div className="mx-[30px] mt-3 flex flex-row justify-between items-center">
          <ul className="font-quicksand text-black capitalize flex flex-row items-start bg-[#FFFDE7] overflow-x-auto overflow-y-clip gap-3 border border-[#FFE082] rounded-md px-2 py-1">
            <li
              onClick={() => setTab("")}
              className={`cursor-pointer color-gray-100 relative text-center transition-all duration-200 ease-in-out ${activeTab == "" ? "tab " : ""
                }`}
            >
              All
            </li>
            {groups.map((group) => (
              <li
                key={group.id}
                onClick={() => setTab(group.id)}
                className={`cursor-pointer relative text-center transition-all duration-200 ease-in-out ${activeTab == group.id ? "tab bg-[#FFF9C4] text-[#8D6E63] border border-[#FFE082]" : ""
                  }`}
              >
                {group.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full h-[calc(100%-45px)] bg-transparent">
          <DataTable
            data={staff}
            onChangeStaff={changeStaff}
            page={page}
            pageCount={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onNext={() => setPage(page + 1)}
            onPrev={() => setPage(page - 1)}
          />
        </div>
      </div>
    </div>
  );
}

export default Staffs