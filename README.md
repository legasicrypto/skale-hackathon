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

- Core: `0x67B2A0975eC1C904Aac6698a70588189Cb16D0bC`
- ReputationRegistry: `0x4E0aDada1456970741782bBfbFbaf504aa6464df`
- Lending: `0xDb3D91d87f836a082904d58D44b0B16d0a5B19EA`
- LP: `0x785bB8D1724143A21CfbfA6EE24d8FF2695B482d`
- GAD: `0xc8A43cAEe96Fc32D51C1c2e23f3D9aD38e71c750`
- X402Receipt: `0x9ddc81fd1A9bE220702929ed0Aaf097c793938E0`

Tokens used in the demo:

- USDC.e: `0x2e08028E3C4c2356572E096d8EF835cD5C6030bD6`
- WBTC: `0x4512eaCD4186b025186e1cF6cc0D89497c530e87`
- WETH: `0xaEc8Fd44FeB4377BE90c168352497e98741Df59a`

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

## Agent skill (EVM)

`skills/legasi-lending-evm/SKILL.md`

## Docs

- USDC: `docs/USDC.md`
- Reputation (ERC-8004): `docs/REPUTATION_ERC8004.md`
- x402 Flow: `docs/X402_FLOW.md`
