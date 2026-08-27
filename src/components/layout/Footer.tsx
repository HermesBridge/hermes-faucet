const RESOURCES = [
  { label: "USDCx docs", href: "https://docs.stacks.co/learn/bridging/usdcx" },
  { label: "Hermes testnet app", href: "https://testnet.hermesbridge.xyz/" },
  { label: "Hermes Bridge", href: "https://hermesbridge.xyz/" },
];

const NETWORK = [
  { label: "Stacks docs", href: "https://docs.stacks.co/" },
  { label: "Stacks Explorer", href: "https://explorer.hiro.so/?chain=testnet" },
];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-background/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2.5">
              <img
                src="https://www.hermesbridge.xyz/logo.png"
                alt="Hermes Bridge logo"
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg"
              />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Hermes Bridge
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A testnet faucet for USDCx on Stacks. Everything here is worthless play money for
              building and testing.
            </p>
          </div>

          <LinkColumn title="Resources" links={RESOURCES} />
          <LinkColumn title="Network" links={NETWORK} />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Hermes Bridge · Stacks testnet only</span>
          <a
            href="https://hermesbridge.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            hermesbridge.xyz
          </a>
        </div>
      </div>
    </footer>
  );
}
