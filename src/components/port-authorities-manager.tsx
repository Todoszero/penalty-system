"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Anchor, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PortAuthority } from "@/lib/types";

export function PortAuthoritiesManager() {
  const [items, setItems] = useState<PortAuthority[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/port-authorities", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία φόρτωσης λιμενικών αρχών.");
        setItems([]);
      } else {
        setItems(
          Array.isArray(data.portAuthorities) ? data.portAuthorities : []
        );
      }
    } catch {
      setError("Αποτυχία σύνδεσης με τον διακομιστή.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/port-authorities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία καταχώρησης.");
        return;
      }
      setName("");
      setItems((prev) =>
        [...prev, data.portAuthority as PortAuthority].sort((a, b) =>
          a.name.localeCompare(b.name, "el", { sensitivity: "base" })
        )
      );
    });
  }

  function removeItem(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/port-authorities/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία διαγραφής.");
        return;
      }
      setItems((prev) => prev.filter((o) => o.id !== id));
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <form
        onSubmit={addItem}
        className="rounded-2xl border border-[color:var(--sea-line)] bg-white/90 p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <Anchor className="size-4 text-[color:var(--sea-foam-deep)]" />
          <h2 className="font-heading text-lg text-[color:var(--sea-ink)]">
            Καταχώριση λιμενικής αρχής
          </h2>
        </div>
        <p className="mb-4 text-sm text-[color:var(--sea-muted)]">
          Προσθέστε ή αφαιρέστε λιμενικές αρχές. Εμφανίζονται στη φόρμα νέας
          κλήσης ως λίστα επιλογής.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="port-authority-name">Όνομα αρχής</Label>
          <Input
            id="port-authority-name"
            className="h-11"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="π.χ. Λέσβου, Χίου, Μυτιλήνης"
            autoComplete="off"
          />
        </div>
        <Button
          type="submit"
          className="mt-4 h-10 bg-[color:var(--sea-ink)] text-white hover:bg-[color:var(--sea-ink)]/90"
          disabled={pending || !name.trim()}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Προσθήκη
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[color:var(--sea-line)] bg-white/90 shadow-sm">
        <div className="border-b border-[color:var(--sea-line)] px-4 py-3">
          <p className="text-sm text-[color:var(--sea-muted)]">
            {loading ? "Φόρτωση…" : `${items.length} λιμενικές αρχές`}
          </p>
        </div>
        {error && (
          <p className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-[color:var(--sea-muted)]" />
          </div>
        ) : items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[color:var(--sea-muted)]">
            Δεν υπάρχουν καταχωρημένες λιμενικές αρχές.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--sea-line)]">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="font-medium text-[color:var(--sea-ink)]">
                  {item.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 text-red-700 hover:bg-red-50 hover:text-red-800"
                  disabled={pending}
                  onClick={() => removeItem(item.id)}
                  aria-label={`Διαγραφή ${item.name}`}
                >
                  <Trash2 className="size-4" />
                  Αφαίρεση
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
