import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { faucetFetch, TOKEN_PATHS, type FaucetResult, type TokenKey } from "./faucet.server";

const input = z.object({
  token: z.enum(["usdcx", "stx", "sbtc"]),
  address: z.string().min(1).max(128),
});

export type BalancePayload = { balance: number; formatted: string };
export type ClaimPayload = {
  success: boolean;
  message: string;
  txId: string;
  explorerUrl: string;
};

export const fetchBalance = createServerFn({ method: "POST" })
  .validator((data: { token: TokenKey; address: string }) => input.parse(data))
  .handler(async ({ data }): Promise<FaucetResult<BalancePayload>> => {
    return faucetFetch<BalancePayload>(
      `${TOKEN_PATHS[data.token].balance}/${encodeURIComponent(data.address)}`,
    );
  });

export const claimTokens = createServerFn({ method: "POST" })
  .validator((data: { token: TokenKey; address: string }) => input.parse(data))
  .handler(async ({ data }): Promise<FaucetResult<ClaimPayload>> => {
    return faucetFetch<ClaimPayload>(TOKEN_PATHS[data.token].claim, {
      method: "POST",
      body: { address: data.address },
    });
  });

export const checkFaucetHealth = createServerFn({ method: "GET" }).handler(async () => {
  return faucetFetch<{ status?: string }>("/health");
});
