import Link from "next/link";
import { ClipboardList, Shield, TabletSmartphone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader active="/" />
      <main>
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-[url('/harbor.svg')] bg-cover bg-center"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--sea-ink)] via-[color:var(--sea-ink)]/88 to-[color:var(--sea-ink)]/45" />
          <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 sm:pb-20">
            <p className="mb-3 animate-[fadeUp_0.7s_ease-out] text-sm font-medium tracking-[0.18em] text-[color:var(--sea-foam)] uppercase">
              Λιμενική Αστυνομία
            </p>
            <h1 className="max-w-2xl animate-[fadeUp_0.85s_ease-out] font-heading text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
              Ηλεκτρονικές κλήσεις οχημάτων
            </h1>
            <p className="mt-4 max-w-xl animate-[fadeUp_1s_ease-out] text-base text-white/80 sm:text-lg">
              Καταχώρηση έκθεσης βεβαίωσης από tablet στο πεδίο, και admin
              διαχείριση με εύρεση ανά ημερομηνία και πινακίδα.
            </p>
            <div className="mt-8 flex animate-[fadeUp_1.15s_ease-out] flex-col gap-3 sm:flex-row">
              <Link
                href="/klisi"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 bg-[color:var(--sea-foam)] text-[color:var(--sea-ink)] hover:bg-white"
                )}
              >
                Νέα κλήση (tablet)
              </Link>
              <Link
                href="/admin"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 border-white/40 bg-transparent text-white hover:bg-white/10"
                )}
              >
                Admin πίνακας
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-heading text-2xl text-[color:var(--sea-ink)] sm:text-3xl">
            Τι καλύπτει το πρώτο slice
          </h2>
          <p className="mt-2 max-w-2xl text-[color:var(--sea-muted)]">
            Ψηφιακή αντιστοιχία της έντυπης έκθεσης Ν. 5209/25 — χωρίς να
            αλλάζει η λογική της υπηρεσίας.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Idea
              icon={<TabletSmartphone className="size-5" />}
              title="Οθόνη λιμενικού"
              text="Οδηγός σε βήματα: αρχή, όχημα, παραβάσεις ΚΟΚ με checkboxes, πρόστιμο και τόπος."
            />
            <Idea
              icon={<ClipboardList className="size-5" />}
              title="Admin εύρεση"
              text="Λίστα κλήσεων με φίλτρο ημερομηνίας και αναζήτηση πινακίδας, λεπτομέρειες και κατάσταση."
            />
            <Idea
              icon={<Shield className="size-5" />}
              title="Πράξη διοικητή"
              text="Μετά το τρίημερο: χωρίς εμφάνιση, αβάσιμες/βάσιμες αντιρρήσεις, εξόφληση."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function Idea({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="border-t-2 border-[color:var(--sea-foam-deep)] pt-4">
      <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-[color:var(--sea-mist)] text-[color:var(--sea-foam-deep)]">
        {icon}
      </div>
      <h3 className="font-heading text-lg text-[color:var(--sea-ink)]">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-[color:var(--sea-muted)]">
        {text}
      </p>
    </article>
  );
}
