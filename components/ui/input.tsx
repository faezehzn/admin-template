import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip } from "../shared/tooltip";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  tooltipContent?: string;
  tooltipOn?: boolean;
}

function Input({
  className,
  tooltipContent,
  tooltipOn = true,
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";

  return (
    <>
      <Tooltip
        side={"bottom"}
        content={tooltipContent ?? props.placeholder}
        className={cn("justify-center")}
        offOrOn={tooltipOn === true ? "on" : "off"}
      >
        <div className="relative w-full">
          <input
            type={isPassword ? (showPassword ? "text" : "password") : type}
            data-slot="input"
            className={cn(
              "h-8 w-full min-w-0 rounded-lg border border-border bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 focus:border-2 focus:border-primary-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-primary-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20 md:text-sm placeholder:text-sm sm:placeholder:text-base",
              isPassword && "pr-10",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-diactive hover:text-primary-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </Tooltip>
    </>
  );
}

export { Input };
