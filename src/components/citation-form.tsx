"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectOrManual } from "@/components/select-or-manual";
import { SignaturePad } from "@/components/signature-pad";
import { TouchSelect } from "@/components/touch-select";
import {
  VEHICLE_COLORS,
  VEHICLE_COLOR_SWATCHES,
  VEHICLE_MAKES,
} from "@/lib/vehicle-options";
import { VIOLATION_OPTIONS } from "@/lib/violations";
import type {
  CitationInput,
  Officer,
  PortAuthority,
  SeizedItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  "Αρχή & όργανο",
  "Οδηγός / όχημα",
  "Παραβάσεις",
  "Ποινή & τόπος",
  "Επιβεβαίωση",
] as const;

const SEIZED_OPTIONS: { id: SeizedItem; label: string }[] = [
  { id: "license", label: "Άδεια ικανότητας" },
  { id: "registration", label: "Άδεια κυκλοφορίας" },
  { id: "plates", label: "Πινακίδες" },
];

function localNowInputValue(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

type FormState = Omit<CitationInput, "fineAmount"> & {
  fineAmount: number | null;
};

const emptyForm: FormState = {
  authority: "Υπουργείο Ναυτιλίας και Νησιωτικής Πολιτικής",
  portAuthority: "Λέσβου",
  officerName: "",
  fullName: "",
  fatherName: "",
  address: "",
  city: "",
  afm: "",
  plateNumber: "",
  vehicleMake: "",
  vehicleColor: "",
  vehicleType: "Επιβατικό",
  fineAmount: null,
  seizedItems: [],
  violationIds: [],
  violationNotes: "",
  occurredAt: "",
  location: "",
  violatorPresent: true,
  violatorSigned: false,
  signatureData: null,
  suspensionDays: null,
  commanderNotes: "",
};

export function CitationForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    occurredAt: localNowInputValue(),
  });
  const [error, setError] = useState<string | null>(null);
  const [createdNumber, setCreatedNumber] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officersLoading, setOfficersLoading] = useState(true);
  const [portAuthorities, setPortAuthorities] = useState<PortAuthority[]>([]);
  const [portsLoading, setPortsLoading] = useState(true);
  const [signatureOpen, setSignatureOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setOfficersLoading(true);
      setPortsLoading(true);
      try {
        const [officersRes, portsRes] = await Promise.all([
          fetch("/api/officers", { cache: "no-store" }),
          fetch("/api/port-authorities", { cache: "no-store" }),
        ]);
        const officersData = await officersRes.json();
        const portsData = await portsRes.json();
        if (!cancelled) {
          if (officersRes.ok) {
            setOfficers(
              Array.isArray(officersData.officers) ? officersData.officers : []
            );
          }
          if (portsRes.ok) {
            setPortAuthorities(
              Array.isArray(portsData.portAuthorities)
                ? portsData.portAuthorities
                : []
            );
          }
        }
      } catch {
        if (!cancelled) {
          setOfficers([]);
          setPortAuthorities([]);
        }
      } finally {
        if (!cancelled) {
          setOfficersLoading(false);
          setPortsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signViolations = useMemo(
    () => VIOLATION_OPTIONS.filter((v) => v.group === "signs"),
    []
  );
  const parkingViolations = useMemo(
    () => VIOLATION_OPTIONS.filter((v) => v.group === "parking"),
    []
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleViolation(id: string) {
    setForm((prev) => ({
      ...prev,
      violationIds: prev.violationIds.includes(id)
        ? prev.violationIds.filter((v) => v !== id)
        : [...prev.violationIds, id],
    }));
  }

  function toggleSeized(id: SeizedItem) {
    setForm((prev) => ({
      ...prev,
      seizedItems: prev.seizedItems.includes(id)
        ? prev.seizedItems.filter((v) => v !== id)
        : [...prev.seizedItems, id],
    }));
  }

  function validateStep(index: number): string | null {
    if (index === 0) {
      if (!form.portAuthority.trim()) return "Επιλέξτε λιμενική αρχή.";
      if (!form.officerName.trim()) return "Επιλέξτε λιμενικό όργανο.";
    }
    if (index === 1) {
      if (!form.plateNumber.trim()) return "Απαιτείται αριθμός κυκλοφορίας.";
      if (!form.vehicleMake.trim()) return "Συμπληρώστε τη μάρκα οχήματος.";
      if (!form.vehicleColor.trim()) return "Συμπληρώστε το χρώμα οχήματος.";
      if (form.violatorPresent && !form.fullName.trim()) {
        return "Συμπληρώστε ονοματεπώνυμο κατόχου/οδηγού.";
      }
    }
    if (index === 2 && form.violationIds.length === 0) {
      return "Επιλέξτε τουλάχιστον μία παράβαση.";
    }
    if (index === 3) {
      if (form.fineAmount === null || Number.isNaN(form.fineAmount)) {
        return "Συμπληρώστε το διοικητικό πρόστιμο.";
      }
      if (form.fineAmount < 0) return "Το πρόστιμο δεν μπορεί να είναι αρνητικό.";
      if (!form.occurredAt) return "Ορίστε ημέρα και ώρα παράβασης.";
      if (!form.location.trim()) return "Συμπληρώστε τον τόπο παράβασης.";
    }
    return null;
  }

  function next() {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function needsSignature() {
    return form.violatorPresent && form.violatorSigned;
  }

  function submit() {
    const message = validateStep(3);
    if (message) {
      setError(message);
      setStep(3);
      return;
    }
    setError(null);
    if (needsSignature() && !form.signatureData) {
      setSignatureOpen(true);
      return;
    }
    persistCitation(form.signatureData);
  }

  function persistCitation(signatureData: string | null) {
    startTransition(async () => {
      const payload: CitationInput = {
        ...form,
        fineAmount: form.fineAmount ?? 0,
        signatureData: needsSignature() ? signatureData : null,
        occurredAt: new Date(form.occurredAt).toISOString(),
        plateNumber: form.plateNumber.trim().toUpperCase(),
        ...(form.violatorPresent
          ? {}
          : {
              fullName: "",
              fatherName: "",
              address: "",
              city: "",
              afm: "",
              violatorSigned: false,
              signatureData: null,
            }),
      };
      const res = await fetch("/api/citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Αποτυχία αποθήκευσης.");
        return;
      }
      setSignatureOpen(false);
      setCreatedNumber(data.citation.number);
    });
  }

  if (createdNumber) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-[color:var(--sea-line)] bg-white/90 p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-4 size-14 text-[color:var(--sea-foam-deep)]" />
        <h2 className="font-heading text-2xl text-[color:var(--sea-ink)]">
          Η κλήση καταχωρήθηκε
        </h2>
        <p className="mt-2 text-[color:var(--sea-muted)]">
          Αριθμός έκθεσης{" "}
          <span className="font-semibold text-[color:var(--sea-ink)]">
            No {createdNumber}
          </span>
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="h-11 bg-[color:var(--sea-ink)] text-white hover:bg-[color:var(--sea-ink)]/90"
            onClick={() => {
              setCreatedNumber(null);
              setStep(0);
              setForm({ ...emptyForm, occurredAt: localNowInputValue() });
            }}
          >
            Νέα κλήση
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11"
            onClick={() => router.push("/admin")}
          >
            Προβολή στο Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ol className="mb-6 grid grid-cols-5 gap-2">
        {STEPS.map((label, index) => (
          <li key={label} className="min-w-0">
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors",
                index <= step
                  ? "bg-[color:var(--sea-foam-deep)]"
                  : "bg-[color:var(--sea-line)]"
              )}
            />
            <p
              className={cn(
                "mt-2 truncate text-[10px] font-medium sm:text-xs",
                index === step
                  ? "text-[color:var(--sea-ink)]"
                  : "text-[color:var(--sea-muted)]"
              )}
            >
              {label}
            </p>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-[color:var(--sea-line)] bg-white/90 p-5 shadow-sm sm:p-7">
        {step === 0 && (
          <section className="space-y-4">
            <SectionTitle
              title="Στοιχεία αρχής"
              subtitle="Όπως στην κεφαλίδα της έντυπης έκθεσης."
            />
            <Field label="Λιμενική αρχή">
              <TouchSelect
                value={form.portAuthority}
                loading={portsLoading}
                loadingLabel="Φόρτωση αρχών…"
                placeholder="Επιλέξτε από τη λίστα…"
                emptyLabel="Δεν υπάρχουν καταχωρημένες αρχές. Προσθέστε από το Admin."
                options={portAuthorities.map((p) => ({
                  id: p.id,
                  label: p.name,
                }))}
                onChange={(value) => {
                  update("portAuthority", value);
                  setError(null);
                }}
              />
            </Field>
            <Field label="Ονοματεπώνυμο λιμενικού οργάνου">
              <TouchSelect
                value={form.officerName}
                loading={officersLoading}
                loadingLabel="Φόρτωση λιμενικών…"
                placeholder="Επιλέξτε από τη λίστα…"
                emptyLabel="Δεν υπάρχουν καταχωρημένοι λιμενικοί. Προσθέστε από το Admin."
                options={officers.map((o) => ({
                  id: o.id,
                  label: o.fullName,
                }))}
                onChange={(value) => {
                  update("officerName", value);
                  setError(null);
                }}
              />
            </Field>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-heading text-xl text-[color:var(--sea-ink)] sm:text-2xl">
                  Κάτοχος ή οδηγός & όχημα
                </h2>
                <p className="mt-1 text-sm text-[color:var(--sea-muted)]">
                  Ενότητα Α της έκθεσης βεβαίωσης.
                </p>
              </div>
              <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border border-[color:var(--sea-line)] bg-white px-3 py-2 sm:mt-0.5">
                <Checkbox
                  checked={!form.violatorPresent}
                  onCheckedChange={(v) => {
                    const absent = Boolean(v);
                    setForm((prev) => ({
                      ...prev,
                      violatorPresent: !absent,
                      ...(absent
                        ? {
                            fullName: "",
                            fatherName: "",
                            address: "",
                            city: "",
                            afm: "",
                            violatorSigned: false,
                            signatureData: null,
                          }
                        : {}),
                    }));
                    setError(null);
                  }}
                />
                <span className="text-sm font-medium text-[color:var(--sea-ink)]">
                  Παραβάτης απών
                </span>
              </label>
            </div>

            {form.violatorPresent && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Ονοματεπώνυμο">
                    <Input
                      className="h-11"
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                    />
                  </Field>
                  <Field label="Πατρώνυμο">
                    <Input
                      className="h-11"
                      value={form.fatherName}
                      onChange={(e) => update("fatherName", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Διεύθυνση κατοικίας">
                  <Input
                    className="h-11"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Πόλη">
                    <Input
                      className="h-11"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
                  </Field>
                  <Field label="ΑΦΜ">
                    <Input
                      className="h-11 font-mono tracking-wide"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="π.χ. 123456789"
                      value={form.afm}
                      onChange={(e) => update("afm", e.target.value)}
                    />
                  </Field>
                </div>
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Αριθμός κυκλοφορίας">
                <Input
                  className="h-11 font-mono uppercase tracking-wide"
                  value={form.plateNumber}
                  onChange={(e) => update("plateNumber", e.target.value)}
                  placeholder="π.χ. ΑΒΓ 1234"
                />
              </Field>
              {form.violatorPresent && (
                <Field label="Είδος οχήματος">
                  <Input
                    className="h-11"
                    value={form.vehicleType}
                    onChange={(e) => update("vehicleType", e.target.value)}
                  />
                </Field>
              )}
              <Field label="Μάρκα">
                <SelectOrManual
                  value={form.vehicleMake}
                  options={VEHICLE_MAKES}
                  placeholder="Επιλέξτε μάρκα…"
                  searchPlaceholder="Πληκτρολογήστε για αναζήτηση…"
                  manualPlaceholder="Πληκτρολογήστε μάρκα…"
                  onChange={(value) => update("vehicleMake", value)}
                />
              </Field>
              <Field label="Χρώμα">
                <SelectOrManual
                  value={form.vehicleColor}
                  options={VEHICLE_COLORS}
                  swatches={VEHICLE_COLOR_SWATCHES}
                  placeholder="Επιλέξτε χρώμα…"
                  searchPlaceholder="Πληκτρολογήστε για αναζήτηση…"
                  manualPlaceholder="Πληκτρολογήστε χρώμα…"
                  onChange={(value) => update("vehicleColor", value)}
                />
              </Field>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-5">
            <SectionTitle
              title="Παραβάσεις"
              subtitle="Ενότητα Γ — επιλέξτε με άγγιγμα τις σχετικές παραβάσεις ΚΟΚ."
            />
            <ViolationGroup
              title="Άρθρο 7 ΚΟΚ — πινακίδες"
              options={signViolations}
              selected={form.violationIds}
              onToggle={toggleViolation}
            />
            <ViolationGroup
              title="Άρθρο 38 ΚΟΚ — στάθμευση"
              options={parkingViolations}
              selected={form.violationIds}
              onToggle={toggleViolation}
            />
            <Field label="Σημειώσεις λιμενικού (προαιρετικά)">
              <Textarea
                value={form.violationNotes}
                onChange={(e) => update("violationNotes", e.target.value)}
                rows={3}
                placeholder="Προαιρετικές σημειώσεις για τον διοικητή…"
              />
            </Field>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <SectionTitle
              title="Ποινή, χρόνος και τόπος"
              subtitle="Ενότητες Β, 3 και Δ της έντυπης κλήσης."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Διοικητικό πρόστιμο (€)">
                <Input
                  className="h-11"
                  type="number"
                  min={0}
                  inputMode="decimal"
                  placeholder="π.χ. 80"
                  value={form.fineAmount ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    update(
                      "fineAmount",
                      raw === "" ? null : Number(raw)
                    );
                  }}
                />
              </Field>
              <Field label="Ημέρα και ώρα παράβασης">
                <Input
                  className="h-11"
                  type="datetime-local"
                  value={form.occurredAt}
                  onChange={(e) => update("occurredAt", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Τόπος παράβασης">
              <Input
                className="h-11"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="π.χ. Λιμάνι Μυτιλήνης — κεντρική προβλήτα"
              />
            </Field>
            <div>
              <p className="mb-2 text-sm font-medium text-[color:var(--sea-ink)]">
                Κατάσχεση εγγράφων / πινακίδων
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {SEIZED_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors",
                      form.seizedItems.includes(opt.id)
                        ? "border-[color:var(--sea-foam-deep)] bg-[color:var(--sea-mist)]"
                        : "border-[color:var(--sea-line)] bg-white"
                    )}
                  >
                    <Checkbox
                      checked={form.seizedItems.includes(opt.id)}
                      onCheckedChange={() => toggleSeized(opt.id)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {form.violatorPresent && (
              <label className="flex min-h-12 max-w-md items-center gap-3 rounded-xl border border-[color:var(--sea-line)] px-3">
                <Checkbox
                  checked={form.violatorSigned}
                  onCheckedChange={(v) => {
                    const signed = Boolean(v);
                    setForm((prev) => ({
                      ...prev,
                      violatorSigned: signed,
                      signatureData: signed ? prev.signatureData : null,
                    }));
                  }}
                />
                <span className="text-sm">Υπογραφή παραβάτη</span>
              </label>
            )}
          </section>
        )}

        {step === 4 && (
          <section className="space-y-4">
            <SectionTitle
              title="Επιβεβαίωση"
              subtitle="Ελέγξτε τα στοιχεία πριν την οριστική καταχώρηση."
            />
            <dl className="grid gap-3 rounded-xl bg-[color:var(--sea-mist)]/70 p-4 text-sm sm:grid-cols-2">
              <ReviewItem label="Αρχή" value={form.portAuthority} />
              <ReviewItem label="Όργανο" value={form.officerName} />
              <ReviewItem
                label="Οδηγός"
                value={
                  form.violatorPresent
                    ? form.fullName
                    : "Παραβάτης απών"
                }
              />
              <ReviewItem label="Πινακίδα" value={form.plateNumber.toUpperCase()} />
              <ReviewItem
                label="Όχημα"
                value={
                  form.violatorPresent
                    ? `${form.vehicleMake} · ${form.vehicleColor} · ${form.vehicleType}`
                    : `${form.vehicleMake} · ${form.vehicleColor}`
                }
              />
              <ReviewItem
                label="Πρόστιμο"
                value={`${form.fineAmount ?? "—"} €`}
              />
              <ReviewItem label="Τόπος" value={form.location} />
              <ReviewItem
                label="Παραβάσεις"
                value={`${form.violationIds.length} επιλεγμένες`}
              />
            </dl>
            <ul className="space-y-1 text-sm text-[color:var(--sea-muted)]">
              {form.violationIds.map((id) => {
                const v = VIOLATION_OPTIONS.find((o) => o.id === id);
                return (
                  <li key={id}>
                    • {v?.code ? `${v.code} — ` : ""}
                    {v?.label ?? id}
                  </li>
                );
              })}
            </ul>
            {form.violationNotes.trim() ? (
              <div className="rounded-xl bg-[color:var(--sea-mist)]/70 p-4">
                <p className="text-xs uppercase tracking-wide text-[color:var(--sea-muted)]">
                  Σημειώσεις λιμενικού
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-[color:var(--sea-ink)]">
                  {form.violationNotes.trim()}
                </p>
              </div>
            ) : null}
            {needsSignature() ? (
              <p className="rounded-lg bg-[color:var(--sea-mist)] px-3 py-2 text-sm text-[color:var(--sea-ink)]">
                Μετά το «Καταχώρηση κλήσης» θα ανοίξει πλαίσιο για την υπογραφή
                του παραβάτη.
              </p>
            ) : null}
          </section>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-11"
            onClick={back}
            disabled={step === 0 || pending}
          >
            <ChevronLeft className="size-4" />
            Πίσω
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              size="lg"
              className="h-11 bg-[color:var(--sea-ink)] text-white hover:bg-[color:var(--sea-ink)]/90"
              onClick={next}
            >
              Επόμενο
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="h-11 bg-[color:var(--sea-foam-deep)] text-white hover:bg-[color:var(--sea-foam-deep)]/90"
              onClick={submit}
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Αποθήκευση…
                </>
              ) : (
                "Καταχώρηση κλήσης"
              )}
            </Button>
          )}
        </div>
      </div>

      <SignaturePad
        open={signatureOpen}
        onCancel={() => setSignatureOpen(false)}
        onConfirm={(dataUrl) => {
          setForm((prev) => ({ ...prev, signatureData: dataUrl }));
          persistCitation(dataUrl);
        }}
      />
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-2">
      <h2 className="font-heading text-xl text-[color:var(--sea-ink)] sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[color:var(--sea-muted)]">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[color:var(--sea-ink)]">{label}</Label>
      {children}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[color:var(--sea-muted)]">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-[color:var(--sea-ink)]">{value}</dd>
    </div>
  );
}

function ViolationGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: typeof VIOLATION_OPTIONS;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-[color:var(--sea-ink)]">
        {title}
      </h3>
      <div className="grid gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <label
              key={opt.id}
              className={cn(
                "flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-colors",
                active
                  ? "border-[color:var(--sea-foam-deep)] bg-[color:var(--sea-mist)]"
                  : "border-[color:var(--sea-line)] bg-white hover:bg-[color:var(--sea-mist)]/50"
              )}
            >
              <Checkbox
                className="mt-0.5"
                checked={active}
                onCheckedChange={() => onToggle(opt.id)}
              />
              <span className="text-sm leading-snug text-[color:var(--sea-ink)]">
                {opt.code && (
                  <span className="mr-1.5 font-mono text-xs font-semibold text-[color:var(--sea-foam-deep)]">
                    {opt.code}
                  </span>
                )}
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
