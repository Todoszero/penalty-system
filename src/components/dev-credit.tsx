import { cn } from "@/lib/utils";

export function DevCredit({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex w-fit max-w-full items-center rounded-md border border-[color:var(--sea-line)]/70 bg-white/60 px-2 py-1",
        className
      )}
    >
      <p className="whitespace-nowrap font-heading text-[10px] tracking-[0.08em] text-[color:var(--sea-muted)] uppercase">
        developed by{" "}
        <a
          href="https://kaldellis-software.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[color:var(--sea-ink)]/80 underline decoration-[color:var(--sea-line)] underline-offset-2 transition-colors hover:text-[color:var(--sea-foam-deep)] hover:decoration-[color:var(--sea-foam-deep)]"
        >
          Kaldellis Software
        </a>{" "}
        <span className="text-[color:var(--sea-muted)]">2026</span>
      </p>
    </div>
  );
}
