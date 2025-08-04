"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isEqual } from "lodash";

export type DateRangePreset = {
  id: string;
  label: string;
  apply: (date: DateRange) => DateRange;
};

interface DateRangeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  max: Date | null;
  min: Date | null;
  label: string;
  defaultValue?: [Date, Date];
  minState: [Date | null, (value: Date | null) => void];
  maxState: [Date | null, (value: Date | null) => void];
  /**a label to use when max is null */
  absentMaxLabel?: string;
  presetsLabel?: string;
  presets?: DateRangePreset[];
  handleApply: () => void;
}

export default function DateRangeFilter({
  className,
  label,
  max,
  min,
  minState,
  maxState,
  absentMaxLabel = "Present",
  presets,
  presetsLabel,
  handleApply,
}: DateRangeProps) {
  const [minValue, setMinValue] = minState;
  const [maxValue, setMaxValue] = maxState;
  const date: DateRange = {
    from: minValue || undefined,
    to: maxValue || undefined,
  };
  const defaultDate = React.useRef({
    from: min,
    to: max,
  } as DateRange);
  const applyCount = React.useRef((min === minValue && max === maxValue) ? 0 : 1);
  const cachedDate = React.useRef(date);
  const didReset = React.useRef(false);

  const hasPendingChanges = () => {
    return (
      date.from != cachedDate.current.from || date.to != cachedDate.current.to
    );
  };

  const onApply = () => {
    applyCount.current += 1;
    cachedDate.current = date;
    handleApply();
  };

  const onReset = () => {
    setMinValue(defaultDate.current.from || null);
    setMaxValue(defaultDate.current.to || null);
    cachedDate.current = defaultDate.current;
    applyCount.current = 0;
    didReset.current = true;
  };

  React.useEffect(() => {
    if (didReset.current) {
      didReset.current = false;
      handleApply();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minValue, maxValue]);

  function setDate(range?: DateRange) {
    if (range?.from) setMinValue(range.from);
    if (range?.to) setMaxValue(range.to);
  }

  function handleSelect(presetId: string) {
    const preset = presets?.find((p) => p.id === presetId);
    if (preset) {
      setDate({
        ...date,
        ...preset.apply(date),
      });
    }
  }

  return (
    <div className="flex flex-col items-start justify-start mb-2">
      <div className="flex justify-between items-center mb-2 w-full">
        <p className="text-sm">{label}</p>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-pri-6 hover:bg-pri-2",
            hasPendingChanges() ? "" : "hidden"
          )}
          onClick={onApply}
        >
          Apply
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-acc-6 hover:bg-acc-2",
            applyCount.current > 0 && !hasPendingChanges()
              ? ""
              : "hidden"
          )}
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
      <div className={cn("grid gap-2", className)}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                <>
                {format(date.from, "LLL dd, y")} -{" "}
                {(date.to && format(date.to, "LLL dd, y")) || absentMaxLabel}
                </>
              ) : (
                <span>{label}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="flex w-auto flex-col space-y-2 p-2"
            align="start"
          >
            {presets?.length && (
              <Select onValueChange={handleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={presetsLabel || "Select"} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {presets?.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
