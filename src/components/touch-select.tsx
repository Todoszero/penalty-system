"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type TouchSelectOption = {
  id: string;
  label: string;
};

type TouchSelectProps = {
  value: string;
  options: TouchSelectOption[];
  loading?: boolean;
  placeholder?: string;
  loadingLabel?: string;
  emptyLabel?: string;
  onChange: (value: string) => void;
};

export function TouchSelect({
  value,
  options,
  loading = false,
  placeholder = "Επιλέξτε…",
  loadingLabel = "Φόρτωση…",
  emptyLabel = "Δεν υπάρχουν επιλογές.",
  onChange,
}: TouchSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-left text-base outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          !value && "text-muted-foreground"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={loading}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate">
          {loading ? loadingLabel : value || placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-60" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full touch-pan-y overflow-y-auto overscroll-contain rounded-lg border border-[color:var(--sea-line)] bg-white py-1 shadow-md"
        >
          {options.length === 0 ? (
            <li className="px-3 py-3 text-sm text-[color:var(--sea-muted)]">
              {emptyLabel}
            </li>
          ) : (
            options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === option.label}
                  className={cn(
                    "flex min-h-12 w-full items-center px-3 py-3 text-left text-base",
                    "active:bg-[color:var(--sea-mist)] hover:bg-[color:var(--sea-mist)]",
                    value === option.label &&
                      "bg-[color:var(--sea-mist)] font-medium"
                  )}
                  onClick={() => {
                    onChange(option.label);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
