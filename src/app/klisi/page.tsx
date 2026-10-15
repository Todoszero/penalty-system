import { SiteHeader } from "@/components/site-header";
import { CitationForm } from "@/components/citation-form";

export default function KlisiPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader active="/klisi" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-[color:var(--sea-foam-deep)] uppercase">
            Οθόνη πεδίου
          </p>
          <h1 className="mt-1 font-heading text-3xl text-[color:var(--sea-ink)] sm:text-4xl">
            Καταχώρηση κλήσης
          </h1>
          <p className="mt-2 text-[color:var(--sea-muted)]">
            Συμπληρώστε την έκθεση βεβαίωσης παράβασης οχήματος σε βήματα.
          </p>
        </div>
        <CitationForm />
      </main>
    </div>
  );
}
