/**
 * TimeFilter — nowoczesny filtr z Tabs zamiast Select.
 */

import type { TimeFilter as TimeFilterType } from "@/types";

interface TimeFilterProps {
  value: TimeFilterType;
  onChange: (value: TimeFilterType) => void;
}

const options: { value: TimeFilterType; label: string }[] = [
  { value: "12m", label: "12M" },
  { value: "3y", label: "3 lata" },
  { value: "all", label: "Wszystko" },
];

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-1 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
            ${value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
