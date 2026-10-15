"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VIOLATION_OPTIONS } from "@/lib/violations";
import type { CitationInput, SeizedItem } from "@/lib/types";
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

const emptyForm: CitationInput = {
  authority: "Υπουργείο Ναυτιλίας και Νησιωτικής Πολιτικής",
  portAuthority: "Λέσβος",
  officerName: "",
  officerId: "",
  fullName: "",
  fatherName: "",
  address: "",
  city: "",
  taxOffice: "",
  plateNumber: "",
  vehicleMake: "",
  vehicleColor: "",
  vehicleType: "Επιβατικό",
  fineAmount: 80,
  seizedItems: [],
  violationIds: [],
  violationNotes: "",
  occurredAt: "",
  location: "",
  violatorPresent: true,
  violatorSigned: false,
  suspensionDays: null,
  commanderNotes: "",
};

export function CitationForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CitationInput>({
    ...emptyForm,
    occurredAt: localNowInputValue(),
  });
  const [error, setError] = useState<string | null>(null);
  const [createdNumber, setCreatedNumber] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const signViolations = useMemo(
    () => VIOLATION_OPTIONS.filter((v) => v.group === "signs"),
    []
  );
  const parkingViolations = useMemo(
    () => VIOLATION_OPTIONS.filter((v) => v.group === "parking"),
    []
  );

  function update<K extends keyof CitationInput>(key: K, value: CitationInput[K]) {
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
      if (!form.portAuthority.trim()) return "Συμπληρώστε τη λιμενική αρχή.";
      if (!form.officerName.trim()) return "Συμπληρώστε το όνομα του οργάνου.";
      if (!form.officerId.trim()) return "Συμπληρώστε τον αριθμό οργάνου.";
    }
    if (index === 1) {
      if (!form.plateNumber.trim()) return "Απαιτείται αριθμός κυκλοφορίας.";
      if (!form.fullName.trim()) return "Συμπληρώστε ονοματεπώνυμο κατόχου/οδηγού.";
    }
    if (index === 2 && form.violationIds.length === 0) {
      return "Επιλέξτε τουλάχιστον μία παράβαση.";
    }
    if (index === 3) {
      if (!form.occurredAt) return "Ορίστε ημέρα και ώρα παράβασης.";
      if (!form.location.trim()) return "Συμπληρώστε τον τόπο παράβασης.";
      if (form.fineAmount < 0) return "Το πρόστιμο δεν μπορεί να είναι αρνητικό.";
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

  function submit() {
    const message = validateStep(3);
    if (message) {
      setError(message);
      setStep(3);
      return;
    }
    setError(null);
    startTransition(async () => {
      const payload: CitationInput = {
        ...form,
        occurredAt: new Date(form.occurredAt).toISOString(),
        plateNumber: form.plateNumber.trim().toUpperCase(),
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
              <Input
                className="h-11"
                value={form.portAuthority}
                onChange={(e) => update("portAuthority", e.target.value)}
                placeholder="π.χ. Χίος, Μυτιλήνη, Λέσβος"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Όνομα λιμενικού οργάνου">
                <Input
                  className="h-11"
                  value={form.officerName}
                  onChange={(e) => update("officerName", e.target.value)}
                />
              </Field>
              <Field label="Αριθμός οργάνου">
                <Input
                  className="h-11"
                  value={form.officerId}
                  onChange={(e) => update("officerId", e.target.value)}
                />
              </Field>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <SectionTitle
              title="Κάτοχος ή οδηγός & όχημα"
              subtitle="Ενότητα Α της έκθεσης βεβαίωσης."
            />
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
              <Field label="Οικονομική εφορία">
                <Input
                  className="h-11"
                  value={form.taxOffice}
                  onChange={(e) => update("taxOffice", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Αριθμός κυκλοφορίας">
                <Input
                  className="h-11 font-mono uppercase tracking-wide"
                  value={form.plateNumber}
                  onChange={(e) => update("plateNumber", e.target.value)}
                  placeholder="π.χ. ΑΒΓ 1234"
                />
              </Field>
              <Field label="Είδος οχήματος">
                <Input
                  className="h-11"
                  value={form.vehicleType}
                  onChange={(e) => update("vehicleType", e.target.value)}
                />
              </Field>
              <Field label="Μάρκα">
                <Input
                  className="h-11"
                  value={form.vehicleMake}
                  onChange={(e) => update("vehicleMake", e.target.value)}
                />
              </Field>
              <Field label="Χρώμα">
                <Input
                  className="h-11"
                  value={form.vehicleColor}
                  onChange={(e) => update("vehicleColor", e.target.value)}
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
            <Field label="Παρατηρήσεις (προαιρετικά)">
              <Textarea
                value={form.violationNotes}
                onChange={(e) => update("violationNotes", e.target.value)}
                rows={3}
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
                  value={form.fineAmount}
                  onChange={(e) =>
                    update("fineAmount", Number(e.target.value) || 0)
                  }
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
                placeholder="π.χ. Λιμάνι Χίου — κεντρική προβλήτα"
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
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[color:var(--sea-line)] px-3">
                <Checkbox
                  checked={form.violatorPresent}
                  onCheckedChange={(v) =>
                    update("violatorPresent", Boolean(v))
                  }
                />
                <span className="text-sm">Παραβάτης παρών</span>
              </label>
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[color:var(--sea-line)] px-3">
                <Checkbox
                  checked={form.violatorSigned}
                  onCheckedChange={(v) =>
                    update("violatorSigned", Boolean(v))
                  }
                />
                <span className="text-sm">Υπογραφή παραβάτη</span>
              </label>
            </div>
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
              <ReviewItem
                label="Όργανο"
                value={`${form.officerName} (${form.officerId})`}
              />
              <ReviewItem label="Οδηγός" value={form.fullName} />
              <ReviewItem label="Πινακίδα" value={form.plateNumber.toUpperCase()} />
              <ReviewItem
                label="Όχημα"
                value={`${form.vehicleMake} · ${form.vehicleColor} · ${form.vehicleType}`}
              />
              <ReviewItem label="Πρόστιμο" value={`${form.fineAmount} €`} />
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
