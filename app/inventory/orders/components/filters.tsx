/* eslint-disable react-hooks/exhaustive-deps */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ListFilter } from "lucide-react";
import {
  useQueryState,
  parseAsInteger,
  parseAsTimestamp,
  parseAsStringLiteral,
} from "nuqs";
import { useEffect} from "react";
import {
  OrderStatus,
  PaymentMethod,
  orderStatusChoices,
  paymentMethodChoices,
} from "@/lib/@types/order";
import { useOrderStore } from "@/lib/providers/order-store-provider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getGoods } from "@/lib/stores/good-store";
import NumberRangeFilter from "../../../../components/ui/number-range";
import DateRangeFilter from "../../../../components/ui/date-range";
import { createdAtPresets, overduePresets } from "./filter-presets";

async function filterItems(inputValue: string) {
  const response = await getGoods(1, 10, {
    query: inputValue.length ? inputValue : undefined,
  });
  const items = response.goods;
  return items.map((item) => ({ label: item.name, value: item.id }));
}



export default function OrderFilters() {
  const [costMin, costMax, costStep] = [0, 1000000, 1000];
  const [discountMin, discountMax, discountStep] = [0, 100, 10];
  const [amountPaidMin, amountPaidMax, amountPaidStep] = [0, 1000000, 1000];
  const [overdueMin, overdueMax] = [null, null];
  const [createdAtMin, createdAtMax] = [null, null];
  const [status, setStatus] = useQueryState<OrderStatus>("order:status", {
    ...parseAsStringLiteral(orderStatusChoices),
    clearOnDefault: true,
  });
  const [minCostPrice, setMinCostPrice] = useQueryState<number>(
    "order:cost[min]",
    {
      ...parseAsInteger,
      clearOnDefault: true,
      defaultValue: costMin,
    }
  );
  const [maxCostPrice, setMaxCostPrice] = useQueryState<number>(
    "order:cost[max]",
    {
      ...parseAsInteger,
      clearOnDefault: true,
      defaultValue: costMax,
    }
  );
  const [minDiscount, setMinDiscount] = useQueryState<number>(
    "order:discount[min]",
    {
      ...parseAsInteger,
      clearOnDefault: true,
      defaultValue: discountMin,
    }
  );
  const [maxDiscount, setMaxDiscount] = useQueryState<number>(
    "order:discount[max]",
    {
      ...parseAsInteger,
      clearOnDefault: true,
      defaultValue: discountMax,
    }
  );
  const [minAmountPaid, setMinAmountPaid] = useQueryState<number>(
    "order:paid[gte]",
    {
      ...parseAsInteger,
      clearOnDefault: true,
      defaultValue: amountPaidMin,
    }
  );
  const [maxAmountPaid, setMaxAmountPaid] = useQueryState<number>(
    "order:paid[lte]",
    {
      ...parseAsInteger,
      clearOnDefault: true,
      defaultValue: amountPaidMax,
    }
  );
  const [minOverdueLimit, setMinOverdueLimit] = useQueryState<Date>(
    "order:overdue[gte]",
    {
      ...parseAsTimestamp,
      clearOnDefault: true,
    }
  );
  const [maxOverdueLimit, setMaxOverdueLimit] = useQueryState<Date>(
    "order:overdue[lte]",
    {
      ...parseAsTimestamp,
      clearOnDefault: true,
    }
  );
  const [minCreatedAt, setMinCreatedAt] = useQueryState<Date>(
    "order:created[gte]",
    {
      ...parseAsTimestamp,
      clearOnDefault: true,
    }
  );
  const [maxCreatedAt, setMaxCreatedAt] = useQueryState<Date>(
    "order:created[lte]",
    {
      ...parseAsTimestamp,
      clearOnDefault: true,
    }
  );
  const [paymentMethod, setPaymentMethod] = useQueryState<PaymentMethod>(
    "order:payment-method",
    { ...parseAsStringLiteral(paymentMethodChoices), clearOnDefault: true }
  );
  // const [items, setItems] = useState<
  //   readonly { label: string; value: string }[]
  // >([]);
  const {
    applyFilter,
    filter,
    status: orderStatus,
  } = useOrderStore((state) => state);
  const loaded = orderStatus == "loaded";
  // const debouncedFilterItems = debounce(filterItems, 200);

  useEffect(() => {
    if (!loaded) return;
    applyFilter({ ...filter, status: status || undefined });
  }, [status]);

  const handleCostChange = () => {
    applyFilter({
      ...filter,
      minCostPrice: minCostPrice
        ? minCostPrice === costMin
          ? undefined
          : minCostPrice
        : undefined,
      maxCostPrice: maxCostPrice
        ? maxCostPrice === costMax
          ? undefined
          : maxCostPrice
        : undefined,
    });
  };

  const handleDiscountChange = () => {
    applyFilter({
      ...filter,
      minDiscount: minDiscount
        ? minDiscount === discountMin
          ? undefined
          : minDiscount
        : undefined,
      maxDiscount: maxDiscount
        ? maxDiscount === discountMax
          ? undefined
          : maxDiscount
        : undefined,
    });
  };

  const handleAmountPaidChange = () => {
    applyFilter({
      ...filter,
      minAmountPaid: minAmountPaid
        ? minAmountPaid === amountPaidMin
          ? undefined
          : minAmountPaid
        : undefined,
      maxAmountPaid: maxAmountPaid
        ? maxAmountPaid === amountPaidMax
          ? undefined
          : maxAmountPaid
        : undefined,
    });
  };

  const handleOverdueLimitChange = () => {
    applyFilter({
      ...filter,
      minOverdueLimit: minOverdueLimit
        ? minOverdueLimit === overdueMin
          ? undefined
          : minOverdueLimit
        : undefined,
      maxOverdueLimit: maxOverdueLimit
        ? maxOverdueLimit === overdueMax
          ? undefined
          : maxOverdueLimit
        : undefined,
    });
  };

  const handleCreatedAtChange = () => {
    applyFilter({
      ...filter,
      minCreatedAt: minCreatedAt
        ? minCreatedAt === createdAtMin
          ? undefined
          : minCreatedAt
        : undefined,
      maxCreatedAt: maxCreatedAt
        ? maxCreatedAt === createdAtMax
          ? undefined
          : maxCreatedAt
        : undefined,
    });
  };

  useEffect(() => {
    if (!loaded) return;
    applyFilter({ ...filter, paymentMethod: paymentMethod || undefined });
  }, [paymentMethod]);

  // useEffect(() => {
  //   if (!loaded) return;
  //   applyFilter({
  //     ...filter,
  //     items: items.length ? items.map((i) => i.value) : undefined,
  //   });
  // }, [items]);

  return (
    <Popover>
      <PopoverTrigger className="flex flex-row items-center justify-start gap-3 border border-neu-3 p-[8px] rounded-md">
        <ListFilter size={20} strokeWidth={1.5} /> Filter
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-3 overflow-auto scrollbar-thin h-[50vh]">
        <Select
          value={status || ""}
          // @ts-ignore
          onValueChange={setStatus}
        >
          <div className="flex flex-row items-center justify-between">
            <SelectTrigger className="w-[180px] text-left">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <Button
              variant={"ghost"}
              onClick={() => setStatus(null)}
              disabled={!status}
              size={"sm"}
            >
              <X size={20} strokeWidth={1.5} />
            </Button>
          </div>
          <SelectContent>
            <SelectGroup>
              {orderStatusChoices.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
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
        {/* <AsyncSelect
          isMulti
          cacheOptions
          defaultOptions
          value={items}
          loadOptions={debouncedFilterItems}
          onChange={setItems}
          placeholder="Items In Order"
        /> */}
        <NumberRangeFilter
          min={costMin}
          max={costMax}
          step={costStep}
          label="Order Cost (₦)"
          handleApply={handleCostChange}
          minState={[minCostPrice, setMinCostPrice]}
          maxState={[maxCostPrice, setMaxCostPrice]}
        />
        <NumberRangeFilter
          min={discountMin}
          max={discountMax}
          step={discountStep}
          label="Discount (%)"
          handleApply={handleDiscountChange}
          minState={[minDiscount, setMinDiscount]}
          maxState={[maxDiscount, setMaxDiscount]}
        />
        <NumberRangeFilter
          min={amountPaidMin}
          max={amountPaidMax}
          step={amountPaidStep}
          label="Amount Paid (₦)"
          handleApply={handleAmountPaidChange}
          minState={[minAmountPaid, setMinAmountPaid]}
          maxState={[maxAmountPaid, setMaxAmountPaid]}
        />
        <DateRangeFilter
          label="Select Created Date"
          min={createdAtMin}
          max={createdAtMax}
          minState={[minCreatedAt, setMinCreatedAt]}
          maxState={[maxCreatedAt, setMaxCreatedAt]}
          handleApply={handleCreatedAtChange}
          presets={createdAtPresets}
        />
        <DateRangeFilter
          label="Select Overdue Limit"
          min={overdueMin}
          max={overdueMax}
          minState={[minOverdueLimit, setMinOverdueLimit]}
          maxState={[maxOverdueLimit, setMaxOverdueLimit]}
          handleApply={handleOverdueLimitChange}
          presets={overduePresets}
        />
      </PopoverContent>
    </Popover>
  );
}
