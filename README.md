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

- Core: `0xb7686193A5756D79f54cff6C79deF07d7feCF1Bb`
- ReputationRegistry: `0x31012ff6238195F48AD809C935E52D2c9A1Ce569`
- Lending: `0x55Fcfb8f43708b7Abd8440E47fA3E0a89396874c`
- LP: `0xB6B8e039C5288318fEe5FDeC9C8bDd17757ee716`
- GAD: `0x3595220DEE5535A0Dc8E81c73FC1399fd18c5681`
- X402Receipt: `0x71918F82E7f8203aa3D13223d843fbbab4b2ba5C`

Tokens used in the demo:

- USDC.e: `0x2e08028E3C4c2356572E096d8EF835cD5C6030bD6`
- WBTC: `0x4512eaCD4186b025186e1cF6cc0D89497c530e87`

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

## Demo flow

See `docs/DEMO_FLOW.md`.

## Docs

- USDC: `docs/USDC.md`
- Reputation (ERC-8004): `docs/REPUTATION_ERC8004.md`
- x402 Flow: `docs/X402_FLOW.md`
