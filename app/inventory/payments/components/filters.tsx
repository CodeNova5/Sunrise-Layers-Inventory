import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { ListFilter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePaymentStore } from "@/lib/providers/payment-store-provider";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentMethodChoices } from "@/lib/@types/order";
import { usePaymentFilter } from "@/lib/hooks/payments";
import DateRangeFilter from "@/components/ui/date-range";
import NumberRangeFilter from "@/components/ui/number-range";
import { useEffect } from "react";

export default function PaymentFilter() {
  const {
    paymentMethod,
    setPaymentMethod,
    maxAmount,
    setMaxAmount,
    minAmount,
    setMinAmount,
    minCreatedAt,
    setMinCreatedAt,
    maxCreatedAt,
    setMaxCreatedAt,
    getFilter,
  } = usePaymentFilter({
    method: null,
    orderId: null,
    customerId: null,
    amount: [0, 10_000_000, 1000],
    createdAt: [null, null],
  });
  const {filter, applyFilter, status} = usePaymentStore((state) => state);
  const loaded = status === "loaded";

  useEffect(() => {
    if (!loaded) return;
    applyFilter({...filter, paymentMethod: paymentMethod || undefined});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);
    

  function handleApply() {
    const newFilter = {...filter, ...getFilter()};
    applyFilter(newFilter);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Filter <ListFilter className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-3 overflow-auto scrollbar-thin max-h-[50vh]">
        <Select
          value={paymentMethod || ""}
          // @ts-ignore
          onValueChange={setPaymentMethod}
        >
          <div className="flex flex-row items-center justify-between">
            <SelectTrigger className="w-[180px] text-left">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <Button
              variant={"ghost"}
              onClick={() => setPaymentMethod(null)}
              disabled={!paymentMethod}
              size={"sm"}
            >
              <X size={20} strokeWidth={1.5} />
            </Button>
          </div>
          <SelectContent>
            <SelectGroup>
              {paymentMethodChoices.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DateRangeFilter
          min={null}
          max={null}
          minState={[minCreatedAt, setMinCreatedAt]}
          maxState={[maxCreatedAt, setMaxCreatedAt]}
          label="Date Range"
          handleApply={handleApply}
        />
        <NumberRangeFilter
          min={0}
          max={10_000_000}
          minState={[minAmount!, setMinAmount]}
          maxState={[maxAmount!, setMaxAmount]}
          label="Amount Range"
          handleApply={handleApply}
        />
      </PopoverContent>
    </Popover>
  );
}
