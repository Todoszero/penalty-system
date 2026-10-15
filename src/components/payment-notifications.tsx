"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatEuro } from "@/lib/format";
import type { Citation, PaymentNotification } from "@/lib/types";

type PaymentNotificationsProps = {
  onMarkedPaid?: (citation: Citation) => void;
};

export function PaymentNotifications({
  onMarkedPaid,
}: PaymentNotificationsProps) {
  const [items, setItems] = useState<PaymentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/payments/notifications?pending=true", {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setItems(Array.isArray(data.notifications) ? data.notifications : []);
        setError(null);
      }
    } catch {
      setError("Αποτυχία φόρτωσης ειδοποιήσεων πληρωμής.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function markPaid(notificationId: string) {
    setActingId(notificationId);
    setError(null);
    try {
      const res = await fetch("/api/payments/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId,
          action: "mark_paid",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία επιβεβαίωσης.");
        return;
      }
      setItems((prev) => prev.filter((n) => n.id !== notificationId));
      if (data.citation && onMarkedPaid) {
        onMarkedPaid(data.citation as Citation);
      }
    } catch {
      setError("Αποτυχία σύνδεσης με τον διακομιστή.");
    } finally {
      setActingId(null);
    }
  }

  if (loading && items.length === 0) {
    return null;
  }

  if (items.length === 0 && !error) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="size-4 text-amber-700" />
        <h2 className="font-heading text-lg text-amber-950">
          Ειδοποιήσεις πληρωμής ({items.length})
        </h2>
      </div>
      <p className="mb-4 text-sm text-amber-900/80">
        Ολοκληρώθηκε πληρωμή από πολίτη. Επιβεβαιώστε την εξόφληση.
      </p>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <ul className="space-y-3">
        {items.map((n) => (
          <li
            key={n.id}
            className="flex flex-col gap-3 rounded-xl border border-amber-200/80 bg-white/90 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 text-sm">
              <p className="font-heading text-base text-[color:var(--sea-ink)]">
                Έκθεση No {n.citationNumber} ·{" "}
                <span className="font-mono">{n.plateNumber}</span>
              </p>
              <p className="mt-0.5 text-[color:var(--sea-muted)]">
                {formatEuro(n.fineAmount)} · {n.fullName} · {n.portAuthority}
              </p>
              <p className="text-[color:var(--sea-muted)]">
                Παράβαση {formatDateTime(n.occurredAt)} · {n.location}
              </p>
              <p className="text-xs text-[color:var(--sea-muted)]">
                Λιμενικός: {n.officerName || "—"} · ref{" "}
                {n.providerRef || "—"} · δηλώθηκε{" "}
                {formatDateTime(n.createdAt)}
              </p>
            </div>
            <Button
              type="button"
              className="h-11 shrink-0 bg-[color:var(--sea-ink)] text-white hover:bg-[color:var(--sea-ink)]/90"
              disabled={actingId === n.id}
              onClick={() => void markPaid(n.id)}
            >
              {actingId === n.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Εξοφλήθηκε
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
