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
import {StaffFilter} from "@/lib/stores/staff-store";
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
import { useStaffStore } from "@/lib/providers/staff-store-provider";
import { useEffect } from "react";

export default function StaffsFilters() {
    // @ts-ignore
    const [selectedGroup] = useQueryState<string>("group", {defaultValue: ""});
    // @ts-ignore
    const [selectedStatus, setSelectedStatus] = useQueryState<string>("status", {defaultValue: "", clearOnDefault: true});
    const { applyFilter, filter, groups, loaded} = useStaffStore((state) => state);

    useEffect(() => {
        if (!loaded) return;
        applyFilter({...filter, group: selectedGroup});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGroup]);

    useEffect(() => {
        if (!loaded) return;
        applyFilter({...filter, status: selectedStatus as "active" | "banned"});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStatus]);
    
    function handleApplyFilters() {
        const newFilter: StaffFilter = {...filter};
        if (selectedGroup.length) {
            newFilter.group = selectedGroup.trim();
        } else {
            delete newFilter.group;
        }
        if (selectedStatus.length) {
            newFilter.status = selectedStatus.trim() as "active" | "banned";
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
                        value={selectedStatus}
                        // @ts-ignore
                        onValueChange={setSelectedStatus}
                    >
                        <div className="flex flex-row items-center justify-between">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select staff status" />
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
                                <SelectItem value={"active"}>
                                    Active
                                </SelectItem>
                                <SelectItem value={"banned"}>
                                    Banned
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
