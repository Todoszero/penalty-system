import type { CitationStatus, ObjectionOutcome } from "./types";

export const STATUS_LABELS: Record<CitationStatus, string> = {
  issued: "Εκδόθηκε",
  awaiting_objection: "Αναμονή αντιρρήσεων",
  finalized: "Οριστικοποιήθηκε",
  paid: "Εξοφλήθηκε",
  cancelled: "Ακυρώθηκε",
};

export const OBJECTION_LABELS: Record<ObjectionOutcome, string> = {
  pending: "Εκκρεμεί",
  no_appearance: "Χωρίς εμφάνιση",
  groundless: "Αβάσιμες",
  well_founded: "Βάσιμες",
};

export function statusTone(
  status: CitationStatus
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "paid":
      return "secondary";
    case "finalized":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
}
