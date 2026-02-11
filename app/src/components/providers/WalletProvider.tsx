'use client';

import { FC, ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Chain } from 'viem';

interface Props {
  children: ReactNode;
}

const skaleBaseSepolia: Chain = {
  id: 324705682,
  name: 'SKALE Base Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha'] },
    public: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha'] },
  },
  blockExplorers: {
    default: { name: 'SKALE Explorer', url: 'https://base-sepolia-testnet-explorer.skalenodes.com/' },
  },
};

const config = createConfig({
  chains: [skaleBaseSepolia],
  connectors: [injected()],
  transports: {
    [skaleBaseSepolia.id]: http(),
  },
});

export const WalletProvider: FC<Props> = ({ children }) => {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};
