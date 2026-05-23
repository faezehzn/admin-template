"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center cursor-pointer rounded-full transition-all outline-none",
        "data-[size=default]:h-4.5 data-[size=default]:w-8",
        "data-[size=sm]:h-3.5 data-[size=sm]:w-6",
        "data-[state=checked]:bg-secondary-200",
        "data-[state=unchecked]:bg-primary-200",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-primary-400 transition-transform",
          "group-data-[size=default]/switch:size-4",
          "group-data-[size=sm]/switch:size-3",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=checked]:bg-secondary-600",
          "data-[state=unchecked]:translate-x-0.5",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
