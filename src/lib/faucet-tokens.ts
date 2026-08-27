import type { TokenKey } from "./faucet.server";

export type TokenConfig = {
  key: TokenKey;
  symbol: string;
  name: string;
  /** Backend defaults — display only, the real amount comes back in the claim message. */
  defaultAmount: string;
  cooldownHours: number;
  blurb: string;
  primary?: boolean;
};

export const TOKENS: TokenConfig[] = [
  {
    key: "usdcx",
    symbol: "USDCx",
    name: "Hermes test USDCx",
    defaultAmount: "100",
    cooldownHours: 24,
    blurb: "Circle's USDC on Stacks. A Circle-backed test dollar for building on Stacks.",
    primary: true,
  },
  // Temporarily disabled — may be re-added later. Uncomment to restore.
  // {
  //   key: "stx",
  //   symbol: "STX",
  //   name: "Stacks testnet STX",
  //   defaultAmount: "1",
  //   cooldownHours: 24,
  //   blurb: "Gas, so you can actually move your USDCx around.",
  // },
  // {
  //   key: "sbtc",
  //   symbol: "sBTC",
  //   name: "Testnet sBTC",
  //   defaultAmount: "0.001",
  //   cooldownHours: 24,
  //   blurb: "A pinch of sBTC for testing Bitcoin-backed flows.",
  // },
];

export function parseCooldownHours(message: string): number | null {
  const match = message.match(/(\d+(?:\.\d+)?)\s*hour/i);
  return match?.[1] ? Number(match[1]) : null;
}

export function extractFaucetAddress(message: string): string | null {
  const match = message.match(/(S[TPMN][0-9A-Z]{20,})/);
  return match?.[1] ?? null;
}
