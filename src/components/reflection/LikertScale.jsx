"use client";

import { cn } from "@/lib/utils";
import { LIKERT_OPTIONS } from "@/lib/constants";

export function LikertScale({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {LIKERT_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-2 rounded-full border border-input px-4 py-2 text-sm font-medium transition-colors",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full border-2",
                selected ? "border-primary" : "border-muted-foreground/40"
              )}
            >
              {selected && <span className="size-2 rounded-full bg-primary" />}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
