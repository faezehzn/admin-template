"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode; // trigger
  content: React.ReactNode; // text tooltip
  side?: "top" | "bottom" | "left" | "right";
  align?: "center" | "start" | "end";
  sideOffset?: number;
  delay?: number; // delay to show
  light?: boolean; // light version
  className?: string;
  offOrOn?: "off" | "on"
}

export function Tooltip({
  children,
  content,
  side = "top",
  sideOffset = 0,
  align = "center",
  delay = 100,
  light = false,
  className,
  offOrOn = "on"
}: TooltipProps) {
  if(offOrOn === "off") return <>{children}</>
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            // ✨ Smart Auto Placement
            collisionPadding={12}
            avoidCollisions={true}
            sticky="always"
            alignOffset={4}
            className={cn(
              "z-99999 rounded-md px-3 py-1.5 text-sm shadow-md animate-in fade-in zoom-in-95",
              "bg-primary-300 text-primary-600",
              light &&
                "bg-black/70 text-light backdrop-blur-sm px-2 py-1 text-[11px]",
              className,
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-primary-300 " />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
