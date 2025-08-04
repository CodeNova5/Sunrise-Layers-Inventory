import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  prependSymbol?: boolean;
  symbol?: string;
  onChange?: (value: number) => void;
  classNames?: {
    symbol?: string;
    container?: string;
  }
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ prependSymbol = false, symbol, className, classNames, ...props }, ref) => {
    const isFocused = useRef(false);
    props.onChange = props.onChange || (() => {});
    classNames = classNames || {};
    const displaySymbol = symbol ? true : false;
    const symbolClass = cn(
      "bg-gray-200 text-black text-sm p-2 rounded-l-md border border-input",
      props.disabled && "opacity-50 cursor-not-allowed",
      classNames.symbol
    );
    const containerClass = cn(
      "flex items-center",
      classNames.container
    );
    const inputClass = cn(
      "w-full border border-input rounded-md p-2 disabled:cursor-not-allowed disabled:opacity-50 text-sm focus:outline-none focus:border-input",
      displaySymbol && (prependSymbol ? "rounded-l-none" : "rounded-r-none"),
      className
    );
  
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      let value = parseFloat(e.target.value);
      if (isNaN(value)) {
        value = 0;
      }
      if (props.max && value > (props.max as number)) {
        value = props.max as number;
      }
      if (props.min && value < (props.min as number)) {
        value = props.min as number;
      }
      props.onChange!(value);
      // e.target.value = value.toString();
    }
  
    const Symbol = () => (
      displaySymbol? (
        <div className={symbolClass}>
          {symbol}
        </div>
      ) : (
        <></>
      )
    );
    const Container = ({ children }: { children: React.ReactNode }) => (
      displaySymbol ? (
        <div className={containerClass}>
          {children}
        </div>
      ) : (
        <>{children}</>
      )
    );
    const Input = () => (
      <input
        type="number"
        className={inputClass}
        ref={ref}
        {...props}
        onChange={handleChange}
        autoFocus={isFocused.current}
        onFocus={() => isFocused.current = true}
        onBlur={() => isFocused.current = false}
      />
    );
    return (
      <Container>
        {prependSymbol && <Symbol />}
        <Input />
        {!prependSymbol && <Symbol />}
      </Container>
    );
  }
);
NumberInput.displayName = "NumberInput";
export default NumberInput;