"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownProps } from "react-day-picker";

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  classNameTrigger,
  classNameContent,
}: {
  value: Date;
  placeholder?: string;
  onChange: (val: Date) => void;
  classNameTrigger?: string;
  classNameContent?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "w-full border border-border rounded-lg flex justify-between gap-2 items-center py-1 px-2 cursor-pointer",
          classNameTrigger,
        )}
      >
        {value
          ? value.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : placeholder}{" "}
        <CalendarDays className="text-primary-700" size={16} />
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-full p-0", classNameContent)}
        align="start"
      >
        <Calendar
          className="w-full"
          mode="single"
          selected={value}
          showOutsideDays={false}
          defaultMonth={value}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(date ?? new Date());
            setOpen(false);
          }}
          required={false}
          components={{
            Dropdown: ({ value, onChange, options }: DropdownProps) => {
              return (
                <Select
                  value={value?.toString()}
                  onValueChange={(val) => {
                    if (!onChange) return;

                    // fake event for onChange --> date-picker
                    const event = {
                      target: { value: val },
                    } as React.ChangeEvent<HTMLSelectElement>;

                    onChange(event);
                  }}
                >
                  <SelectTrigger className="relative border-none hover:bg-primary-200 rounded-lg">
                    {" "}
                    <SelectValue/>{" "}
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="h-32 overflow-auto"
                  >
                    {options?.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            },
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
