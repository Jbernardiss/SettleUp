import { useState, useEffect } from 'react';
import { NFTReceipt, TripData } from '../types/nft';
import StellarNFTService from '../services/stellarNFTService';

interface UseNFTReceiptsReturn {
  receipts: NFTReceipt[];
  loading: boolean;
  error: string | null;
  addReceipt: (receipt: NFTReceipt) => void;
  removeReceipt: (receiptId: string) => void;
  verifyOwnership: (receiptId: string, userPublicKey: string) => Promise<boolean>;
  refreshReceipts: () => void;
}

/**
 * Hook personalizado para gerenciar NFT receipts
 */
export const useNFTReceipts = (): UseNFTReceiptsReturn => {
  const [receipts, setReceipts] = useState<NFTReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const stellarService = new StellarNFTService(true); // testnet
  const STORAGE_KEY = 'trip_nft_receipts';

  // Carrega receipts do localStorage na inicialização
  useEffect(() => {
    loadStoredReceipts();
  }, []);

  const loadStoredReceipts = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setReceipts(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('Error loading stored receipts:', err);
      setError('Failed to load stored receipts');
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (updatedReceipts: NFTReceipt[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReceipts));
    } catch (err) {
      console.error('Error saving receipts to storage:', err);
      setError('Failed to save receipts');
    }
  };

  const addReceipt = (receipt: NFTReceipt) => {
    setReceipts(prev => {
      // Evita duplicatas
      const exists = prev.some(r => r.id === receipt.id);
      if (exists) return prev;
      
      const updated = [...prev, receipt];
      saveToStorage(updated);
      return updated;
    });
  };

  const removeReceipt = (receiptId: string) => {
    setReceipts(prev => {
      const updated = prev.filter(r => r.id !== receiptId);
      saveToStorage(updated);
      return updated;
    });
  };

  const verifyOwnership = async (receiptId: string, userPublicKey: string): Promise<boolean> => {
    try {
      const receipt = receipts.find(r => r.id === receiptId);
      if (!receipt || !receipt.nftId) return false;

      // Precisaria do issuer public key - em produção isso seria armazenado
      // Por enquanto, retorna true se o receipt existe localmente
      return true;
    } catch (err) {
      console.error('Error verifying NFT ownership:', err);
      return false;
    }
  };

  const refreshReceipts = () => {
    loadStoredReceipts();
  };

  return {
    receipts,
    loading,
    error,
    addReceipt,
    removeReceipt,
    verifyOwnership,
    refreshReceipts,
  };
};

/**
 * Hook para dados de exemplo/demo
 */
export const useExampleTripData = (): TripData => {
  return {
    id: 'trip_' + Date.now(),
    name: 'Aventura em Cancún',
    destination: 'Cancún, México',
    startDate: '2024-12-15',
    endDate: '2024-12-22',
    participants: [
      'João Silva',
      'Maria Santos',
      'Pedro Lima',
      'Ana Costa'
    ],
    totalExpenses: 2850.75,
    currency: 'BRL',
    highlights: [
      'Ruínas de Chichen Itzá',
      'Mergulho em Cenotes',
      'Vida noturna em Playa del Carmen',
      'Culinária mexicana'
    ],
  };
};