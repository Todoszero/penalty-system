import Link from "next/link";
import { Anchor } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Αρχική" },
  { href: "/klisi", label: "Νέα κλήση" },
  { href: "/exofisi", label: "Εξόφληση" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--sea-ink)]/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-heading tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-md bg-[color:var(--sea-foam)] text-[color:var(--sea-ink)]">
            <Anchor className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold sm:text-base">
              Penalty System
            </span>
            <span className="block text-[11px] text-white/70 sm:text-xs">
              Λιμενική Αστυνομία — ηλεκτρονικές κλήσεις
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                active === link.href
                  ? "bg-white/15 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
