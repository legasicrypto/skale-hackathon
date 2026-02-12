'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm flex items-center gap-3 animate-slide-up ${
      type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
    }`}>
      <span className="text-xl">{type === 'success' ? '✅' : '❌'}</span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const usdc = CONTRACTS.usdc as `0x${string}`;
  const lending = CONTRACTS.lending as `0x${string}`;
  const lp = CONTRACTS.lp as `0x${string}`;

  const [mainTab, setMainTab] = useState<'borrow' | 'lp'>('borrow');
  const [actionTab, setActionTab] = useState<'supply' | 'borrow' | 'repay' | 'withdraw'>('supply');
  const [lpTab, setLpTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [amount, setAmount] = useState('10');
  const [borrowAmount, setBorrowAmount] = useState('10');
  const [repayAmount, setRepayAmount] = useState('10');
  const [lpAmount, setLpAmount] = useState('10');

  const toUSDC = (v: string) => parseUnits(v || '0', 6);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  async function safeTx(fn: () => Promise<unknown>, label: string) {
    try {
      await fn();
      showToast(`${label} submitted`, 'success');
    } catch (e) {
      showToast(`${label} failed`, 'error');
    }
  }

  return (
    <div className="min-h-screen bg-[#001520] text-white flex flex-col gradient-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#001520]/80 backdrop-blur-xl border-b border-[#0a2535]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/legasi-logo.svg" alt="Legasi" className="h-7 w-auto" />
            <span className="text-sm text-[#5a6a78]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/faucet" className="text-sm text-[#8a9aa8] hover:text-white">Faucet</a>
            {!isConnected ? (
              <button className="h-9 px-4 bg-white text-black rounded-lg" onClick={() => connect({ connector: injected() })}>
                Connect Wallet
              </button>
            ) : (
              <button className="h-9 px-4 bg-white text-black rounded-lg" onClick={() => disconnect()}>
                Disconnect
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Agent Credit + Yield</h1>
              <p className="text-[#8a9aa8] mt-2">SKALE Base Sepolia • ETH / WBTC collateral • USDC.e borrow</p>
            </div>
            <div className="flex gap-3">
              <a href="/faucet" className="h-11 px-5 bg-[#FF4E00] hover:bg-[#E64500] rounded-lg font-semibold flex items-center">Run demo</a>
              <a href="https://github.com/legasicrypto/skale-hackathon" target="_blank" className="h-11 px-5 bg-[#0a2535] border border-[#1a3545] rounded-lg flex items-center">Docs</a>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mt-10">
            <KPI title="Collateral" value="$0" sub="ETH + WBTC" />
            <KPI title="Borrowed" value="$0" sub="USDC.e" />
            <KPI title="Health Factor" value="—" sub="Target > 1.2" />
            <KPI title="Reputation" value="0" sub="Build to unlock LTV bonus" />
          </div>

          <div className="mt-8 flex gap-3">
            <TabButton active={mainTab === 'borrow'} onClick={() => setMainTab('borrow')}>Borrow</TabButton>
            <TabButton active={mainTab === 'lp'} onClick={() => setMainTab('lp')}>LP Vault</TabButton>
          </div>

          {mainTab === 'borrow' && (
            <div className="grid lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-1 p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
                <h2 className="text-lg font-semibold">Position</h2>
                <p className="text-sm text-[#6a7a88] mt-1">Initialize once to create your on-chain position.</p>
                <button
                  className="mt-4 w-full h-11 bg-[#FF4E00] hover:bg-[#E64500] rounded-lg font-semibold"
                  onClick={() => safeTx(() => writeContractAsync({ address: lending, abi: lendingAbi, functionName: 'initializePosition', args: [] }), 'Initialize position')}
                >
                  Initialize Position
                </button>
                <div className="mt-6 text-sm text-[#8a9aa8]">Connected: {isConnected ? address : 'not connected'}</div>
              </div>

              <div className="lg:col-span-2 p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Credit Actions</h2>
                  <div className="flex gap-2">
                    <SmallTab active={actionTab === 'supply'} onClick={() => setActionTab('supply')}>Supply</SmallTab>
                    <SmallTab active={actionTab === 'borrow'} onClick={() => setActionTab('borrow')}>Borrow</SmallTab>
                    <SmallTab active={actionTab === 'repay'} onClick={() => setActionTab('repay')}>Repay</SmallTab>
                    <SmallTab active={actionTab === 'withdraw'} onClick={() => setActionTab('withdraw')}>Withdraw</SmallTab>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Amount (USDC.e)" value={amount} onChange={setAmount} />
                  <Field label="Amount to borrow" value={borrowAmount} onChange={setBorrowAmount} />
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  <Action
                    label="Approve USDC.e"
                    onClick={() => safeTx(() => writeContractAsync({ address: usdc, abi: erc20Abi, functionName: 'approve', args: [lending, toUSDC(amount)] }), 'Approve USDC.e')}
                  />
                  <Action
                    label="Deposit Collateral"
                    onClick={() => safeTx(() => writeContractAsync({ address: lending, abi: lendingAbi, functionName: 'deposit', args: [usdc, toUSDC(amount)] }), 'Deposit collateral')}
                  />
                  <Action
                    label="Borrow USDC.e"
                    onClick={() => safeTx(() => writeContractAsync({ address: lending, abi: lendingAbi, functionName: 'borrow', args: [usdc, toUSDC(borrowAmount)] }), 'Borrow USDC.e')}
                  />
                  <Action
                    label="Approve Repay"
                    onClick={() => safeTx(() => writeContractAsync({ address: usdc, abi: erc20Abi, functionName: 'approve', args: [lending, toUSDC(repayAmount)] }), 'Approve repay')}
                  />
                  <Action
                    label="Repay USDC.e"
                    onClick={() => safeTx(() => writeContractAsync({ address: lending, abi: lendingAbi, functionName: 'repay', args: [usdc, toUSDC(repayAmount), toUSDC(repayAmount)] }), 'Repay')}
                  />
                </div>
              </div>
            </div>
          )}

          {mainTab === 'lp' && (
            <div className="p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">LP Vault</h2>
                <div className="flex gap-2">
                  <SmallTab active={lpTab === 'deposit'} onClick={() => setLpTab('deposit')}>Deposit</SmallTab>
                  <SmallTab active={lpTab === 'withdraw'} onClick={() => setLpTab('withdraw')}>Withdraw</SmallTab>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Field label="Amount (USDC.e)" value={lpAmount} onChange={setLpAmount} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <Action
                  label="Approve USDC.e → LP"
                  onClick={() => safeTx(() => writeContractAsync({ address: usdc, abi: erc20Abi, functionName: 'approve', args: [lp, toUSDC(lpAmount)] }), 'Approve LP')}
                />
                <Action
                  label="LP Deposit"
                  onClick={() => safeTx(() => writeContractAsync({ address: lp, abi: lpAbi, functionName: 'deposit', args: [toUSDC(lpAmount)] }), 'LP deposit')}
                />
                <Action
                  label="LP Withdraw"
                  onClick={() => safeTx(() => writeContractAsync({ address: lp, abi: lpAbi, functionName: 'withdraw', args: [toUSDC(lpAmount)] }), 'LP withdraw')}
                />
              </div>
            </div>
          )}

          <div className="mt-10 p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
            <h2 className="text-lg font-semibold">Protocol Stats</h2>
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <KPI title="TVL" value="$—" sub="LP + Collateral" />
              <KPI title="Utilization" value="—" sub="Borrowed / LP" />
              <KPI title="Max LTV" value="75%" sub="+ reputation bonus" />
              <KPI title="Liquidations" value="GAD" sub="Gradual deleveraging" />
            </div>
          </div>

          <div className="mt-10">
            <Link href="/" className="text-sm text-[#8a9aa8] hover:text-white">← Back</Link>
          </div>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function KPI({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="p-4 bg-[#00111a]/60 border border-[#0a2535] rounded-xl">
      <div className="text-xs text-[#5a6a78] uppercase tracking-widest">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      <div className="text-xs text-[#6a7a88] mt-1">{sub}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`h-10 px-4 rounded-lg border ${active ? 'bg-[#FF4E00] border-[#FF4E00] text-white' : 'bg-[#0a2535] border-[#1a3545] text-[#8a9aa8]'}`} onClick={onClick}>
      {children}
    </button>
  );
}

function SmallTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`h-8 px-3 rounded-md text-xs border ${active ? 'bg-white text-black border-white' : 'bg-[#0a2535] border-[#1a3545] text-[#8a9aa8]'}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm text-[#8a9aa8]">
      {label}
      <input className="block mt-2 w-full px-3 py-2 rounded text-black" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Action({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="h-11 px-4 bg-[#0a2535] border border-[#1a3545] rounded-lg hover:bg-[#0d3040] text-left" onClick={onClick}>
      {label}
    </button>
  );
}
