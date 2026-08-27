// The USDCx faucet pool: how much USDCx is left in the faucet wallet for people
// to claim. Read straight off the Stacks testnet chain via Hiro's public API —
// no credentials, and completely independent of whoever (if anyone) has a wallet
// connected. Runs in the browser; the Hiro API is public and CORS-enabled.

export const POOL = {
  wallet: "ST3PEF5WDJ3S3K28KHQJDM6SXCMBS71D7C4FETN6J",
  contractId: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx",
  decimals: 6,
  symbol: "USDCx",
  apiBase: "https://api.testnet.hiro.so",
} as const;

export type PoolBalance =
  | { ok: true; balance: number; formatted: string }
  | { ok: false };

export async function fetchPoolBalance(): Promise<PoolBalance> {
  try {
    const res = await fetch(`${POOL.apiBase}/extended/v1/address/${POOL.wallet}/balances`);
    if (!res.ok) return { ok: false };

    const data = (await res.json()) as {
      fungible_tokens?: Record<string, { balance?: string }>;
    };
    const entry = Object.entries(data.fungible_tokens ?? {}).find(([id]) =>
      id.startsWith(`${POOL.contractId}::`),
    );
    const balance = Number(entry?.[1]?.balance ?? "0") / 10 ** POOL.decimals;
    const formatted = `$${balance.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${POOL.symbol}`;
    return { ok: true, balance, formatted };
  } catch {
    return { ok: false };
  }
}
