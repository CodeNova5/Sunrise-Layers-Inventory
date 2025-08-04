import { useQueryState } from "nuqs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGoodStore } from "@/lib/providers/good-store-provider";
import { debounce } from "lodash";
import { useEffect } from "react";

export default function GoodsSearch() {
    const [query, setQuery] = useQueryState("query", { defaultValue: "" });
    const {applyFilter, filter, loaded} = useGoodStore((state) => state);

    const debouncedSearch = debounce((query: string) => {
        applyFilter({ ...filter, query });
    }, 500);

    useEffect(() => {
        if (!loaded) return;
        debouncedSearch(query);
        // Cleanup function to cancel if component unmounts
        return () => {
            debouncedSearch.cancel();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return (
        <div className="bg-white w-[300px] px-[10px] flex flex-row items-center justify-start gap-[10px] border border-[#FFE082] rounded-md">
            <Search size={20} strokeWidth={1.5} color={"var(--pri-600)"} />
            <Input
                placeholder="Search goods by name or code"
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                onKeyUp={(e) => {
                    if (e.key === "Enter") {
                        applyFilter({ ...filter, query });
                    }
                }}
                className=" w-full outline-none border-none text-md py-2 px-0"
            />
        </div>
    );
}
