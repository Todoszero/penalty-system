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
  officerId: string;
  createdAt: string;
  updatedAt: string;

  // A — κάτοχος / οδηγός
  fullName: string;
  fatherName: string;
  address: string;
  city: string;
  taxOffice: string;
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
