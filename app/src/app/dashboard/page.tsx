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
    <main className="min-h-screen bg-[#001520] text-white px-6 py-16">
      <h1 className="text-3xl font-bold">Dashboard (EVM)</h1>
      <p className="mt-4 text-[#8a9aa8]">Connected: {isConnected ? address : 'not connected'}</p>

      <div className="mt-6 flex gap-3">
        {!isConnected ? (
          <button className="px-4 py-2 bg-white text-black rounded" onClick={() => connect({ connector: injected() })}>
            Connect Wallet
          </button>
        ) : (
          <button className="px-4 py-2 bg-white text-black rounded" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div className="mt-8">
        <label className="text-sm text-[#8a9aa8]">Amount (USDC)</label>
        <input
          className="block mt-2 px-3 py-2 rounded text-black"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="mt-8 grid gap-3 max-w-md">
        <button className="px-4 py-2 bg-[#FF4E00] rounded" onClick={async () => {
          await writeContractAsync({
            address: lending,
            abi: lendingAbi,
            functionName: 'initializePosition',
            args: [],
          });
        }}>Initialize Position</button>

        <button className="px-4 py-2 bg-[#0a2535] rounded" onClick={async () => {
          await writeContractAsync({
            address: usdc,
            abi: erc20Abi,
            functionName: 'approve',
            args: [lending, toUSDC(amount)],
          });
        }}>Approve USDC → Lending</button>

        <button className="px-4 py-2 bg-[#0a2535] rounded" onClick={async () => {
          await writeContractAsync({
            address: lending,
            abi: lendingAbi,
            functionName: 'deposit',
            args: [usdc, toUSDC(amount)],
          });
        }}>Deposit USDC (collateral)</button>

        <button className="px-4 py-2 bg-[#0a2535] rounded" onClick={async () => {
          await writeContractAsync({
            address: lending,
            abi: lendingAbi,
            functionName: 'borrow',
            args: [usdc, toUSDC(amount)],
          });
        }}>Borrow USDC</button>

        <button className="px-4 py-2 bg-[#0a2535] rounded" onClick={async () => {
          await writeContractAsync({
            address: usdc,
            abi: erc20Abi,
            functionName: 'approve',
            args: [lending, toUSDC(amount)],
          });
        }}>Approve USDC → Repay</button>

        <button className="px-4 py-2 bg-[#0a2535] rounded" onClick={async () => {
          await writeContractAsync({
            address: lending,
            abi: lendingAbi,
            functionName: 'repay',
            args: [usdc, toUSDC(amount), toUSDC(amount)],
          });
        }}>Repay USDC</button>

        <button className="px-4 py-2 bg-[#0a2535] rounded" onClick={async () => {
          await writeContractAsync({
            address: usdc,
            abi: erc20Abi,
            functionName: 'approve',
            args: [lp, toUSDC(amount)],
          });
        }}>Approve USDC → LP</button>

        <button className="px-4 py-2 bg-[#0a2535] rounded" onClick={async () => {
          await writeContractAsync({
            address: lp,
            abi: lpAbi,
            functionName: 'deposit',
            args: [toUSDC(amount)],
          });
        }}>LP Deposit</button>

        <button className="px-4 py-2 bg-[#0a2535] rounded" onClick={async () => {
          await writeContractAsync({
            address: lp,
            abi: lpAbi,
            functionName: 'withdraw',
            args: [toUSDC(amount)],
          });
        }}>LP Withdraw (shares)</button>
      </div>

      <div className="mt-10">
        <Link href="/" className="underline">Back</Link>
      </div>
    </main>
  );
}
