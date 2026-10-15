export type SeizedItem = "license" | "registration" | "plates";

export type ObjectionOutcome =
  | "pending"
  | "no_appearance"
  | "groundless"
  | "well_founded";

export type CitationStatus =
  | "issued"
  | "awaiting_objection"
  | "finalized"
  | "paid"
  | "cancelled";

export interface Citation {
  id: string;
  number: string;
  authority: string;
  portAuthority: string;
  officerName: string;
  createdAt: string;
  updatedAt: string;

  // A — κάτοχος / οδηγός
  fullName: string;
  fatherName: string;
  address: string;
  city: string;
  afm: string;
  plateNumber: string;
  vehicleMake: string;
  vehicleColor: string;
  vehicleType: string;

  // B — ποινές
  fineAmount: number;
  seizedItems: SeizedItem[];

  // Γ — παραβάσεις
  violationIds: string[];
  violationNotes: string;

  // 3 / Δ
  occurredAt: string;
  location: string;
  violatorPresent: boolean;
  violatorSigned: boolean;
  /** PNG data URL υπογραφής παραβάτη (αν υπάρχει). */
  signatureData: string | null;

  // Ε / ΣΤ — διοικητική πράξη
  status: CitationStatus;
  objectionOutcome: ObjectionOutcome;
  suspensionDays: number | null;
  commanderDecisionAt: string | null;
  commanderNotes: string;
  paymentReference: string | null;
  paidAt: string | null;
}

export type CitationInput = Omit<
  Citation,
  "id" | "number" | "createdAt" | "updatedAt" | "status" | "objectionOutcome" | "commanderDecisionAt" | "paymentReference" | "paidAt"
> & {
  suspensionDays?: number | null;
  commanderNotes?: string;
};

export type CitationUpdate = Partial<
  Pick<
    Citation,
    | "status"
    | "objectionOutcome"
    | "suspensionDays"
    | "commanderDecisionAt"
    | "commanderNotes"
    | "paymentReference"
    | "paidAt"
    | "fineAmount"
  >
>;

export interface Officer {
  id: string;
  fullName: string;
  createdAt: string;
}

export interface PortAuthority {
  id: string;
  name: string;
  createdAt: string;
}

export type PaymentNotificationStatus = "pending" | "acknowledged";

/** Ειδοποίηση πληρωμής για το Admin (π.χ. μετά από EveryPay). */
export interface PaymentNotification {
  id: string;
  citationId: string;
  citationNumber: string;
  plateNumber: string;
  fineAmount: number;
  fullName: string;
  officerName: string;
  location: string;
  occurredAt: string;
  portAuthority: string;
  createdAt: string;
  status: PaymentNotificationStatus;
  /** Αναφορά παρόχου πληρωμών (placeholder για EveryPay). */
  providerRef: string | null;
}
