"use client";

import { useState, useTransition } from "react";
import { CreditCard, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime, formatEuro } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/status";
import type { CitationStatus } from "@/lib/types";

type UnpaidCitation = {
  id: string;
  number: string;
  plateNumber: string;
  fineAmount: number;
  occurredAt: string;
  location: string;
  portAuthority: string;
  status: CitationStatus;
  fullName: string;
  violations: string[];
};

export function PaymentSearch() {
  const [plate, setPlate] = useState("");
  const [results, setResults] = useState<UnpaidCitation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setConfirmId(null);
    const q = plate.trim();
    if (!q) {
      setError("Συμπληρώστε τον αριθμό πινακίδας.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/payments/unpaid?plate=${encodeURIComponent(q)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Αποτυχία αναζήτησης.");
          setResults(null);
          return;
        }
        setResults(Array.isArray(data.citations) ? data.citations : []);
      } catch {
        setError("Αποτυχία σύνδεσης με τον διακομιστή.");
        setResults(null);
      }
    });
  }

  async function completePayment(citationId: string) {
    setPayingId(citationId);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/payments/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία πληρωμής.");
        return;
      }
      setConfirmId(null);
      if (data.alreadyNotified) {
        setInfo(
          "Η πληρωμή έχει ήδη δηλωθεί. Αναμένεται επιβεβαίωση από τη διοίκηση."
        );
      } else {
        setInfo(
          "Η πληρωμή καταχωρήθηκε (προσομοίωση EveryPay). Ειδοποιήθηκε το Admin για επιβεβαίωση εξόφλησης."
        );
      }
      // refresh list — still unpaid until admin confirms
      const plateQ = plate.trim();
      const listRes = await fetch(
        `/api/payments/unpaid?plate=${encodeURIComponent(plateQ)}`,
        { cache: "no-store" }
      );
      const listData = await listRes.json();
      if (listRes.ok) {
        setResults(Array.isArray(listData.citations) ? listData.citations : []);
      }
    } catch {
      setError("Αποτυχία σύνδεσης με τον διακομιστή.");
    } finally {
      setPayingId(null);
    }
  }

  const confirmItem = results?.find((c) => c.id === confirmId) ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <form
        onSubmit={search}
        className="rounded-2xl border border-[color:var(--sea-line)] bg-white/90 p-5 shadow-sm sm:p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <Search className="size-4 text-[color:var(--sea-foam-deep)]" />
          <h2 className="font-heading text-lg text-[color:var(--sea-ink)]">
            Αναζήτηση ανεξόφλητης κλήσης
          </h2>
        </div>
        <p className="mb-4 text-sm text-[color:var(--sea-muted)]">
          Εισάγετε τον αριθμό κυκλοφορίας του οχήματος. Θα εμφανιστούν μόνο
          ανεξόφλητες κλήσεις.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="pay-plate">Αριθμός πινακίδας</Label>
          <Input
            id="pay-plate"
            className="h-12 font-mono text-base uppercase tracking-wide"
            placeholder="π.χ. ΑΒΓ 1234"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            autoComplete="off"
          />
        </div>
        <Button
          type="submit"
          className="mt-4 h-11 bg-[color:var(--sea-ink)] text-white hover:bg-[color:var(--sea-ink)]/90"
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          Αναζήτηση
        </Button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {info && (
        <p className="rounded-lg bg-[color:var(--sea-mist)] px-3 py-2 text-sm text-[color:var(--sea-ink)]">
          {info}
        </p>
      )}

      {results && (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--sea-line)] bg-white/90 shadow-sm">
          <div className="border-b border-[color:var(--sea-line)] px-4 py-3">
            <p className="text-sm text-[color:var(--sea-muted)]">
              {results.length === 0
                ? "Δεν βρέθηκαν ανεξόφλητες κλήσεις για αυτή την πινακίδα."
                : `${results.length} ανεξόφλητη${results.length === 1 ? "" : "ες"} κλήση${results.length === 1 ? "" : "εις"}`}
            </p>
          </div>
          <ul className="divide-y divide-[color:var(--sea-line)]">
            {results.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-heading text-base text-[color:var(--sea-ink)]">
                    Έκθεση No {c.number} ·{" "}
                    <span className="font-mono">{c.plateNumber}</span>
                  </p>
                  <p className="text-sm text-[color:var(--sea-muted)]">
                    {formatDateTime(c.occurredAt)} · {c.location || "—"}
                  </p>
                  {c.violations?.length ? (
                    <ul className="space-y-0.5 text-sm text-[color:var(--sea-ink)]">
                      {c.violations.map((v) => (
                        <li key={v}>• {v}</li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="text-sm text-[color:var(--sea-muted)]">
                    {c.portAuthority} · {STATUS_LABELS[c.status]}
                  </p>
                  <p className="text-base font-semibold text-[color:var(--sea-ink)]">
                    {formatEuro(c.fineAmount)}
                  </p>
                </div>
                <Button
                  type="button"
                  className="h-11 shrink-0 bg-[color:var(--sea-foam-deep)] text-white hover:bg-[color:var(--sea-foam-deep)]/90"
                  onClick={() => setConfirmId(c.id)}
                  disabled={payingId === c.id}
                >
                  <CreditCard className="size-4" />
                  Πληρωμή
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {confirmItem && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-[color:var(--sea-line)] bg-white p-5 shadow-xl sm:p-6"
          >
            <h3 className="font-heading text-lg text-[color:var(--sea-ink)]">
              Πληρωμή μέσω EveryPay
            </h3>
            <p className="mt-2 text-sm text-[color:var(--sea-muted)]">
              Προσομοίωση πληρωμής (η σύνδεση με EveryPay θα προστεθεί
              αργότερα). Θα ενημερωθεί το Admin για την κλήση{" "}
              <strong>No {confirmItem.number}</strong> —{" "}
              {formatEuro(confirmItem.fineAmount)}.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => setConfirmId(null)}
                disabled={payingId === confirmItem.id}
              >
                Ακύρωση
              </Button>
              <Button
                type="button"
                className="h-11 bg-[color:var(--sea-foam-deep)] text-white hover:bg-[color:var(--sea-foam-deep)]/90"
                disabled={payingId === confirmItem.id}
                onClick={() => void completePayment(confirmItem.id)}
              >
                {payingId === confirmItem.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CreditCard className="size-4" />
                )}
                Ολοκλήρωση πληρωμής
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
