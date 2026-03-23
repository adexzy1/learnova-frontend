"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0"),
);

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

function TimePicker({
  value,
  onChange,
  className,
  disabled,
  placeholder = "Pick time",
}: TimePickerProps) {
  const [hour, minute] = React.useMemo(() => {
    if (!value) return ["", ""];
    const parts = value.split(":");
    return [parts[0] ?? "", parts[1] ?? ""];
  }, [value]);

  const handleHourChange = (h: string) => {
    const m = minute || "00";
    onChange?.(`${h}:${m}`);
  };

  const handleMinuteChange = (m: string) => {
    const h = hour || "08";
    onChange?.(`${h}:${m}`);
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={hour} onValueChange={handleHourChange} disabled={disabled}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder={placeholder ? "HH" : undefined} />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground font-medium">:</span>
      <Select
        value={minute}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { TimePicker };
export type { TimePickerProps };
