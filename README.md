# Hermes USDCx Testnet Faucet

A web faucet that drips test **USDCx** to any Stacks **testnet** address, so
developers can build and test apps with a Circle‑backed dollar on Stacks
without spending real money.

> **USDCx** is Circle's USDC on the Stacks blockchain — a fully‑backed US dollar
> stablecoin usable in Stacks apps and contracts. Learn more in the
> [Stacks USDCx docs](https://docs.stacks.co/learn/bridging/usdcx).
>
> Everything this faucet hands out is worthless play money on **Stacks testnet**.

---

## Features

- **One‑click claims** — paste a testnet address (starts with `ST`) or connect
  **Leather** / **Xverse**, then claim.
- **Live faucet pool** — shows the USDCx remaining in the faucet wallet, read
  straight off the chain via the public Hiro testnet API.
- **Clear feedback** — success pops a toast with the transaction id, a copy
  button, and an explorer link; cooldown / empty‑pool / rate‑limit states are
  handled explicitly.
- **Safe by construction** — the backend API key never reaches the browser; all
  privileged calls run through server functions.
- **Responsive & theme‑aware** UI, with an FAQ built for people new to USDCx.

## Tech stack

| Layer     | Choice                                                        |
| --------- | ------------------------------------------------------------- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, SSR)  |
| Build     | [Vite](https://vitejs.dev)                                    |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Chain     | [@stacks/connect](https://www.npmjs.com/package/@stacks/connect) + [@stacks/transactions](https://www.npmjs.com/package/@stacks/transactions) |


## Architecture

The browser never talks to the faucet backend directly. Claims and health
checks go through **TanStack Start server functions** ([src/lib/faucet.functions.ts](src/lib/faucet.functions.ts)),
which run server‑side and attach the secret `x-api-key` header
([src/lib/faucet.server.ts](src/lib/faucet.server.ts)). The **faucet pool balance**
is read directly in the browser from the public Hiro testnet API
([src/lib/faucet-pool.ts](src/lib/faucet-pool.ts)) — no credentials, and shown
regardless of whether a wallet is connected.

```
Browser ──▶ Server function ──(x-api-key)──▶ Faucet backend (claims, health)
        └─▶ Hiro testnet API (public) ──────▶ faucet pool balance
```

The faucet backend itself is a **separate service** and is not part of this
repository. This app only needs its base URL and API key (see below).

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) (the repo ships a `pnpm-lock.yaml`; npm also works)

### Install

```sh
pnpm install
```

### Configure environment

```sh
cp .env.example .env
```

Then edit `.env` with your values:

| Variable               | Required | Description                                                        |
| ---------------------- | -------- | ------------------------------------------------------------------ |
| `FAUCET_API_KEY`       | ✅       | API key for the faucet backend. **Server‑side only** — never prefix with `VITE_`. |
| `FAUCET_API_BASE_URL`  | ⬜       | Faucet backend base URL. Defaults to the production URL if unset.   |

> `.env` is git‑ignored. Never commit real secrets — set them in `.env` locally
> and in your host's secret store in production.

### Run

```sh
pnpm dev
```

The app runs at the URL Vite prints (default `http://localhost:3000`).

## Scripts

| Script               | Does                                        |
| -------------------- | ------------------------------------------- |
| `pnpm dev`           | Start the dev server                        |
| `pnpm build`         | Production build                            |
| `pnpm build:dev`     | Build in development mode                   |
| `pnpm preview`       | Preview the production build locally        |
| `pnpm lint`          | Run ESLint                                  |
| `pnpm format`        | Format with Prettier                        |

## Project structure

```
src/
├── routes/
│   ├── __root.tsx        # App shell: navbar, footer, providers, toaster
│   └── index.tsx         # Faucet page (hero, claim panel, FAQ)
├── components/
│   ├── layout/           # Navbar, Footer
│   ├── faucet/           # AddressField, TokenCard, CopyButton
│   └── ui/               # shadcn/ui primitives
├── lib/
│   ├── faucet-tokens.ts  # Token config (symbol, amount, cooldown, copy)
│   ├── faucet-pool.ts    # Reads the faucet wallet's on-chain USDCx balance
│   ├── faucet.functions.ts # Server functions: claim, health
│   ├── faucet.server.ts  # Server-only backend client (holds the API key)
│   ├── stacks-address.ts # Testnet address validation
│   ├── error-capture.ts  # SSR error recovery around h3
│   └── error-page.ts     # SSR error page rendering
├── server.ts             # SSR request handler (error wrapper)
└── start.ts              # TanStack Start instance
```

## Configuring tokens

Tokens shown on the page are defined in [src/lib/faucet-tokens.ts](src/lib/faucet-tokens.ts).
`defaultAmount` is **display only** — the amount actually sent is decided by the
faucet backend and confirmed in the claim response. Additional tokens (e.g. STX,
sBTC) are present but commented out; uncomment to re‑enable them.

The faucet **pool balance** (wallet + USDCx contract + decimals) is configured in
the `POOL` constant in [src/lib/faucet-pool.ts](src/lib/faucet-pool.ts).

## Deployment

This app targets **Netlify** and builds its SSR server function via
`@netlify/vite-plugin-tanstack-start` (see [vite.config.ts](vite.config.ts)).

1. Connect the repo to Netlify (build command `pnpm build`).
2. Set `FAUCET_API_KEY` (and `FAUCET_API_BASE_URL` if overriding) in the
   Netlify environment.
3. Add your deployed origin to the faucet backend's `ALLOWED_ORIGINS`, or
   requests will fail with `403`.

## Disclaimer

This faucet is for **Stacks testnet only**. The USDCx it distributes has no
monetary value and is intended solely for development and testing.
