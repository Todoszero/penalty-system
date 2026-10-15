export interface ViolationOption {
  id: string;
  article: string;
  code?: string;
  label: string;
  group: "signs" | "parking";
}

/** Checklist από Έκθεση Βεβαίωσης Παράβασης Οχήματος — Ν. 5209/25 */
export const VIOLATION_OPTIONS: ViolationOption[] = [
  {
    id: "art7-p39",
    article: "Άρθρο 7 ΚΟΚ",
    code: "Ρ-39",
    label: "Απαγόρευση στάθμευσης",
    group: "signs",
  },
  {
    id: "art7-p40",
    article: "Άρθρο 7 ΚΟΚ",
    code: "Ρ-40",
    label: "Απαγόρευση στάσης και στάθμευσης",
    group: "signs",
  },
  {
    id: "art7-p43",
    article: "Άρθρο 7 ΚΟΚ",
    code: "Ρ-43",
    label: "Χρονικά περιορισμένη στάθμευση",
    group: "signs",
  },
  {
    id: "art7-p69",
    article: "Άρθρο 7 ΚΟΚ",
    code: "Ρ-69",
    label: "Ελεγχόμενη / επί πληρωμή στάθμευση",
    group: "signs",
  },
  {
    id: "art38-crosswalk",
    article: "Άρθρο 38 ΚΟΚ",
    label: "Σε διάβαση πεζών ή σε απόσταση μικρότερη των 5 μ.",
    group: "parking",
  },
  {
    id: "art38-stop-light",
    article: "Άρθρο 38 ΚΟΚ",
    label: "Κοντά σε σήμα STOP ή φωτεινό σηματοδότη",
    group: "parking",
  },
  {
    id: "art38-bus-stop",
    article: "Άρθρο 38 ΚΟΚ",
    label: "Σε στάση μέσων μαζικής μεταφοράς",
    group: "parking",
  },
  {
    id: "art38-double",
    article: "Άρθρο 38 ΚΟΚ",
    label: "Διπλοπαρκάρισμα",
    group: "parking",
  },
  {
    id: "art38-sidewalk",
    article: "Άρθρο 38 ΚΟΚ",
    label: "Σε πεζοδρόμιο, πλατεία ή ποδηλατόδρομο",
    group: "parking",
  },
  {
    id: "art38-curve",
    article: "Άρθρο 38 ΚΟΚ",
    label: "Σε τυφλή στροφή / μειωμένη ορατότητα",
    group: "parking",
  },
  {
    id: "art38-amea",
    article: "Άρθρο 38 ΚΟΚ",
    label: "Σε ράμπα ή θέση στάθμευσης ΑμεΑ",
    group: "parking",
  },
  {
    id: "art38-obstruct",
    article: "Άρθρο 38 ΚΟΚ",
    label: "Εμπόδιο σε άλλα οχήματα ή σημειωμένες θέσεις",
    group: "parking",
  },
  {
    id: "art38-against-flow",
    article: "Άρθρο 38 ΚΟΚ",
    label: "Αντίθετα στη ροή κυκλοφορίας",
    group: "parking",
  },
];

export function violationLabel(id: string): string {
  const item = VIOLATION_OPTIONS.find((v) => v.id === id);
  if (!item) return id;
  return item.code ? `${item.code} — ${item.label}` : item.label;
}
