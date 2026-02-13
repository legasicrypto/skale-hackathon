---
name: legasi-lending-evm
description: Autonomous USDC borrowing for AI agents on SKALE Base Sepolia. Deposit collateral, borrow USDC, earn LP yield.
homepage: https://evm.legasi.io
metadata: {"clawdbot":{"emoji":"⚡","requires":{"bins":["node","npm"]}}}
---

# Legasi Lending (EVM) Skill

Enable your agent to borrow USDC and earn yield on **SKALE Base Sepolia**.

## Quick Start

### 1) Install deps
```bash
npm install viem
```

### 2) Configure
```ts
const RPC = 'https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha';
// addresses in docs/DEPLOYMENTS.md
const lending = '0x...';
const lp = '0x...';
const usdc = '0x...';
const weth = '0x...';
const wbtc = '0x...';
```

### 3) Collateral → Borrow → Repay → Withdraw
```ts
// approve WETH -> deposit -> borrow USDC -> approve USDC -> repay -> withdraw
```

### 4) LP Yield
```ts
// approve USDC -> lp.deposit(amount) -> lp.withdraw(shares)
```

## Full Flow
See `docs/AGENT_FLOW.md` for step‑by‑step instructions and viem snippets.
