"use client";

import { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ListFilter } from "lucide-react";
import { useQueryState, parseAsInteger, parseAsTimestamp } from "nuqs";
import { useExternalInvoiceStore } from "@/lib/providers/invoice-store-provider";
import NumberRangeFilter from "@/components/ui/number-range";
import DateRangeFilter from "@/components/ui/date-range";

const dueDatePresets = [
  {
    id: "today",
    label: "Today",
    apply: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  {
    id: "next-week",
    label: "Next Week",
    apply: () => {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return {
        from: today,
        to: nextWeek,
      };
    },
  },
  {
    id: "next-month",
    label: "Next Month",
    apply: () => {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      return {
        from: today,
        to: nextMonth,
      };
    },
  },
];

export default function InvoiceFilters() {
  const [minTax, setMinTax] = useQueryState("invoice:tax[min]", {
    ...parseAsInteger,
    defaultValue: 0,
  });
  const [maxTax, setMaxTax] = useQueryState("invoice:tax[max]", {
    ...parseAsInteger,
    defaultValue: 100000,
  });

  const [minDiscount, setMinDiscount] = useQueryState("invoice:discount[min]", {
    ...parseAsInteger,
    defaultValue: 0,
  });
  const [maxDiscount, setMaxDiscount] = useQueryState("invoice:discount[max]", {
    ...parseAsInteger,
    defaultValue: 100,
  });

  const [minPayment, setMinPayment] = useQueryState("invoice:payment[min]", {
    ...parseAsInteger,
    defaultValue: 0,
  });
  const [maxPayment, setMaxPayment] = useQueryState("invoice:payment[max]", {
    ...parseAsInteger,
    defaultValue: 1000000,
  });

  const { applyFilter, filter } = useExternalInvoiceStore(state => state);

  // Handle tax range changes
  const handleTaxChange = () => {
    applyFilter({
      ...filter,
      tax: {
        gte: minTax.toString(),
        lte: maxTax.toString()
      }
    });
  };

  // Handle discount range changes
  const handleDiscountChange = () => {
    applyFilter({
      ...filter,
      discount: {
        gte: minDiscount.toString(),
        lte: maxDiscount.toString()
      }
    });
  };

  // Handle payment range changes
  const handlePaymentChange = () => {
    applyFilter({
      ...filter,
      payment: {
        gte: minPayment.toString(),
        lte: maxPayment.toString()
      }
    });
  };

  return (
    <Popover>
      <PopoverTrigger className="flex flex-row items-center justify-start gap-3 border border-neu-3 p-[8px] rounded-md">
        <ListFilter size={20} strokeWidth={1.5} /> Filter
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-3 overflow-auto scrollbar-thin h-[50vh]">
        <NumberRangeFilter
          min={0}
          max={100000}
          step={1000}
          label="Tax Amount (₦)"
          handleApply={handleTaxChange}
          minState={[minTax, setMinTax]}
          maxState={[maxTax, setMaxTax]}
        />

        <NumberRangeFilter
          min={0}
          max={100}
          step={5}
          label="Discount (%)"
          handleApply={handleDiscountChange}
          minState={[minDiscount, setMinDiscount]}
          maxState={[maxDiscount, setMaxDiscount]}
        />

        <NumberRangeFilter
          min={0}
          max={1000000}
          step={10000}
          label="Amount (₦)"
          handleApply={handlePaymentChange}
          minState={[minPayment, setMinPayment]}
          maxState={[maxPayment, setMaxPayment]}
        />
      </PopoverContent>
    </Popover>
  );
}