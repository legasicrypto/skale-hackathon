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

- Core: `0xCdde86db257B39Bc186CC18644da97A35080a7ec`
- ReputationRegistry: `0xE1cE81623db56Afd7e1A6FC9D6DF948c00E3d68E`
- Lending: `0x896A7103E7894d36861ec80BEbd2c38F1Fa315Be`
- LP: `0x951DFC3dBa6a3b58dc3C369637B7a2F8b4b14756`
- GAD: `0xcb1a3909fCe7fdd53bb61961eDA461204dB85BB5`
- X402Receipt: `0xae00c527e7d72B4211ed1aD83A4834e1b4599d88`

Tokens used in the demo:

- USDC (mock): `0xb171eF34467516d24717D2BD5B14702AFfA1fB87`
- WBTC (mock): `0xaB400D5333aa66802f8CC7834EF23EBBb4425E2B`
- WETH (mock): `0x6F1a44560dc6644e3e958d3Ae6b30048a1bFC5d3`

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
