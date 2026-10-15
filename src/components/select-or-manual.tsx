"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MANUAL_ENTRY_LABEL } from "@/lib/vehicle-options";
import { cn } from "@/lib/utils";

type SelectOrManualProps = {
  value: string;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  manualPlaceholder?: string;
  /** Αν δοθεί, εμφανίζει μικρή κουκίδα χρώματος δίπλα σε κάθε επιλογή. */
  swatches?: Record<string, string>;
  onChange: (value: string) => void;
};

function ColorDot({ color }: { color: string }) {
  const light = ["#F8FAFC", "#C0C0C0", "#D4B896", "#F4C430", "#D4AF37"].includes(
    color.toUpperCase()
  );
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-3.5 shrink-0 rounded-full",
        light ? "ring-1 ring-black/20" : "ring-1 ring-black/10"
      )}
      style={{ backgroundColor: color }}
    />
  );
}

/** Lowercase + χωρίς τόνους, για αναζήτηση χωρίς ανάγκη διαλυτικών. */
function normalize(text: string) {
  return text
    .trim()
    .toLocaleLowerCase("el")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function rankMatch(label: string, query: string): number {
  if (!query) return 2;
  const nLabel = normalize(label);
  const nQuery = normalize(query);
  if (nLabel.startsWith(nQuery)) return 0;
  if (nLabel.includes(nQuery)) return 1;
  return -1;
}

export function SelectOrManual({
  value,
  options,
  placeholder = "Επιλέξτε…",
  searchPlaceholder = "Αναζήτηση…",
  manualPlaceholder = "Πληκτρολογήστε…",
  swatches,
  onChange,
}: SelectOrManualProps) {
  const inList = options.includes(value);
  const [manual, setManual] = useState(() => Boolean(value) && !inList);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && !options.includes(value)) {
      setManual(true);
    }
  }, [value, options]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const ranked = options
      .map((label) => ({ label, rank: rankMatch(label, query) }))
      .filter((item) => item.rank >= 0)
      .sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        return a.label.localeCompare(b.label, "el", { sensitivity: "base" });
      })
      .map((item) => item.label);
    return ranked;
  }, [options, query]);

  const displayValue = manual
    ? value
      ? `${MANUAL_ENTRY_LABEL}: ${value}`
      : MANUAL_ENTRY_LABEL
    : value;

  return (
    <div className="relative space-y-2" ref={rootRef}>
      <button
        type="button"
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-left text-base outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          !displayValue && "text-muted-foreground"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {!manual && value && swatches?.[value] ? (
            <ColorDot color={swatches[value]} />
          ) : null}
          <span className="truncate">{displayValue || placeholder}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-60" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[color:var(--sea-line)] bg-white shadow-md">
          <div className="sticky top-0 border-b border-[color:var(--sea-line)] bg-white p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[color:var(--sea-muted)]" />
              <Input
                ref={searchRef}
                className="h-11 pl-9 text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>
          <ul
            role="listbox"
            className="max-h-56 touch-pan-y overflow-y-auto overscroll-contain py-1"
          >
            <li>
              <button
                type="button"
                role="option"
                aria-selected={manual}
                className={cn(
                  "flex min-h-12 w-full items-center px-3 py-3 text-left text-base",
                  "active:bg-[color:var(--sea-mist)] hover:bg-[color:var(--sea-mist)]",
                  manual && "bg-[color:var(--sea-mist)] font-medium"
                )}
                onClick={() => {
                  setManual(true);
                  onChange("");
                  setOpen(false);
                }}
              >
                {MANUAL_ENTRY_LABEL}
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-[color:var(--sea-muted)]">
                Κανένα αποτέλεσμα για «{query.trim()}»
              </li>
            ) : (
              filtered.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!manual && value === label}
                    className={cn(
                      "flex min-h-12 w-full items-center gap-2.5 px-3 py-3 text-left text-base",
                      "active:bg-[color:var(--sea-mist)] hover:bg-[color:var(--sea-mist)]",
                      !manual &&
                        value === label &&
                        "bg-[color:var(--sea-mist)] font-medium"
                    )}
                    onClick={() => {
                      setManual(false);
                      onChange(label);
                      setOpen(false);
                    }}
                  >
                    {swatches?.[label] ? (
                      <ColorDot color={swatches[label]} />
                    ) : null}
                    {label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {manual && (
        <Input
          className="h-12 text-base"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={manualPlaceholder}
          autoFocus
        />
      )}
    </div>
  );
}
