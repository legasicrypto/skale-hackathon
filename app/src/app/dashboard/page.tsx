'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseUnits } from 'viem';
import { CONTRACTS } from '@/lib/evmContracts';

const lendingAbi = [
  { name: 'initializePosition', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'deposit', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ], outputs: [] },
  { name: 'borrow', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ], outputs: [] },
  { name: 'repay', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'amountUsd6', type: 'uint256' },
  ], outputs: [] },
] as const;

const lpAbi = [
  { name: 'deposit', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'amount', type: 'uint256' },
  ], outputs: [] },
  { name: 'withdraw', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'shares', type: 'uint256' },
  ], outputs: [] },
] as const;

const erc20Abi = [
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'spender', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ], outputs: [{ name: 'ok', type: 'bool' }] },
] as const;

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount] = useState('10');

  const usdc = CONTRACTS.usdc as `0x${string}`;
  const lending = CONTRACTS.lending as `0x${string}`;
  const lp = CONTRACTS.lp as `0x${string}`;

  const toUSDC = (v: string) => parseUnits(v || '0', 6);

  return (
    <main className="min-h-screen bg-[#001520] text-white">
      <section className="px-6 pt-24 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#5a6a78]">Dashboard</p>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">Agent Credit + Yield</h1>
              <p className="text-[#8a9aa8] mt-3">Run the end‑to‑end demo on SKALE Base Sepolia.</p>
            </div>
            <div className="flex items-center gap-3">
              {!isConnected ? (
                <button className="h-11 px-5 bg-white text-black rounded-lg" onClick={() => connect({ connector: injected() })}>
                  Connect Wallet
                </button>
              ) : (
                <button className="h-11 px-5 bg-white text-black rounded-lg" onClick={() => disconnect()}>
                  Disconnect
                </button>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-[#5a6a78]">Connected: {isConnected ? address : 'not connected'}</p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
            <div className="text-sm text-[#8a9aa8] mb-2">Amount (USDC)</div>
            <input
              className="w-full px-3 py-2 rounded text-black"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="mt-3 text-xs text-[#6a7a88]">Tip: start with 10 USDC for the demo.</div>
            <div className="mt-6 grid gap-3">
              <ActionButton
                label="Initialize Position"
                tone="primary"
                onClick={async () => {
                  await writeContractAsync({
                    address: lending,
                    abi: lendingAbi,
                    functionName: 'initializePosition',
                    args: [],
                  });
                }}
              />
              <ActionButton
                label="Approve USDC → Lending"
                onClick={async () => {
                  await writeContractAsync({
                    address: usdc,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [lending, toUSDC(amount)],
                  });
                }}
              />
            </div>
          </div>

          <div className="md:col-span-2 grid gap-6">
            <div className="p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
              <h2 className="text-lg font-semibold mb-2">Credit Actions</h2>
              <p className="text-sm text-[#6a7a88] mb-5">Deposit collateral, borrow, then repay.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <ActionButton
                  label="Deposit USDC (collateral)"
                  onClick={async () => {
                    await writeContractAsync({
                      address: lending,
                      abi: lendingAbi,
                      functionName: 'deposit',
                      args: [usdc, toUSDC(amount)],
                    });
                  }}
                />
                <ActionButton
                  label="Borrow USDC"
                  onClick={async () => {
                    await writeContractAsync({
                      address: lending,
                      abi: lendingAbi,
                      functionName: 'borrow',
                      args: [usdc, toUSDC(amount)],
                    });
                  }}
                />
                <ActionButton
                  label="Approve USDC → Repay"
                  onClick={async () => {
                    await writeContractAsync({
                      address: usdc,
                      abi: erc20Abi,
                      functionName: 'approve',
                      args: [lending, toUSDC(amount)],
                    });
                  }}
                />
                <ActionButton
                  label="Repay USDC"
                  onClick={async () => {
                    await writeContractAsync({
                      address: lending,
                      abi: lendingAbi,
                      functionName: 'repay',
                      args: [usdc, toUSDC(amount), toUSDC(amount)],
                    });
                  }}
                />
              </div>
            </div>

            <div className="p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
              <h2 className="text-lg font-semibold mb-2">Yield Actions</h2>
              <p className="text-sm text-[#6a7a88] mb-5">Deposit into LP vault and withdraw shares.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <ActionButton
                  label="Approve USDC → LP"
                  onClick={async () => {
                    await writeContractAsync({
                      address: usdc,
                      abi: erc20Abi,
                      functionName: 'approve',
                      args: [lp, toUSDC(amount)],
                    });
                  }}
                />
                <ActionButton
                  label="LP Deposit"
                  onClick={async () => {
                    await writeContractAsync({
                      address: lp,
                      abi: lpAbi,
                      functionName: 'deposit',
                      args: [toUSDC(amount)],
                    });
                  }}
                />
                <ActionButton
                  label="LP Withdraw (shares)"
                  onClick={async () => {
                    await writeContractAsync({
                      address: lp,
                      abi: lpAbi,
                      functionName: 'withdraw',
                      args: [toUSDC(amount)],
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-10">
          <Link href="/" className="text-sm text-[#8a9aa8] hover:text-white">← Back</Link>
        </div>
      </section>
    </main>
  );
}

function ActionButton({ label, onClick, tone = 'secondary' }: { label: string; onClick: () => Promise<void> | void; tone?: 'primary' | 'secondary' }) {
  const base = 'h-11 px-4 rounded-lg transition-all hover:scale-[1.01]';
  const style = tone === 'primary'
    ? 'bg-[#FF4E00] text-white hover:bg-[#E64500]'
    : 'bg-[#0a2535] text-white hover:bg-[#0d3040] border border-[#1a3545]';
  return (
    <button className={`${base} ${style}`} onClick={onClick}>{label}</button>
  );
}
