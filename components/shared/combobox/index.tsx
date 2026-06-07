"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";

// icons
import {
  HiCheckBadge,
  HiUserCircle,
  HiXMark,
  HiChevronDown,
} from "react-icons/hi2";

// constants
import useMobileSize from "@/hooks/useMobileSize";
import { IconType } from "react-icons/lib";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------

interface Option {
  label: string;
  value: string;
  avatar?: string;
  group?: string;
}

interface SelectComboboxProps {
  options: Option[];

  value?: string | string[];
  onChange: (v: string | string[]) => void;

  placeholder?: string;
  align?: "center" | "start" | "end" | undefined;
  searchable?: boolean;
  avatar?: boolean;
  multi?: boolean;
  asyncSearch?: (query: string) => Promise<Option[]>;
  classNameBtn?: string;
  virtualized?: boolean;
  ArrowIcon?: IconType;
  loading?: boolean; // Skeleton loading
  groupEnabled?: boolean; // Group by group field
  placement?: "top" | "bottom" | "left" | "right"; // popover placement
  offset?: number; // popover distance
  dir?: "rtl" | "ltr";
  mobileSheet?: boolean; // bottom sheet on mobile
  lightMode?: boolean; // lighter for bulky forms
}

// ------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------
export function SelectCombobox({
  options,
  value,
  onChange,
  classNameBtn,
  placeholder = "Select an Item",
  align = "start",
  searchable = false,
  avatar = false,
  //   multi = false,
  asyncSearch,
  //   virtualized = false,   // handle by react-window package
  ArrowIcon,
  loading = false,
  groupEnabled = false,
  placement = "bottom",
  offset = 8,
  dir,
  mobileSheet = false,
  lightMode = false,
}: SelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const { isMobileSize } = useMobileSize();

  const isAsync = typeof asyncSearch === "function";
  const isMulti = Array.isArray(value);
  
  const [asyncOptions, setAsyncOptions] = React.useState<Option[]>(options);

  const list = isAsync ? asyncOptions : options;

  const selectedItems = isMulti
    ? options.filter((o) => value.includes(o.value))
    : [];

  const selected = !isMulti ? options.find((o) => o.value === value) : null;

  // Handle async search
  async function handleSearch(query: string) {
    if (!isAsync) return;
    const res = await asyncSearch!(query);
    setAsyncOptions(res);
  }

  // Multi toggle
  function toggleMulti(v: string) {
    if (!isMulti) return;
    if (value.includes(v)) onChange(value.filter((i) => i !== v));
    else onChange([...value, v]);
  }

  // Grouping
  const groups: Record<string, Option[]> = {};
  if (groupEnabled) {
    list.forEach((opt) => {
      const g = opt.group || "سایر";
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    });
  }

  // Mobile bottom-sheet mode
  const useSheet = mobileSheet && isMobileSize;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "flex gap-1 w-full justify-between items-center border border-border cursor-pointer rounded-lg bg-primary-50 px-3 h-9 text-sm",
            "transition",

            lightMode && "h-7 text-xs px-2",
            classNameBtn,
          )}
          dir={dir}
        >
          <div className="flex flex-wrap items-center gap-1">
            {isMulti &&
              (selectedItems.length > 0 ? (
                selectedItems.map((s) => (
                  <span
                    key={s.value}
                    className={cn(
                      "flex items-center gap-1 rounded bg-primary-100 text-primary-700 px-2 py-0.5 text-xs",
                      lightMode && "text-[10px] px-1",
                    )}
                  >
                    {s.label}
                    <HiXMark
                      className="w-4 h-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMulti(s.value);
                      }}
                    />
                  </span>
                ))
              ) : (
                <span className="text-primary-300">{placeholder}</span>
              ))}
            <span className="whitespace-nowrap">
              {!isMulti &&
                (selected?.label ? (
                  <span>{selected?.label}</span>
                ) : (
                  <span className="text-primary-300">{placeholder}</span>
                ))}
            </span>
          </div>

          {ArrowIcon ? (
            <ArrowIcon
              className={cn(
                "w-4 h-4 transition-transform",
                open && "rotate-180",
              )}
            />
          ) : (
            <HiChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                open && "rotate-180",
              )}
            />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side={placement}
          align={align}
          sideOffset={offset}
          className={cn(
            "z-999 min-w-(--radix-popover-trigger-width) rounded-lg border border-border bg-primary-50 shadow-lg",
            "animate-in fade-in zoom-in-95",

            useSheet &&
              "fixed bottom-0 left-0 right-0 w-full rounded-t-2xl p-4 pb-6 h-[60vh] z-999999 animate-slide-up",
          )}
        >
          {/* SKELETON LOADING */}
          {loading && (
            <div className="space-y-2 p-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && (
            <Command className="w-full">
              {searchable && (
                <Command.Input
                  placeholder={"Search..."}
                  onValueChange={(q) => {
                    if (isAsync) handleSearch(q);
                  }}
                  className={cn(
                    "h-10 w-full bg-primary-100 px-3 text-sm outline-none",
                    lightMode && "h-9 text-xs px-2",
                  )}
                />
              )}

              <Command.List
                className={cn(
                  "max-h-60 overflow-y-auto p-1",
                  useSheet && "h-[50vh]",
                )}
              >
                <Command.Empty
                  className={cn(
                    "p-3 text-sm text-diactive text-center",
                    lightMode && "text-xs px-2",
                  )}
                >
                  {"No items found"}
                </Command.Empty>

                {/* GROUPED */}
                {groupEnabled
                  ? Object.keys(groups).map((group) => (
                      <div key={group}>
                        <div className="text-xs opacity-60 px-3 py-1">
                          {group}
                        </div>

                        {groups[group].map((opt, inx) => {
                          const isSelected = isMulti
                            ? value.includes(opt.value)
                            : value === opt.value;

                          return (
                            <Command.Item
                              key={`${opt.value}-${inx}`}
                              value={opt.label}
                              onSelect={() => {
                                if (isMulti) toggleMulti(opt.value);
                                else onChange(opt.value);
                                setOpen(false);
                              }}
                              className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-sm cursor-pointer hover:bg-primary-50",
                                lightMode && "py-1 text-xs",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {avatar &&
                                  (opt.avatar ? (
                                    <img
                                      src={opt.avatar}
                                      className="h-6 w-6 rounded-full"
                                    />
                                  ) : (
                                    <HiUserCircle className="h-6 w-6 opacity-70" />
                                  ))}

                                {opt.label}
                              </div>

                              {isSelected && (
                                <HiCheckBadge className="w-4 h-4 text-primary-500" />
                              )}
                            </Command.Item>
                          );
                        })}
                      </div>
                    ))
                  : list.map((opt) => {
                      const isSelected = isMulti
                        ? value.includes(opt.value)
                        : value === opt.value;

                      return (
                        <Command.Item
                          key={opt.value}
                          value={opt.label}
                          onSelect={() => {
                            if (isMulti) toggleMulti(opt.value);
                            else onChange(opt.value);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex items-center justify-between px-3 py-1 rounded-md cursor-pointer hover:bg-primary-200 text-sm md:text-base",
                            lightMode && "py-1 text-xs md:text-sm",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {avatar &&
                              (opt.avatar ? (
                                <img
                                  src={opt.avatar}
                                  className="h-6 w-6 rounded-full"
                                />
                              ) : (
                                <HiUserCircle className="h-6 w-6 opacity-70" />
                              ))}

                            {opt.label}
                          </div>

                          {isSelected && (
                            <HiCheckBadge className="w-4 h-4 text-primary-500" />
                          )}
                        </Command.Item>
                      );
                    })}
              </Command.List>
            </Command>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
