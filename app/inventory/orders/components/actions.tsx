"use client";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useQueryState } from "nuqs";

export default function BuyerActions({ buyerId }: { buyerId: string }) {
  const [_, setBuyerId] = useQueryState("buyer", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const handleEdit = () => setBuyerId(buyerId);
  const handleDelete = () => setBuyerId(buyerId);
  return (
    <Popover>
      <PopoverTrigger>
        <MoreHorizontal size={20} strokeWidth={1.5} />
      </PopoverTrigger>
      <PopoverContent className="w-[120px] px-0 flex flex-col gap-3">
        <a
          href={`#actions/buyer/edit`}
          className="px-4 py-2 hover:bg-gray-100 flex flex-row justify-start items-center gap-2"
          onClick={handleEdit}
        >
          <Pencil size={20} strokeWidth={1.5} />
          Edit
        </a>
        <a
          href={`#actions/buyer/delete`}
          className="px-4 py-2 hover:bg-gray-100 flex flex-row justify-start items-center gap-2"
          onClick={handleDelete}
        >
          <Trash size={20} color="red" strokeWidth={1.5} />
          Delete
        </a>
      </PopoverContent>
    </Popover>
  );
}
