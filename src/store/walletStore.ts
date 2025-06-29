import { create } from 'zustand';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  connectWallet: (address) => set({ address, isConnected: true }),
  disconnectWallet: () => set({ address: null, isConnected: false }),
})); 