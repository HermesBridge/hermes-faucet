// Server-only helpers for talking to the Hermes faucet backend.
//
// NOTE FOR OPERATORS: the faucet backend's `x-api-key` is held here, server
// side, and is never shipped in the browser bundle. It is NOT an access
// control boundary by itself — the real protections are the backend's IP rate
// limit (10 req/min), the per-address 24h cooldown, and its ALLOWED_ORIGINS
// check. Add this site's deployed origin to the backend's ALLOWED_ORIGINS or
// every request will fail with 403 in production.

export const FAUCET_BASE_URL =
  process.env["FAUCET_API_BASE_URL"] ??
  "https://hermes-faucet-backend-70493756212.europe-west3.run.app";

export type TokenKey = "usdcx" | "stx" | "sbtc";

export const TOKEN_PATHS: Record<TokenKey, { balance: string; claim: string }> = {
  usdcx: { balance: "/api/balance", claim: "/api/claim" },
  stx: { balance: "/api/balance-stx", claim: "/api/claim-stx" },
  sbtc: { balance: "/api/balance-sbtc", claim: "/api/claim-sbtc" },
};

export type FaucetResult<T> =
  | ({ ok: true } & T)
  | { ok: false; status: number; error: string; kind: FaucetErrorKind };

export type FaucetErrorKind =
  | "invalid_address"
  | "faucet_empty"
  | "cooldown"
  | "rate_limited"
  | "config"
  | "network"
  | "unknown";

function classify(status: number, message: string): FaucetErrorKind {
  const m = message.toLowerCase();
  if (status === 401 || status === 403) return "config";
  if (status === 429) return m.includes("claim again") ? "cooldown" : "rate_limited";
  if (m.includes("insufficient balance")) return "faucet_empty";
  if (status === 400) return "invalid_address";
  return "unknown";
}

export async function faucetFetch<T>(
  path: string,
  init?: { method?: "GET" | "POST"; body?: unknown },
): Promise<FaucetResult<T>> {
  const apiKey = process.env["FAUCET_API_KEY"];
  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      error: "Faucet API key is not configured on the server.",
      kind: "config",
    };
  }

  let res: Response;
  try {
    res = await fetch(`${FAUCET_BASE_URL}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        "x-api-key": apiKey,
        ...(init?.body ? { "content-type": "application/json" } : {}),
      },
      ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Could not reach the faucet backend. It may be offline.",
      kind: "network",
    };
  }

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok || parsed === null) {
    const message =
      (parsed as { error?: string } | null)?.error ??
      (res.ok
        ? "The faucet backend returned an unexpected response."
        : `Faucet request failed (${res.status}).`);
    return { ok: false, status: res.status, error: message, kind: classify(res.status, message) };
  }

  return { ok: true, ...(parsed as T) };
}
