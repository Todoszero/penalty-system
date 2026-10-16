"use client";

import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type PrivacyPolicyModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PrivacyPolicyModal({ open, onClose }: PrivacyPolicyModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[color:var(--sea-line)] bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[color:var(--sea-line)] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <Shield className="size-4 shrink-0 text-[color:var(--sea-foam-deep)]" />
            <h2
              id="privacy-title"
              className="font-heading text-base text-[color:var(--sea-ink)] sm:text-lg"
            >
              Πολιτική προστασίας δεδομένων
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 shrink-0 p-0"
            onClick={onClose}
            aria-label="Κλείσιμο"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-3 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-[color:var(--sea-muted)] sm:px-5">
          <p>
            Η παρούσα σελίδα εξόφλησης κλήσεων χρησιμοποιείται για την αναζήτηση
            και πληρωμή διοικητικών προστίμων της Λιμενικής Αρχής μέσω του
            συστήματος Penalty System.
          </p>

          <div>
            <p className="mb-1 font-medium text-[color:var(--sea-ink)]">
              Τι δεδομένα επεξεργαζόμαστε
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Τον <strong>αριθμό κυκλοφορίας</strong> που εισάγετε για
                αναζήτηση.
              </li>
              <li>
                Στοιχεία της ανεξόφλητης κλήσης που εμφανίζονται (αριθμός
                έκθεσης, τόπος/χρόνος παράβασης, παραβάσεις, ποσό προστίμου,
                κατάσταση).
              </li>
              <li>
                Σε περίπτωση πληρωμής: αναφορά πληρωμής και ειδοποίηση προς τη
                διοίκηση για επιβεβαίωση εξόφλησης.
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-1 font-medium text-[color:var(--sea-ink)]">
              Σκοπός
            </p>
            <p>
              Τα δεδομένα χρησιμοποιούνται αποκλειστικά για την εύρεση της
              κλήσης σας, την εξόφληση του προστίμου και την ενημέρωση της
              αρμόδιας υπηρεσίας. Δεν χρησιμοποιούνται για διαφήμιση ή άλλη
              εμπορική προώθηση.
            </p>
          </div>

          <div>
            <p className="mb-1 font-medium text-[color:var(--sea-ink)]">
              Αποθήκευση
            </p>
            <p>
              Τα στοιχεία της κλήσης τηρούνται στο σύστημα της υπηρεσίας για όσο
              απαιτείται για τη διαχείριση και εξόφληση της υπόθεσης. Ο αριθμός
              πινακίδας που πληκτρολογείτε χρησιμοποιείται μόνο για την
              αναζήτηση στη συγκεκριμένη περίοδο σύνδεσης.
            </p>
          </div>

          <div>
            <p className="mb-1 font-medium text-[color:var(--sea-ink)]">
              Δικαιώματα
            </p>
            <p>
              Μπορείτε να απευθυνθείτε στη Λιμενική Αρχή για ενημέρωση,
              διόρθωση ή διευκρινίσεις σχετικά με τα δεδομένα της κλήσης σας,
              σύμφωνα με την ισχύουσα νομοθεσία προστασίας προσωπικών δεδομένων.
            </p>
          </div>

          <p className="text-xs">
            Η παρούσα αποτελεί απλή ενημέρωση για τη λειτουργία της σελίδας
            εξόφλησης. Τελευταία ενημέρωση: 2026.
          </p>
        </div>

        <div className="border-t border-[color:var(--sea-line)] px-4 py-3 sm:px-5">
          <Button
            type="button"
            className="h-10 w-full bg-[color:var(--sea-ink)] text-white hover:bg-[color:var(--sea-ink)]/90"
            onClick={onClose}
          >
            Κατάλαβα
          </Button>
        </div>
      </div>
    </div>
  );
}
