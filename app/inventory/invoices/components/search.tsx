"use client";

import { useQueryState } from "nuqs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";
import { useEffect } from "react";
import { useExternalInvoiceStore } from "@/lib/providers/invoice-store-provider";

export default function InvoiceSearch() {
  const [query, setQuery] = useQueryState("invoice:q", {
    defaultValue: "",
    clearOnDefault: true,
  });

  const { applyFilter, filter, status } = useExternalInvoiceStore((state) => state);

  const debouncedSearch = debounce((query: string) => {
    applyFilter({ ...filter, query });
  }, 500);

  useEffect(() => {
    if (status === "idle") return;
    debouncedSearch(query);
    console.log("invoice search...");
    return () => {
      debouncedSearch.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="bg-white w-[300px] px-[10px] flex flex-row items-center justify-start gap-[10px] border border-[#FFE082] rounded-md">
      <Search size={20} strokeWidth={1.5} color={"var(--pri-600)"} />
      <Input
        placeholder="Search by client name or email..."
        onChange={(e) => setQuery(e.target.value)}
        value={query}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            applyFilter({ ...filter, query });
          }
        }}
        className="w-full outline-none border-none text-md py-2 px-0"
      />
    </div>
  );
}