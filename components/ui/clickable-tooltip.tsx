import {
  Tooltip as TooltipBase,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

const ClickableTooltip = <P extends any>({
  children,
  Trigger,
  ...props
}: {
  children: React.ReactNode;
  Trigger: React.ComponentType<P>;
} & Omit<P, "children">) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <TooltipProvider>
      <TooltipBase>
        <TooltipTrigger>
          <Trigger
            {...(props as any)}
            onClick={() => setShowTooltip(!showTooltip)}
          />
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </TooltipBase>
    </TooltipProvider>
  );
};

export default ClickableTooltip;
