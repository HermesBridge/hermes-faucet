import { validateStacksAddress } from "@stacks/transactions";

export type AddressCheck = { valid: true } | { valid: false; reason: string };

export function checkTestnetAddress(raw: string): AddressCheck {
  const address = raw.trim();
  if (!address) return { valid: false, reason: "Enter a Stacks testnet address to continue." };

  if (!validateStacksAddress(address)) {
    return { valid: false, reason: "That doesn't look like a valid Stacks address." };
  }

  const prefix = address.slice(0, 2).toUpperCase();
  if (prefix === "SP" || prefix === "SM") {
    return {
      valid: false,
      reason: "That's a mainnet address. This faucet only funds testnet addresses starting with ST.",
    };
  }
  if (prefix !== "ST" && prefix !== "SN") {
    return { valid: false, reason: "Testnet addresses start with ST." };
  }
  return { valid: true };
}

export function shortAddress(address: string) {
  return address.length > 14 ? `${address.slice(0, 6)}…${address.slice(-5)}` : address;
}
