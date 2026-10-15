"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  CarFront,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatEuro } from "@/lib/format";
import { OBJECTION_LABELS, STATUS_LABELS, statusTone } from "@/lib/status";
import type { Citation, ObjectionOutcome } from "@/lib/types";
import { violationLabel } from "@/lib/violations";
import { cn } from "@/lib/utils";

export function AdminPanel() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [plate, setPlate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const selected = citations.find((c) => c.id === selectedId) ?? null;

  const load = useCallback(async (filters?: {
    plate?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const plateQ = filters?.plate ?? plate;
    const fromQ = filters?.dateFrom ?? dateFrom;
    const toQ = filters?.dateTo ?? dateTo;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (plateQ.trim()) params.set("plate", plateQ.trim());
      if (fromQ) params.set("dateFrom", fromQ);
      if (toQ) params.set("dateTo", toQ);
      const res = await fetch(`/api/citations?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία φόρτωσης.");
        setCitations([]);
      } else {
        setCitations(Array.isArray(data.citations) ? data.citations : []);
      }
    } catch {
      setError("Αποτυχία σύνδεσης με τον διακομιστή.");
      setCitations([]);
    } finally {
      setLoading(false);
    }
  }, [plate, dateFrom, dateTo]);

  useEffect(() => {
    void load({ plate: "", dateFrom: "", dateTo: "" });
    // initial load only — search runs via form submit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    void load();
  }

  function finalize(outcome: ObjectionOutcome, suspensionDays: number | null) {
    if (!selected) return;
    startTransition(async () => {
      const res = await fetch(`/api/citations/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectionOutcome: outcome,
          status: outcome === "well_founded" ? "cancelled" : "finalized",
          suspensionDays,
          commanderDecisionAt: new Date().toISOString(),
          commanderNotes:
            selected.commanderNotes ||
            (outcome === "no_appearance"
              ? "Παρήλθε η τρίημερη προθεσμία χωρίς εμφάνιση."
              : ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία οριστικοποίησης.");
        return;
      }
      setCitations((prev) =>
        prev.map((c) => (c.id === data.citation.id ? data.citation : c))
      );
    });
  }

  function markPaid() {
    if (!selected) return;
    startTransition(async () => {
      const res = await fetch(`/api/citations/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          paidAt: new Date().toISOString(),
          paymentReference: `${selected.number}-${selected.plateNumber.replace(/\s+/g, "")}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία σήμανσης πληρωμής.");
        return;
      }
      setCitations((prev) =>
        prev.map((c) => (c.id === data.citation.id ? data.citation : c))
      );
    });
  }

  async function saveNotes(notes: string) {
    if (!selected) return;
    const res = await fetch(`/api/citations/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commanderNotes: notes }),
    });
    const data = await res.json();
    if (res.ok) {
      setCitations((prev) =>
        prev.map((c) => (c.id === data.citation.id ? data.citation : c))
      );
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <form
          onSubmit={applyFilters}
          className="rounded-2xl border border-[color:var(--sea-line)] bg-white/90 p-4 shadow-sm sm:p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Search className="size-4 text-[color:var(--sea-foam-deep)]" />
            <h2 className="font-heading text-lg text-[color:var(--sea-ink)]">
              Εύρεση κλήσεων
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Αριθμός πινακίδας</Label>
              <Input
                className="h-11 font-mono uppercase"
                placeholder="π.χ. ΧΙΟ 4878"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Από ημερομηνία</Label>
              <Input
                className="h-11"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Έως ημερομηνία</Label>
              <Input
                className="h-11"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="submit"
              className="h-10 bg-[color:var(--sea-ink)] text-white hover:bg-[color:var(--sea-ink)]/90"
            >
              Αναζήτηση
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => {
                setPlate("");
                setDateFrom("");
                setDateTo("");
                void load({ plate: "", dateFrom: "", dateTo: "" });
              }}
            >
              Καθαρισμός
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10"
              onClick={() => void load()}
            >
              <RefreshCw className="size-4" />
              Ανανέωση
            </Button>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-[color:var(--sea-line)] bg-white/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-[color:var(--sea-line)] px-4 py-3">
            <p className="text-sm text-[color:var(--sea-muted)]">
              {loading ? "Φόρτωση…" : `${citations.length} κλήσεις`}
            </p>
          </div>
          {error && (
            <p className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Ημερομηνία</TableHead>
                  <TableHead>Πινακίδα</TableHead>
                  <TableHead>Πρόστιμο</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-[color:var(--sea-muted)]" />
                    </TableCell>
                  </TableRow>
                ) : citations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-[color:var(--sea-muted)]"
                    >
                      Δεν βρέθηκαν κλήσεις με τα κριτήρια αυτά.
                    </TableCell>
                  </TableRow>
                ) : (
                  citations.map((c) => (
                    <TableRow
                      key={c.id}
                      className={cn(
                        "cursor-pointer",
                        selectedId === c.id && "bg-[color:var(--sea-mist)]"
                      )}
                      onClick={() => setSelectedId(c.id)}
                    >
                      <TableCell className="font-mono">{c.number}</TableCell>
                      <TableCell>{formatDateTime(c.occurredAt)}</TableCell>
                      <TableCell className="font-mono font-semibold">
                        {c.plateNumber}
                      </TableCell>
                      <TableCell>{formatEuro(c.fineAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={statusTone(c.status)}>
                          {STATUS_LABELS[c.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-[color:var(--sea-line)] bg-white/90 p-5 shadow-sm lg:sticky lg:top-20 lg:self-start">
        {!selected ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center text-[color:var(--sea-muted)]">
            <CarFront className="mb-3 size-10 opacity-40" />
            <p className="text-sm">
              Επιλέξτε μια κλήση για λεπτομέρειες και πράξη διοικητή.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[color:var(--sea-muted)]">
                Έκθεση No {selected.number}
              </p>
              <h3 className="font-heading text-xl text-[color:var(--sea-ink)]">
                {selected.plateNumber}
              </h3>
              <p className="text-sm text-[color:var(--sea-muted)]">
                {selected.fullName || "Άγνωστος οδηγός"} · {selected.portAuthority}
              </p>
            </div>

            <div className="grid gap-2 rounded-xl bg-[color:var(--sea-mist)]/80 p-3 text-sm">
              <Detail
                icon={<CalendarDays className="size-3.5" />}
                label="Παράβαση"
                value={formatDateTime(selected.occurredAt)}
              />
              <Detail label="Τόπος" value={selected.location} />
              <Detail label="Πρόστιμο" value={formatEuro(selected.fineAmount)} />
              <Detail
                label="Αντιρρήσεις"
                value={OBJECTION_LABELS[selected.objectionOutcome]}
              />
              <Detail
                label="Κατάσχεση"
                value={
                  selected.seizedItems.length
                    ? selected.seizedItems
                        .map((s) =>
                          s === "license"
                            ? "Άδεια"
                            : s === "registration"
                              ? "Άδ. κυκλοφορίας"
                              : "Πινακίδες"
                        )
                        .join(", ")
                    : "—"
                }
              />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-[color:var(--sea-ink)]">
                Παραβάσεις
              </p>
              <ul className="space-y-1 text-sm text-[color:var(--sea-muted)]">
                {selected.violationIds.map((id) => (
                  <li key={id}>• {violationLabel(id)}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <Label>Σημειώσεις διοικητή</Label>
              <Textarea
                rows={3}
                defaultValue={selected.commanderNotes}
                key={selected.id + selected.updatedAt}
                onBlur={(e) => void saveNotes(e.target.value)}
              />
            </div>

            {selected.status === "awaiting_objection" && (
              <div className="space-y-2 border-t border-[color:var(--sea-line)] pt-4">
                <p className="text-sm font-medium text-[color:var(--sea-ink)]">
                  Πράξη επιβολής (ΣΤ)
                </p>
                <Button
                  className="h-10 w-full"
                  variant="outline"
                  disabled={pending}
                  onClick={() => finalize("no_appearance", null)}
                >
                  Παρήλθε τρίημερο χωρίς εμφάνιση
                </Button>
                <Button
                  className="h-10 w-full"
                  variant="outline"
                  disabled={pending}
                  onClick={() => finalize("groundless", 10)}
                >
                  Αντιρρήσεις αβάσιμες (+ αφαίρεση 10 ημ.)
                </Button>
                <Button
                  className="h-10 w-full bg-[color:var(--sea-foam-deep)] text-white hover:bg-[color:var(--sea-foam-deep)]/90"
                  disabled={pending}
                  onClick={() => finalize("well_founded", null)}
                >
                  Αντιρρήσεις βάσιμες — ακύρωση
                </Button>
              </div>
            )}

            {(selected.status === "finalized" ||
              selected.status === "awaiting_objection") && (
              <Button
                className="h-10 w-full bg-[color:var(--sea-ink)] text-white hover:bg-[color:var(--sea-ink)]/90"
                disabled={pending}
                onClick={markPaid}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Σήμανση ως εξοφλημένη"
                )}
              </Button>
            )}

            {selected.paidAt && (
              <p className="text-xs text-[color:var(--sea-muted)]">
                Πληρωμή {format(new Date(selected.paidAt), "dd/MM/yyyy HH:mm")} ·
                ref {selected.paymentReference}
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-[color:var(--sea-muted)]">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium text-[color:var(--sea-ink)]">
        {value}
      </span>
    </div>
  );
}
