"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  emptyMessage = "No items found.",
  className,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((v) => v !== value));
  };

  const selectedLabels = selected
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal h-auto min-h-9",
            !selected.length && "text-muted-foreground",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selected.length === 0 ? (
              <span>{placeholder}</span>
            ) : (
              selectedLabels.map((label, i) => (
                <Badge
                  key={selected[i]}
                  variant="secondary"
                  className="text-xs font-normal gap-1"
                >
                  {label}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => handleRemove(selected[i], e)}
                  />
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command className="w-full">
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleToggle(option.value)}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/40",
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
