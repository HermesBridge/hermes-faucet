import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AddressField } from "@/components/faucet/AddressField";
import { CopyButton } from "@/components/faucet/CopyButton";
import { TokenCard, type TokenState } from "@/components/faucet/TokenCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TOKENS, extractFaucetAddress, parseCooldownHours } from "@/lib/faucet-tokens";
import { claimTokens, type ClaimPayload } from "@/lib/faucet.functions";
import { fetchPoolBalance } from "@/lib/faucet-pool";
import { checkTestnetAddress, shortAddress } from "@/lib/stacks-address";

function showClaimToast(res: ClaimPayload) {
  toast.success(res.message, {
    duration: 12000,
    description: (
      <div className="mt-1 flex flex-col gap-2">
        <code className="max-w-full truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
          {res.txId}
        </code>
        <div className="flex flex-wrap items-center gap-3">
          <CopyButton value={res.txId} label="transaction id" />
          <a
            href={res.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View on explorer <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    ),
  });
}

const TITLE = "USDCx Testnet Faucet";
const DESCRIPTION =
  "Claim test USDCx on Stacks testnet in seconds. USDCx is Circle's USDC on Stacks — paste an ST address or connect Leather or Xverse to start building.";
const STORAGE_KEY = "hermes-faucet:last-address";
const DOCS_URL = "https://docs.stacks.co/learn/bridging/usdcx";

const FAQ: { q: string; a: string }[] = [
  {
    q: "What is USDCx?",
    a: "USDCx is Circle's USDC on the Stacks blockchain — a fully-backed US dollar stablecoin you can build with on Stacks. It's the same dollar you know, usable in Stacks apps and contracts.",
  },
  {
    q: "What is this faucet for?",
    a: "It drips test USDCx to any Stacks testnet address so you can develop and test apps that use USDCx without spending real money. Every token here is worthless play money on Stacks testnet.",
  },
  {
    q: "Is USDCx really backed by Circle?",
    a: "On mainnet, yes — USDCx represents Circle-issued USDC, backed 1:1 by real reserves. The tokens from this faucet are testnet-only stand-ins with no value; use them purely for building and testing.",
  },
  {
    q: "Which addresses can I use?",
    a: "Any Stacks testnet address — it starts with ST. Paste one directly, or connect Leather or Xverse and we'll fill in your address for you.",
  },
  {
    q: "How much can I claim and how often?",
    a: "You can claim up to the amount shown on the token card once every 24 hours per address. The exact amount sent back is confirmed in the claim result.",
  },
  {
    q: "I got a cooldown or \"faucet empty\" error — what now?",
    a: "Cooldown means that address already claimed in the last 24 hours; wait it out or use another testnet address. \"Faucet empty\" means the faucet wallet needs topping up — try again a little later.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaucetPage,
});

type StateMap = Record<string, TokenState>;

const initialState: StateMap = Object.fromEntries(
  TOKENS.map((t) => [t.key, { balanceLoading: false, claiming: false } as TokenState]),
);

function FaucetPage() {
  const [address, setAddress] = useState("");
  const [touched, setTouched] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [states, setStates] = useState<StateMap>(initialState);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAddress(saved);
      setTouched(true);
    }
  }, []);

  const check = useMemo(() => checkTestnetAddress(address), [address]);
  const validAddress = check.valid ? address.trim() : null;
  const fieldError = touched && address.trim() && !check.valid ? check.reason : null;

  const patch = useCallback((key: string, next: Partial<TokenState>) => {
    setStates((prev) => ({ ...prev, [key]: { ...(prev[key] as TokenState), ...next } }));
  }, []);

  // The "Faucet pool" figure is the USDCx left in the faucet wallet — the same
  // for everyone and independent of the address being funded.
  const refreshPool = useCallback(async () => {
    patch("usdcx", { balanceLoading: true });
    const res = await fetchPoolBalance();
    patch("usdcx", {
      balanceLoading: false,
      balance: res.ok ? res.formatted : undefined,
    });
  }, [patch]);

  useEffect(() => {
    void refreshPool();
  }, [refreshPool]);

  useEffect(() => {
    if (!validAddress) return;
    localStorage.setItem(STORAGE_KEY, validAddress);
  }, [validAddress]);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    try {
      const { connect, getLocalStorage, disconnect, isConnected } = await import("@stacks/connect");
      if (isConnected()) disconnect();
      await connect();
      const stx = getLocalStorage()?.addresses?.stx?.[0]?.address;
      if (stx) {
        setAddress(stx);
        setTouched(true);
        setWalletConnected(true);
      }
    } catch {
      setWalletConnected(false);
    } finally {
      setConnecting(false);
    }
  }, []);

  const handleClaim = useCallback(
    async (key: (typeof TOKENS)[number]["key"]) => {
      setTouched(true);
      if (!validAddress) return;
      patch(key, { claiming: true, error: undefined });
      const res = await claimTokens({ data: { token: key, address: validAddress } });
      if (res.ok) {
        patch(key, { claiming: false });
        showClaimToast(res);
        void refreshPool();
        return;
      }
      patch(key, {
        claiming: false,
        error: {
          kind: res.kind,
          message: res.error,
          hours: res.kind === "cooldown" ? parseCooldownHours(res.error) : null,
          faucetAddress: res.kind === "faucet_empty" ? extractFaucetAddress(res.error) : null,
        },
      });
    },
    [validAddress, patch, refreshPool],
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
      <section className="flex flex-col items-start gap-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Stacks testnet only · 24h cooldown
          per address
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            <span className="brand-gradient-text">USDCx</span> testnet faucet
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            USDCx is Circle&apos;s USDC on Stacks. Grab test USDCx here so you can build and test
            apps with a Circle-backed dollar on Stacks testnet.
          </p>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <AddressField
          value={address}
          onChange={(v) => {
            setAddress(v);
            setTouched(true);
          }}
          error={fieldError}
          onConnect={handleConnect}
          connecting={connecting}
          walletLabel={
            walletConnected && validAddress ? shortAddress(validAddress) : "Connect wallet"
          }
        />

        {TOKENS.map((token) => (
          <TokenCard
            key={token.key}
            token={token}
            state={states[token.key] as TokenState}
            disabled={!validAddress}
            onClaim={() => void handleClaim(token.key)}
          />
        ))}
      </section>

      <section className="glow-card mt-10 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
        <h2 className="text-base font-semibold">What do I do with these?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          USDCx is Circle&apos;s USDC on Stacks — a fully-backed dollar you can wire into Stacks
          apps and contracts. Use this test USDCx to build and test payment, DeFi, and settlement
          flows on Stacks testnet before going to mainnet.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Read the USDCx docs <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="https://testnet.hermesbridge.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Bridge on the Hermes testnet app <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need to know about claiming test USDCx on Stacks.
        </p>
        <Accordion type="single" collapsible className="mt-4">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}
