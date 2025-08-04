"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Buyer } from "@/lib/@types/buyer";
import BuyerActions from "./actions";
import ProfilePicture from "./profile-picture";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Mail, Phone } from "lucide-react";

export const columns: ColumnDef<Buyer>[] = [
  {
    accessorKey: "name",
    enableHiding: false,
    header: () => {
      return <span className="font-bold">Name</span>;
    },
    cell: ({ row }) => {
      const buyer = row.original;
      return (
        <div className="flex items-center">
          <ProfilePicture buyer={buyer} />
          <Popover>
            <PopoverTrigger asChild>
              <span className="ml-3 cursor-pointer text-pri-5 w-[200px] text-ellipsis">
                {buyer.name}
              </span>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col items-center">
                <ProfilePicture buyer={buyer} />
                <span className="font-bold mt-2">{buyer.name}</span>
                <div className="flex items-center justify-center mt-2 flex-col">
                  <a
                    className="text-pri-5 text-sm cursor-pointer"
                    href={`mailto:${buyer.email}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {buyer.email}
                  </a>
                  <a
                    className="text-pri-5 text-sm cursor-pointer"
                    href={`tel:${buyer.phone}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {buyer.phone.replace("+234", "0")}
                  </a>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
  },
  {
    id: "email",
    enableHiding: false,
    accessorKey: "email",
    header: () => {
      return <span className="font-bold">Email Address</span>;
    },
    cell: ({ row }) => {
      return (
        <span
          className="cursor-pointer text-pri-5"
          onClick={() => {
            window.open(`mailto:${row.original.email}`);
          }}
        >
          {row.original.email}
        </span>
      );
    },
  },
  {
    id: "phone",
    accessorKey: "phone",
    enableHiding: false,
    header: () => {
      return <span className="font-bold">Phone Number</span>;
    },
    cell: ({ row }) => {
      return (
        <span
          className="cursor-pointer text-pri-5"
          onClick={() => {
            window.open(`tel:${row.original.phone}`);
          }}
        >
          {row.original.phone.replace("+234", "0")}
        </span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <BuyerActions buyerId={row.id} />;
    },
  },
];
