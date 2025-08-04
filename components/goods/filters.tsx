import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    ChevronDown,
    ListFilter,
    Search,
    Ellipsis,
    Pencil,
    Trash,
    X
} from "lucide-react";
import {GoodFilter} from "@/lib/stores/good-store";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import { useQueryState } from "nuqs";
import { useGoodStore } from "@/lib/providers/good-store-provider";
import { useEffect } from "react";

export default function GoodsFilters() {
    // @ts-ignore
    const [selectedCategory, setSelectedCategory] = useQueryState<string>("category", {defaultValue: ""});
    // @ts-ignore
    const [selectedStatus, setSelectedStatus] = useQueryState<string>("status", {defaultValue: ""});
    const {applyFilter, filter, allCategories, loaded} = useGoodStore((state) => state);

    useEffect(() => {
        if (!loaded) return;
        applyFilter({...filter, category: selectedCategory});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    useEffect(() => {
        if (!loaded) return;
        applyFilter({...filter, status: selectedStatus as "in-stock" | "low-stock" | "out-of-stock"});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStatus]);
    
    function handleApplyFilters() {
        const newFilter: GoodFilter = {...filter};
        if (selectedCategory.length) {
            newFilter.category = selectedCategory.trim();
        } else {
            delete newFilter.category;
        }
        if (selectedStatus.length) {
            newFilter.status = selectedStatus.trim() as "in-stock" | "low-stock" | "out-of-stock";
        } else {
            delete newFilter.status;
        }
        applyFilter(newFilter);
    }



    return (
        <Popover>
            <PopoverTrigger className="flex flex-row items-center justify-start gap-3 border border-neu-3 p-[8px] rounded-md">
                <ListFilter size={20} strokeWidth={1.5} /> Filter
            </PopoverTrigger>
            <PopoverContent>
                <div className="flex flex-col gap-3 overflow-auto h-fit">
                    <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
                        <div className="flex flex-row items-center justify-between">
                            <SelectTrigger className="w-[180px] text-left">
                                <SelectValue placeholder="Select item category" />
                            </SelectTrigger>
                            <Button
                                variant={"ghost"}
                                onClick={() => setSelectedCategory("")}
                                disabled={!selectedCategory.length}
                                size={"sm"}
                            >
                                <X size={20} strokeWidth={1.5} />
                            </Button>
                        </div>
                        <SelectContent>
                            <SelectGroup>
                                {allCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select
                        value={selectedStatus}
                        // @ts-ignore
                        onValueChange={setSelectedStatus}
                    >
                        <div className="flex flex-row items-center justify-between">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select item status" />
                            </SelectTrigger>
                            <Button
                                variant={"ghost"}
                                onClick={() => setSelectedStatus("")}
                                disabled={!selectedStatus.length}
                                size={"sm"}
                            >
                                <X size={20} strokeWidth={1.5} />
                            </Button>
                        </div>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={"in-stock"}>
                                    In Stock
                                </SelectItem>
                                <SelectItem value={"low-stock"}>
                                    Low Stock
                                </SelectItem>
                                <SelectItem value={"out-of-stock"}>
                                    Out of Stock
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {/* <Button variant={"default"} onClick={handleApplyFilters}>
                        Apply
                    </Button> */}
                </div>
            </PopoverContent>
        </Popover>
    );
}
