"use client";

import { useState, useEffect, Suspense } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";
import Link from "next/link";
import { parseUnits } from "viem";
import { CONTRACTS } from "@/lib/evmContracts";

// Toast
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm flex items-center gap-3 animate-slide-up ${
      type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
    }`}>
      <span className="text-xl">{type === "success" ? "✅" : "❌"}</span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

// Wrapper for Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard />
    </Suspense>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#001520] text-white flex items-center justify-center">
      <div className="animate-pulse text-[#FF4E00]">Loading...</div>
    </div>
  );
}

const ASSET_TYPES = {
  ETH: 0,
  WBTC: 1,
  USDC: 2,
};

const PRICES = {
  ETH: 2500,
  WBTC: 45000,
  USDC: 1,
};

const BORROW_APY = {
  USDC: 8.5,
};

const SUPPLY_APY = {
  USDC: 5.2,
};

const lendingAbi = [
  { name: "initializePosition", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "deposit", type: "function", stateMutability: "nonpayable", inputs: [
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
  ], outputs: [] },
  { name: "borrow", type: "function", stateMutability: "nonpayable", inputs: [
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
  ], outputs: [] },
  { name: "repay", type: "function", stateMutability: "nonpayable", inputs: [
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "amountUsd6", type: "uint256" },
  ], outputs: [] },
] as const;

const lpAbi = [
  { name: "deposit", type: "function", stateMutability: "nonpayable", inputs: [
    { name: "amount", type: "uint256" },
  ], outputs: [] },
  { name: "withdraw", type: "function", stateMutability: "nonpayable", inputs: [
    { name: "shares", type: "uint256" },
  ], outputs: [] },
] as const;

const erc20Abi = [
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [
    { name: "spender", type: "address" },
    { name: "amount", type: "uint256" },
  ], outputs: [{ name: "ok", type: "bool" }] },
] as const;

function Dashboard() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const usdc = CONTRACTS.usdc as `0x${string}`;
  const lending = CONTRACTS.lending as `0x${string}`;
  const lp = CONTRACTS.lp as `0x${string}`;
  const wbtc = CONTRACTS.wbtc as `0x${string}`;

  const [mainTab, setMainTab] = useState<"borrow" | "lp">("borrow");
  const [actionTab, setActionTab] = useState<"supply" | "borrow" | "repay" | "withdraw">("supply");
  const [lpTab, setLpTab] = useState<"deposit" | "withdraw">("deposit");

  const [depositAmount, setDepositAmount] = useState("");
  const [depositAsset, setDepositAsset] = useState<"ETH" | "WBTC">("ETH");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [borrowAsset, setBorrowAsset] = useState<"USDC">("USDC");
  const [repayAmount, setRepayAmount] = useState("");
  const [repayAsset, setRepayAsset] = useState<"USDC">("USDC");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAsset, setWithdrawAsset] = useState<"ETH" | "WBTC">("ETH");
  const [lpAmount, setLpAmount] = useState("");
  const [lpAsset, setLpAsset] = useState<"USDC">("USDC");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => setToast({ message, type });

  const [agentConfig, setAgentConfig] = useState({
    enabled: false,
    dailyLimit: 0,
    autoRepay: false,
    x402Enabled: false,
  });

  const protocolStats = {
    lpPool: 2_000_000,
    totalCollateral: 1_500_000,
    totalBorrowed: 2_000_000,
    get tvl() { return this.lpPool + this.totalCollateral; },
    get utilization() { return (this.totalBorrowed / this.lpPool) * 100; },
  };

  const collateralValue = 0;
  const borrowedValue = 0;
  const reputationScore = agentConfig.enabled ? (agentConfig.dailyLimit === 5000 ? 200 : 100) : 0;
  const ltvBonus = reputationScore >= 400 ? 5 : reputationScore >= 200 ? 3 : reputationScore >= 100 ? 1 : 0;
  const maxLTV = 75 + ltvBonus;
  const currentLTV = collateralValue > 0 ? (borrowedValue / collateralValue) * 100 : 0;
  const healthFactor = collateralValue > 0 ? (collateralValue * maxLTV / 100) / Math.max(borrowedValue, 1) : 0;
  const maxBorrow = Math.max(0, collateralValue * maxLTV / 100 - borrowedValue);
  const maxWithdrawValue = Math.max(0, collateralValue - (borrowedValue * 100 / maxLTV));

  const toUSDC = (v: string) => parseUnits(v || "0", 6);
  const collateralToken = depositAsset === "WBTC" ? wbtc : wbtc;

  async function safeTx(fn: () => Promise<unknown>, label: string) {
    try {
      await fn();
      showToast(`${label} submitted`, "success");
    } catch (e) {
      showToast(`${label} failed`, "error");
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#001520] text-white flex flex-col gradient-bg">
        <Nav connected={false} onConnect={() => connect({ connector: injected() })} />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FF4E00]/20 rounded-full blur-3xl scale-150"></div>
            <img src="/legasi-logo.svg" alt="Legasi" className="h-16 w-auto mb-6 relative z-10" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Connect Wallet</h1>
          <p className="text-[#6a7a88] mb-8 text-center max-w-sm">
            Connect your wallet to access the Legasi protocol
          </p>
          <button className="!bg-[#FF4E00] hover:bg-[#E64500] text-white font-semibold rounded-xl h-14 px-8" onClick={() => connect({ connector: injected() })}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001520] text-white gradient-bg">
      <Nav connected address={address} onConnect={() => disconnect()} />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-8">
        {/* Protocol Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-[#051525]/50 border border-[#0a2535] rounded-xl">
          <div className="text-center">
            <div className="text-xs text-[#6a7a88] uppercase tracking-wider">Protocol TVL</div>
            <div className="text-lg font-bold text-white">${(protocolStats.tvl / 1e6).toFixed(1)}M</div>
          </div>
          <div className="text-center border-x border-[#0a2535]">
            <div className="text-xs text-[#6a7a88] uppercase tracking-wider">LP Pool</div>
            <div className="text-lg font-bold text-white">${(protocolStats.lpPool / 1e6).toFixed(1)}M</div>
          </div>
          <div className="text-center border-r border-[#0a2535]">
            <div className="text-xs text-[#6a7a88] uppercase tracking-wider">Total Borrowed</div>
            <div className="text-lg font-bold text-white">${(protocolStats.totalBorrowed / 1e6).toFixed(1)}M</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[#6a7a88] uppercase tracking-wider">Utilization</div>
            <div className="text-lg font-bold text-[#FF4E00]">{protocolStats.utilization.toFixed(0)}%</div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setMainTab("borrow")}
            className={`flex-1 py-4 rounded-xl font-medium transition-all ${
              mainTab === "borrow" ? "bg-[#FF4E00] text-white" : "bg-[#051525]/80 text-[#8a9aa8] border border-[#0a2535] hover:border-[#1a3545] hover:text-white"
            }`}
          >
            Borrow
          </button>
          <button
            onClick={() => setMainTab("lp")}
            className={`flex-1 py-4 rounded-xl font-medium transition-all ${
              mainTab === "lp" ? "bg-[#FF4E00] text-white" : "bg-[#051525]/80 text-[#8a9aa8] border border-[#0a2535] hover:border-[#1a3545] hover:text-white"
            }`}
          >
            Provide Liquidity
          </button>
        </div>

        {mainTab === "borrow" && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <MetricCard label="Supplied" value={`$${collateralValue.toFixed(2)}`} />
              <MetricCard label="Borrowed" value={`$${borrowedValue.toFixed(2)}`} />
              <MetricCard label="LTV" value={`${currentLTV.toFixed(1)}%`} subtitle={`Max: ${maxLTV}%`} color="#FF4E00" />
              <MetricCard label="Health" value={healthFactor > 100 ? "Safe" : healthFactor.toFixed(2)} color="#ffd93d" />
              <MetricCard label="Reputation" value={Math.floor(reputationScore).toString()} subtitle={ltvBonus > 0 ? `+${ltvBonus}% LTV` : undefined} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex gap-1 p-1 bg-[#051525] border border-[#0a2535] rounded-xl mb-6">
                  {(["supply", "borrow", "repay", "withdraw"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActionTab(tab)}
                      className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        actionTab === tab ? "bg-[#FF4E00] text-white shadow-lg shadow-[#FF4E00]/20" : "text-[#6a7a88] hover:text-white hover:bg-[#0a2535]"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl backdrop-blur-sm card-shine">
                  {/* Supply */}
                  {actionTab === "supply" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Supply Collateral</h3>
                      <p className="text-sm text-[#6a7a88] mb-6">Deposit collateral to borrow against</p>
                      <div className="flex gap-2 mb-4">
                        {(["ETH", "WBTC"] as const).map((asset) => (
                          <button
                            key={asset}
                            onClick={() => setDepositAsset(asset)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              depositAsset === asset ? "bg-[#FF4E00]/20 text-[#FF4E00] border border-[#FF4E00]" : "bg-[#001520] text-[#6a7a88] border border-[#0a2535] hover:border-[#FF4E00]/30"
                            }`}
                          >
                            {asset}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <input type="number" placeholder="0.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full h-14 bg-[#001520] border border-[#0a2535] rounded-xl px-4 pr-20 text-white placeholder-[#3a4a58] focus:outline-none focus:border-[#FF4E00] transition-all" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6a7a88] text-sm font-medium">{depositAsset}</span>
                        </div>
                        <button onClick={() => safeTx(() => writeContractAsync({ address: collateralToken, abi: erc20Abi, functionName: "approve", args: [lending, toUSDC(depositAmount)] }), "Approve")}
                          disabled={!depositAmount}
                          className="h-14 px-6 bg-[#0a2535] hover:bg-[#1a3545] text-[#FF4E00] font-medium rounded-xl transition-all">
                          Approve
                        </button>
                        <button onClick={() => safeTx(() => writeContractAsync({ address: lending, abi: lendingAbi, functionName: "deposit", args: [collateralToken, toUSDC(depositAmount)] }), "Supply")}
                          disabled={!depositAmount}
                          className="h-14 px-8 bg-[#FF4E00] hover:bg-[#E64500] text-white font-semibold rounded-xl transition-all hover:scale-105 disabled:bg-[#0a2535] disabled:text-[#3a4a58] disabled:hover:scale-100">
                          Supply
                        </button>
                      </div>
                      <div className="mt-3 text-xs text-[#6a7a88]">≈ ${(parseFloat(depositAmount || "0") * PRICES[depositAsset]).toFixed(2)} USD</div>
                    </div>
                  )}

                  {/* Borrow */}
                  {actionTab === "borrow" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Borrow</h3>
                      <p className="text-sm text-[#6a7a88] mb-6">Borrow stablecoins against your collateral</p>
                      <div className="flex gap-2 mb-4">
                        {(["USDC"] as const).map((asset) => (
                          <button key={asset} onClick={() => setBorrowAsset(asset)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-[#FF4E00]/20 text-[#FF4E00] border border-[#FF4E00]">
                            USDC.e <span className="text-xs opacity-60">{BORROW_APY.USDC}% APY</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                          <input type="number" placeholder="0.00" value={borrowAmount} onChange={(e) => setBorrowAmount(e.target.value)} className="w-full h-14 bg-[#001520] border border-[#0a2535] rounded-xl px-4 pr-20 text-white placeholder-[#3a4a58] focus:outline-none focus:border-[#FF4E00] transition-all" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6a7a88] text-sm font-medium">USDC.e</span>
                        </div>
                        <button onClick={() => setBorrowAmount(maxBorrow.toFixed(2))} className="h-14 px-4 bg-[#0a2535] hover:bg-[#1a3545] text-[#FF4E00] font-medium rounded-xl transition-all">MAX</button>
                        <button onClick={() => safeTx(() => writeContractAsync({ address: lending, abi: lendingAbi, functionName: "borrow", args: [usdc, toUSDC(borrowAmount)] }), "Borrow")}
                          disabled={!borrowAmount}
                          className="h-14 px-8 bg-[#FF4E00] hover:bg-[#E64500] text-white font-semibold rounded-xl transition-all hover:scale-105 disabled:bg-[#0a2535] disabled:text-[#3a4a58] disabled:hover:scale-100">
                          Borrow
                        </button>
                      </div>
                      <div className="p-4 bg-[#001520]/50 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-[#6a7a88]">Available to borrow</span><span className="text-[#FF4E00] font-semibold">${maxBorrow.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-[#6a7a88]">Borrow APY</span><span className="text-white">{BORROW_APY.USDC}%</span></div>
                      </div>
                    </div>
                  )}

                  {/* Repay */}
                  {actionTab === "repay" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Repay</h3>
                      <p className="text-sm text-[#6a7a88] mb-6">Repay your borrowed amount to unlock collateral</p>
                      <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                          <input type="number" placeholder="0.00" value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)} className="w-full h-14 bg-[#001520] border border-[#0a2535] rounded-xl px-4 pr-20 text-white placeholder-[#3a4a58] focus:outline-none focus:border-[#4ade80] transition-all" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6a7a88] text-sm font-medium">USDC.e</span>
                        </div>
                        <button onClick={() => safeTx(() => writeContractAsync({ address: usdc, abi: erc20Abi, functionName: "approve", args: [lending, toUSDC(repayAmount)] }), "Approve repay")}
                          disabled={!repayAmount}
                          className="h-14 px-4 bg-[#0a2535] hover:bg-[#1a3545] text-[#4ade80] font-medium rounded-xl transition-all">Approve</button>
                        <button onClick={() => safeTx(() => writeContractAsync({ address: lending, abi: lendingAbi, functionName: "repay", args: [usdc, toUSDC(repayAmount), toUSDC(repayAmount)] }), "Repay")}
                          disabled={!repayAmount}
                          className="h-14 px-8 bg-[#4ade80] hover:bg-[#22c55e] text-black font-semibold rounded-xl transition-all hover:scale-105 disabled:bg-[#0a2535] disabled:text-[#3a4a58] disabled:hover:scale-100">Repay</button>
                      </div>
                    </div>
                  )}

                  {/* Withdraw */}
                  {actionTab === "withdraw" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Withdraw Collateral</h3>
                      <p className="text-sm text-[#6a7a88] mb-6">Withdraw your supplied collateral</p>
                      <div className="flex gap-2 mb-4">
                        {(["ETH", "WBTC"] as const).map((asset) => (
                          <button key={asset} onClick={() => setWithdrawAsset(asset)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${withdrawAsset === asset ? "bg-[#FF4E00]/20 text-[#FF4E00] border border-[#FF4E00]" : "bg-[#001520] text-[#6a7a88] border border-[#0a2535] hover:border-[#FF4E00]/30"}`}>{asset}</button>
                        ))}
                      </div>
                      <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                          <input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full h-14 bg-[#001520] border border-[#0a2535] rounded-xl px-4 pr-20 text-white placeholder-[#3a4a58] focus:outline-none focus:border-[#FF4E00] transition-all" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6a7a88] text-sm font-medium">{withdrawAsset}</span>
                        </div>
                        <button disabled className="h-14 px-8 bg-[#0a2535] text-[#3a4a58] font-semibold rounded-xl">Withdraw</button>
                      </div>
                      <div className="p-4 bg-[#001520]/50 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-[#6a7a88]">Total collateral value</span><span className="text-white font-semibold">${collateralValue.toFixed(2)}</span></div>
                        {borrowedValue > 0 && (
                          <div className="flex justify-between text-sm"><span className="text-[#6a7a88]">Max withdrawable</span><span className="text-[#FF4E00] font-semibold">${maxWithdrawValue.toFixed(2)}</span></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Agent Configuration */}
                <div className="mt-6 p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-white">Agent Configuration</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${agentConfig.enabled ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20" : "bg-[#3a4a58]/20 text-[#6a7a88] border border-[#3a4a58]/20"}`}>
                      {agentConfig.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <AgentButton title="Standard" description="$1,000/day" active={agentConfig.enabled && agentConfig.dailyLimit === 1000} onClick={() => setAgentConfig({ enabled: true, dailyLimit: 1000, autoRepay: true, x402Enabled: true })} />
                    <AgentButton title="Pro" description="$5,000/day" highlighted active={agentConfig.enabled && agentConfig.dailyLimit === 5000} onClick={() => setAgentConfig({ enabled: true, dailyLimit: 5000, autoRepay: true, x402Enabled: true })} />
                    <AgentButton title="Disable" description="Manual only" active={!agentConfig.enabled} onClick={() => setAgentConfig({ enabled: false, dailyLimit: 0, autoRepay: false, x402Enabled: false })} />
                  </div>
                  {agentConfig.enabled && (
                    <div className="mt-4 p-4 bg-[#001520]/50 rounded-xl text-xs text-[#8a9aa8] space-y-2">
                      <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#4ade80]"></div>Auto-repay enabled</div>
                      <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#4ade80]"></div>x402 payments enabled</div>
                      <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#4ade80]"></div>Daily limit: ${agentConfig.dailyLimit.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="p-5 bg-[#051525]/80 border border-[#0a2535] rounded-2xl backdrop-blur-sm">
                  <h3 className="text-sm font-medium text-[#8a9aa8] mb-4">Your Positions</h3>
                  <div className="mb-4">
                    <div className="text-xs text-[#6a7a88] mb-2">Collateral</div>
                    <div className="text-sm text-[#3a4a58]">No collateral supplied</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#6a7a88] mb-2">Borrowed</div>
                    <div className="text-sm text-[#3a4a58]">No active borrows</div>
                  </div>
                </div>

                <div className="p-5 bg-[#051525]/80 border border-[#0a2535] rounded-2xl backdrop-blur-sm">
                  <h3 className="text-sm font-medium text-[#8a9aa8] mb-4">Reputation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[#6a7a88]">Score</span><span>{Math.floor(reputationScore)}</span></div>
                    <div className="flex justify-between"><span className="text-[#6a7a88]">Repayments</span><span>0</span></div>
                    <div className="flex justify-between"><span className="text-[#6a7a88]">GAD Events</span><span>0</span></div>
                    <div className="flex justify-between"><span className="text-[#6a7a88]">Account Age</span><span>0d</span></div>
                    <div className="flex justify-between"><span className="text-[#6a7a88]">LTV Bonus</span><span className="text-[#FF4E00]">+{ltvBonus}%</span></div>
                  </div>
                </div>

                <div className="p-5 bg-[#051525]/80 border border-[#0a2535] rounded-2xl backdrop-blur-sm">
                  <h3 className="text-sm font-medium text-[#8a9aa8] mb-3">GAD Protection</h3>
                  <p className="text-xs text-[#6a7a88]">No sudden liquidations. Your position is unwound gradually, protecting you from MEV attacks.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {mainTab === "lp" && (
          <div className="p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">LP Vault</h2>
              <div className="flex gap-2">
                <SmallTab active={lpTab === "deposit"} onClick={() => setLpTab("deposit")}>Deposit</SmallTab>
                <SmallTab active={lpTab === "withdraw"} onClick={() => setLpTab("withdraw")}>Withdraw</SmallTab>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <label className="text-sm text-[#8a9aa8]">Amount (USDC.e)
                <input className="block mt-2 w-full px-3 py-2 rounded text-black" value={lpAmount} onChange={(e) => setLpAmount(e.target.value)} />
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <Action label="Approve USDC.e → LP" onClick={() => safeTx(() => writeContractAsync({ address: usdc, abi: erc20Abi, functionName: "approve", args: [lp, toUSDC(lpAmount)] }), "Approve LP")} />
              <Action label="LP Deposit" onClick={() => safeTx(() => writeContractAsync({ address: lp, abi: lpAbi, functionName: "deposit", args: [toUSDC(lpAmount)] }), "LP deposit")} />
              <Action label="LP Withdraw" onClick={() => safeTx(() => writeContractAsync({ address: lp, abi: lpAbi, functionName: "withdraw", args: [toUSDC(lpAmount)] }), "LP withdraw")} />
            </div>
          </div>
        )}

        <div className="mt-10">
          <Link href="/" className="text-sm text-[#8a9aa8] hover:text-white">← Back</Link>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function Nav({ connected, onConnect, address }: { connected: boolean; onConnect: () => void; address?: string }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#001520]/80 backdrop-blur-xl border-b border-[#0a2535]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/legasi-logo.svg" alt="Legasi" className="h-7 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <a href="/faucet" className="text-sm text-[#8a9aa8] hover:text-white">Faucet</a>
          {!connected ? (
            <button className="h-9 px-4 bg-[#FF4E00] hover:bg-[#E64500] text-white rounded-xl font-semibold" onClick={onConnect}>Connect Wallet</button>
          ) : (
            <button className="h-9 px-4 bg-[#FF4E00] hover:bg-[#E64500] text-white rounded-xl font-semibold">{address?.slice(0, 6)}…{address?.slice(-4)}</button>
          )}
        </div>
      </div>
    </nav>
  );
}

function MetricCard({ label, value, subtitle, color }: { label: string; value: string; subtitle?: string; color?: string }) {
  return (
    <div className="p-4 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
      <div className="text-xs text-[#6a7a88] uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold" style={{ color: color || "#fff" }}>{value}</div>
      {subtitle && <div className="text-xs text-[#6a7a88] mt-1">{subtitle}</div>}
    </div>
  );
}

function AgentButton({ title, description, active, highlighted, onClick }: { title: string; description: string; active?: boolean; highlighted?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`p-4 rounded-xl text-sm font-medium border transition-all ${
      active ? "bg-[#FF4E00]/20 text-[#FF4E00] border-[#FF4E00]" : highlighted ? "bg-[#001520] border-[#0a2535] hover:border-[#FF4E00]/40" : "bg-[#001520] border-[#0a2535] hover:border-[#1a3545]"
    }`}>
      <div>{title}</div>
      <div className="text-xs text-[#6a7a88] mt-1">{description}</div>
    </button>
  );
}

function SmallTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`h-8 px-3 rounded-md text-xs border ${active ? "bg-white text-black border-white" : "bg-[#0a2535] border-[#1a3545] text-[#8a9aa8]"}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Action({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="h-11 px-4 bg-[#0a2535] border border-[#1a3545] rounded-lg hover:bg-[#0d3040] text-left" onClick={onClick}>
      {label}
    </button>
  );
}
