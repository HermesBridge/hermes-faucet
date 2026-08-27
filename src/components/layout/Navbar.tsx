import { ArrowUpRight } from "lucide-react";

const DOCS_URL = "https://docs.stacks.co/learn/bridging/usdcx";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <a
          href="https://hermesbridge.xyz/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-w-0 items-center gap-2 sm:gap-2.5"
        >
          <img
            src="https://www.hermesbridge.xyz/logo.png"
            alt="Hermes Bridge logo"
            width={32}
            height={32}
            className="h-7 w-7 shrink-0 rounded-lg sm:h-8 sm:w-8"
          />
          <span className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
            Hermes Bridge
          </span>
        </a>

        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:px-3"
        >
          <span className="hidden sm:inline">Explore docs</span>
          <span className="sm:hidden">Docs</span>
          <ArrowUpRight className="h-4 w-4 shrink-0" />
        </a>
      </nav>
    </header>
  );
}
