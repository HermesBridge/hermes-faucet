import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddressField({
  value,
  onChange,
  error,
  onConnect,
  connecting,
  walletLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  onConnect: () => void;
  connecting: boolean;
  walletLabel: string;
}) {
  return (
    <div className="glow-card rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
      <label htmlFor="stx-address" className="text-sm font-medium">
        Your Stacks testnet address
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <Input
          id="stx-address"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ST3CM4MD4PTNPTPSR3XVEMYWGS33BDZ3A2MTBJX95"
          spellCheck={false}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "stx-address-error" : undefined}
          className="h-12 flex-1 font-mono text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onConnect}
          disabled={connecting}
          className="h-12 shrink-0"
        >
          <Wallet className="h-4 w-4" /> {connecting ? "Connecting…" : walletLabel}
        </Button>
      </div>
      {error ? (
        <p id="stx-address-error" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Testnet only. Paste an address starting with ST, or connect Leather / Xverse.
        </p>
      )}
    </div>
  );
}
