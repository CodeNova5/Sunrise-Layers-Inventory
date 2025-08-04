import { Payment } from "@/lib/@types/payments";
import { MoreHorizontal, Receipt } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQueryState } from "nuqs";

export default function PaymentActions({ id }: Payment) {
  const [payment, setPayment] = useQueryState("payment", {
    defaultValue: "",
    clearOnDefault: true,
  });
  return (
    <Popover>
      <PopoverTrigger>
        <MoreHorizontal size={20} strokeWidth={1.5} />
      </PopoverTrigger>
      <PopoverContent className="w-[120px] px-0 flex flex-col gap-3">
        <a
          href={`#payment/receipt`}
          className="px-4 hover:bg-gray-100 flex flex-row justify-start items-center gap-2"
          onClick={() => setPayment(id)}
        >
          <Receipt size={20} strokeWidth={1.5} />
          Receipt
        </a>
      </PopoverContent>
    </Popover>
  );
}
