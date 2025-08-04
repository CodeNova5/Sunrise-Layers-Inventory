import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortableHeaderProps<S extends { [key: string]: number }> = {
  children: React.ReactNode;
  name: keyof S;
  sort: S;
  applySort: (sort: S) => void;
  /**
   * Whether the sort can be cleared by clicking the header again.
   * if this is true, the sort can have 3 states: asc, desc, none.
   * if this is false, the sort can have 2 states: asc, desc.
   */
  isClearable?: boolean;
  /**
   * When applying a new sort, merge it with the existing sort
   * or replace it entirely.
   */
  mergeSort?: boolean;
};

export default function SortableHeader<S extends { [key: string]: -1 | 1 }>({
  children,
  name,
  sort,
  applySort,
  isClearable = true,
  mergeSort = true,
}: SortableHeaderProps<S>) {
  var sortDirection: "asc" | "desc" | "none" = "none";
  switch (sort[name]) {
    case 1:
      sortDirection = "asc";
      break;
    case -1:
      sortDirection = "desc";
      break;
    default:
      sortDirection = "none";
  }

  function handleClick() {
    const newSort = {} as S;
    mergeSort && Object.assign(newSort, sort);
    switch (sortDirection) {
      case "asc":
        // @ts-ignore
        newSort[name] = -1;
        break;
      case "desc":
        if (isClearable) {
            delete newSort[name];
        } else {
            // @ts-ignore
            newSort[name] = 1;
        }
        break;
      case "none":
        // @ts-ignore
        newSort[name] = 1;
        break;
    }
    applySort(newSort);
  }
  return (
    <Button variant="ghost" onClick={handleClick}>
      {children}
      {sortDirection === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
      {sortDirection === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
      {sortDirection === "none" && (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}
