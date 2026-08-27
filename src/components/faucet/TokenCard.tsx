import { ArrowUpRight, Droplets, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/faucet/CopyButton";
import { cn } from "@/lib/utils";
import type { TokenConfig } from "@/lib/faucet-tokens";

export type TokenState = {
  balance?: string | undefined;
  balanceLoading: boolean;
  claiming: boolean;
  error?:
    | { kind: string; message: string; faucetAddress?: string | null; hours?: number | null }
    | undefined;
};

export function TokenCard({
  token,
  state,
  disabled,
  onClaim,
}: {
  token: TokenConfig;
  state: TokenState;
  disabled: boolean;
  onClaim: () => void;
}) {
  const cooldown = state.error?.kind === "cooldown";
  const buttonDisabled = disabled || state.claiming || cooldown;

  return (
    <section
      className={cn(
        "glow-card flex flex-col gap-4 rounded-2xl border border-border bg-card/80 p-5 backdrop-blur",
        token.primary && "border-primary/40 bg-card ring-1 ring-primary/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">{token.symbol}</h2>
            {token.primary && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                Primary
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{token.blurb}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Faucet pool</p>
          <p className="text-sm font-medium tabular-nums">
            {state.balanceLoading ? "…" : (state.balance ?? "—")}
          </p>
        </div>
      </div>

      <Button
        onClick={onClaim}
        disabled={buttonDisabled}
        variant={token.primary ? "default" : "secondary"}
        size="lg"
        className="w-full font-semibold"
      >
        {state.claiming ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : cooldown ? (
          `Available in ${state.error?.hours ?? "a few"} hour(s)`
        ) : (
          <>
            <Droplets className="h-4 w-4" /> Claim up to ${token.defaultAmount} {token.symbol}
          </>
        )}
      </Button>

      {state.error && state.error.kind === "faucet_empty" && (
        <div className="rounded-xl border border-warning/50 bg-warning/10 p-3 text-sm">
          <p className="font-semibold text-warning">The faucet tank is empty</p>
          <p className="mt-1 text-muted-foreground">
            This isn&apos;t on you — the {token.symbol} reserve needs a refill.
          </p>
          {state.error.faucetAddress && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="truncate rounded bg-background/60 px-2 py-1 text-xs text-muted-foreground">
                {state.error.faucetAddress}
              </code>
              <CopyButton value={state.error.faucetAddress} label="faucet address" />
            </div>
          )}
          <a
            href="https://testnet.hermesbridge.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Report it to the Hermes team <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      )}

      {state.error && state.error.kind === "cooldown" && (
        <p className="rounded-xl border border-border bg-secondary/60 p-3 text-sm text-muted-foreground">
          You already topped up recently. Come back in{" "}
          <span className="font-medium text-foreground">{state.error.hours ?? "a few"} hour(s)</span>{" "}
          for more {token.symbol}.
        </p>
      )}

      {state.error && state.error.kind === "rate_limited" && (
        <p className="rounded-xl border border-border bg-secondary/60 p-3 text-sm text-muted-foreground">
          Slow down a touch — too many requests. Wait about a minute and try again.
        </p>
      )}

      {state.error &&
        !["cooldown", "rate_limited", "faucet_empty"].includes(state.error.kind) && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">
            {state.error.kind === "config"
              ? "The faucet is misconfigured right now. The Hermes team has been notified."
              : state.error.message}
          </p>
        )}
    </section>
  );
}
