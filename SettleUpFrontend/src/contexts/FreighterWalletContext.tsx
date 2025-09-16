
import React, { createContext, useContext, type ReactNode } from 'react';
import { useFreighterTestWallet } from '../hooks/useFreighterTestWallet';

type FreighterWalletContextType = ReturnType<typeof useFreighterTestWallet>;

const FreighterWalletContext = createContext<FreighterWalletContextType | undefined>(undefined);

interface FreighterWalletProviderProps {
  children: ReactNode;
}

export const FreighterWalletProvider: React.FC<FreighterWalletProviderProps> = ({ children }) => {
  const walletData = useFreighterTestWallet();

  return (
    <FreighterWalletContext.Provider value={walletData}>
      {children}
    </FreighterWalletContext.Provider>
  );
};

export const useFreighterWallet = (): FreighterWalletContextType => {
  const context = useContext(FreighterWalletContext);
  if (context === undefined) {
    throw new Error('useFreighterWallet must be used within a FreighterWalletProvider');
  }
  return context;
};