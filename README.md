# Legasi – SKALE Hackathon

Agentic credit and yield infrastructure deployed on **SKALE Base Sepolia**.

## Live Demo

- App: https://evm.legasi.io

## What this is

Legasi brings agent-native credit rails to an EVM environment on SKALE:

- Borrow and repay against collateral
- On-chain reputation registry (ERC-8004 style) to improve terms over time
- Gradual Auto-Deleveraging (GAD) to reduce risk instead of hard liquidations
- LP module to deposit and withdraw into yield, designed for automated execution
- x402 receipts for HTTP 402 style payment flows

## Network

- Chain: SKALE Base Sepolia
- RPC: `https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha`

## Deployments

See `docs/DEPLOYMENTS.md` for the canonical list.

Known addresses:

- Core: `0x84d9D82d528D0E1c8c9d149577cE22be7526ca91`
- ReputationRegistry: `0xABad189F8127D24EcB98d6583e51Cc458c996Bf3`
- Lending: `0x8a99FC7e556e9eDb5a7f791558bED198124913C1`
- LP: `0x3a197F95EEED77CE9A6006FAaE89E5C86f3B90aB`
- GAD: `0x0CaFA856640274edFa9E97f8E05d7b8c80327Fe4`
- X402Receipt: `0x6810E9B16512959Fe9BAB74a8532e38450D0dA58`

Tokens used in the demo:

- USDC (mock): `0x8692A9d69113E1454C09c631AdE12949E5c11306`
- WBTC (mock): `0x7787dC83291C37d349D9523D028771914679f4C5`
- WETH (mock): `0x1eA5C029D6aea21f066D661CA7B6f5404Cd4d409`

## Repo structure

- `contracts/` smart contracts
- `scripts/` deployment + helpers
- `app/` Next.js frontend (wagmi/viem)
- `docs/` protocol + demo documentation

## Quickstart (local)

```bash
cp .env.example .env
# fill SKALE_RPC + DEPLOYER_PK + token addresses
npm install
npm run build
npm run deploy
```

## Frontend

```bash
cd app
npm install
npm run dev
```

## 5-minute demo

1) Open https://evm.legasi.io
2) Connect MetaMask on **SKALE Base Sepolia**
3) Get test tokens (USDC.e / WBTC) as described in the UI
4) Credit: deposit collateral, borrow, repay
5) Yield: deposit into the LP vault, then withdraw

## Demo flow

See `docs/DEMO_FLOW.md`.

## Agent flow (EVM)

See `docs/AGENT_FLOW.md` for the full register → LP → collateral → borrow → repay → withdraw flow.

## Coinbase Agentic Wallet

Authentication ready for `valentin@legasi.io` (manual login via `npx awal`).

## Agent skill (EVM)

`skills/legasi-lending-evm/SKILL.md`

## Docs

- USDC: `docs/USDC.md`
- Reputation (ERC-8004): `docs/REPUTATION_ERC8004.md`
- x402 Flow: `docs/X402_FLOW.md`
