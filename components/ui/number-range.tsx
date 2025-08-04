import { DoubleSlider, Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { isEqual } from "lodash";

interface NumberRangeProps {
  min: number;
  max: number;
  step?: number;
  label: string;
  handleApply: () => void;
  minLabel?: string;
  maxLabel?: string;
  defaultValue?: [number, number];
  minState: [number, (value: number) => void];
  maxState: [number, (value: number) => void];
}

export default function NumberRangeFilter({
  min,
  max,
  step = 1,
  label,
  handleApply,
  minLabel = "Min",
  maxLabel = "Max",
  defaultValue = [min, max],
  minState,
  maxState,
}: NumberRangeProps) {
  const [minValue, setMinValue] = minState;
  const [maxValue, setMaxValue] = maxState;
  const defaultRange = React.useRef<readonly [number, number]>([min, max]);
  const cachedRange = React.useRef<[number, number]>([minValue, maxValue]);
  const applyCount = React.useRef((min === minValue && max === maxValue) ? 0 : 1);
  const didReset = React.useRef(false);
  

  const hasPendingChanges = () => {
    return (
      minValue !== cachedRange.current[0] || maxValue !== cachedRange.current[1]
    );
  };

  const onApply = () => {
    applyCount.current += 1;
    cachedRange.current = [minValue, maxValue];
    handleApply();
  };

  const onReset = () => {
    setMinValue(defaultRange.current[0]);
    setMaxValue(defaultRange.current[1]);
    cachedRange.current[0] = defaultRange.current[0];
    cachedRange.current[1] = defaultRange.current[1];
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
            applyCount.current > 0 && !hasPendingChanges() ? "" : "hidden"
          )}
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
      <DoubleSlider
        className="mb-3 w-full"
        defaultValue={defaultValue}
        value={[minValue, maxValue]}
        max={max}
        min={min}
        step={step}
        onValueChange={([min, max]: [number, number]) => {
          setMinValue(min);
          setMaxValue(max);
        }}
      />
      <div className="flex flex-row items-center justify-between w-full gap-3">
        <Input
          type="number"
          value={minValue}
          onChange={(e) => setMinValue(Number.parseInt(e.target.value))}
          placeholder={minLabel}
        />
        <span>to</span>
        <Input
          type="number"
          value={maxValue}
          onChange={(e) => setMaxValue(Number.parseInt(e.target.value))}
          placeholder={maxLabel}
        />
      </div>
    </div>
  );
}
