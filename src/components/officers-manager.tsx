"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Loader2, Plus, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Officer } from "@/lib/types";

export function OfficersManager() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/officers", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία φόρτωσης λιμενικών.");
        setOfficers([]);
      } else {
        setOfficers(Array.isArray(data.officers) ? data.officers : []);
      }
    } catch {
      setError("Αποτυχία σύνδεσης με τον διακομιστή.");
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function addOfficer(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία καταχώρησης.");
        return;
      }
      setFullName("");
      setOfficers((prev) =>
        [...prev, data.officer as Officer].sort((a, b) =>
          a.fullName.localeCompare(b.fullName, "el", { sensitivity: "base" })
        )
      );
    });
  }

  function removeOfficer(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/officers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία διαγραφής.");
        return;
      }
      setOfficers((prev) => prev.filter((o) => o.id !== id));
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <form
        onSubmit={addOfficer}
        className="rounded-2xl border border-[color:var(--sea-line)] bg-white/90 p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="size-4 text-[color:var(--sea-foam-deep)]" />
          <h2 className="font-heading text-lg text-[color:var(--sea-ink)]">
            Καταχώριση λιμενικού
          </h2>
        </div>
        <p className="mb-4 text-sm text-[color:var(--sea-muted)]">
          Προσθέστε ή αφαιρέστε ονοματεπώνυμα. Εμφανίζονται στη φόρμα νέας
          κλήσης ως λίστα επιλογής.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="officer-fullname">Ονοματεπώνυμο</Label>
          <Input
            id="officer-fullname"
            className="h-11"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="π.χ. Γεώργιος Παπαδόπουλος"
            autoComplete="off"
          />
        </div>
        <Button
          type="submit"
          className="mt-4 h-10 bg-[color:var(--sea-ink)] text-white hover:bg-[color:var(--sea-ink)]/90"
          disabled={pending || !fullName.trim()}
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
            {loading ? "Φόρτωση…" : `${officers.length} λιμενικοί`}
          </p>
        </div>
        {error && (
          <p className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-[color:var(--sea-muted)]" />
          </div>
        ) : officers.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[color:var(--sea-muted)]">
            Δεν υπάρχουν καταχωρημένοι λιμενικοί.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--sea-line)]">
            {officers.map((officer) => (
              <li
                key={officer.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="font-medium text-[color:var(--sea-ink)]">
                  {officer.fullName}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 text-red-700 hover:bg-red-50 hover:text-red-800"
                  disabled={pending}
                  onClick={() => removeOfficer(officer.id)}
                  aria-label={`Διαγραφή ${officer.fullName}`}
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
