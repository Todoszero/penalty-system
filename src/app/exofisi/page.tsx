import { SiteHeader } from "@/components/site-header";
import { PaymentSearch } from "@/components/payment-search";

export default function ExofisiPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader active="/exofisi" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-[color:var(--sea-foam-deep)] uppercase">
            Πολίτης
          </p>
          <h1 className="mt-1 font-heading text-3xl text-[color:var(--sea-ink)] sm:text-4xl">
            Εξόφληση κλήσεων
          </h1>
          <p className="mt-2 text-[color:var(--sea-muted)]">
            Βρείτε ανεξόφλητες κλήσεις με τον αριθμό πινακίδας και προχωρήστε σε
            πληρωμή. Μετά την πληρωμή, η διοίκηση επιβεβαιώνει την εξόφληση.
          </p>
        </div>
        <PaymentSearch />
      </main>
    </div>
  );
}
