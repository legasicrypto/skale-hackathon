"use client";

import { useState } from "react";

// Minimal EVM placeholder hook (to be wired with contracts)
export function useLegasi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noop = async () => {
    setLoading(true);
    setError(null);
    try {
      // placeholder
      return "0x";
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    connected: true,
    initializePosition: noop,
    depositSol: noop,
    depositToken: noop,
    borrow: noop,
    repay: noop,
    withdrawSol: noop,
    configureAgent: noop,
    lpDeposit: noop,
    lpWithdraw: noop,
    ltv: 0,
    hasPosition: false,
  };
}
