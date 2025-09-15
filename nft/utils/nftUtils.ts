// Utilitários para NFT e integração

import { TripData } from '../types/nft';

/**
 * Converte dados de gastos do seu app para o formato TripData
 */
export interface ExpenseData {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
  date: string;
  category?: string;
}

export interface TripExpenseData {
  tripId: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: string[];
  expenses: ExpenseData[];
  currency: string;
}

/**
 * Converte dados de gastos para formato NFT
 */
export const convertExpensesToTripData = (expenseData: TripExpenseData): TripData => {
  const totalExpenses = expenseData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Gera highlights baseado nas categorias de gastos
  const categories = [...new Set(expenseData.expenses.map(e => e.category).filter(Boolean))];
  const highlights = categories.length > 0 
    ? categories.slice(0, 4).map(cat => `${cat} expenses`)
    : ['Shared travel expenses', 'Group activities', 'Accommodation', 'Food & drinks'];

  return {
    id: expenseData.tripId,
    name: expenseData.tripName,
    destination: expenseData.destination,
    startDate: expenseData.startDate,
    endDate: expenseData.endDate,
    participants: expenseData.members,
    totalExpenses,
    currency: expenseData.currency,
    highlights,
  };
};

/**
 * Valida se uma viagem está apta para gerar NFT
 */
export const validateTripForNFT = (tripData: TripData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!tripData.name?.trim()) {
    errors.push('Trip name is required');
  }
  
  if (!tripData.destination?.trim()) {
    errors.push('Destination is required');
  }
  
  if (!tripData.startDate || !tripData.endDate) {
    errors.push('Start and end dates are required');
  } else {
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    if (start >= end) {
      errors.push('End date must be after start date');
    }
  }
  
  if (!tripData.participants?.length || tripData.participants.length < 2) {
    errors.push('At least 2 participants are required');
  }
  
  if (!tripData.totalExpenses || tripData.totalExpenses <= 0) {
    errors.push('Total expenses must be greater than 0');
  }
  
  if (!tripData.currency?.trim()) {
    errors.push('Currency is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Gera um hash único para a viagem (para evitar NFTs duplicados)
 */
export const generateTripHash = (tripData: TripData): string => {
  const hashInput = `${tripData.name}_${tripData.destination}_${tripData.startDate}_${tripData.endDate}_${tripData.participants.join(',')}_${tripData.totalExpenses}`;
  
  // Simple hash function (em produção, use uma biblioteca de hash mais robusta)
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Formata moeda baseada no código da moeda
 */
export const formatCurrency = (amount: number, currency: string, locale = 'pt-BR'): string => {
  const currencyMap: { [key: string]: string } = {
    'BRL': 'BRL',
    'USD': 'USD',
    'EUR': 'EUR',
    'GBP': 'GBP',
    'JPY': 'JPY',
  };
  
  const currencyCode = currencyMap[currency.toUpperCase()] || 'USD';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    // Fallback se a moeda não for suportada
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Calcula estatísticas da viagem para incluir na descrição do NFT
 */
export const calculateTripStats = (tripData: TripData) => {
  const duration = Math.ceil(
    (new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  const avgPerPerson = tripData.totalExpenses / tripData.participants.length;
  
  return {
    duration,
    participantCount: tripData.participants.length,
    totalExpenses: tripData.totalExpenses,
    avgPerPerson,
    currency: tripData.currency,
  };
};

/**
 * Gera texto descritivo para o NFT baseado nos dados da viagem
 */
export const generateNFTDescription = (tripData: TripData): string => {
  const stats = calculateTripStats(tripData);
  
  return `Commemorative NFT for "${tripData.name}" - a ${stats.duration}-day adventure to ${tripData.destination} with ${stats.participantCount} friends. This digital receipt represents shared expenses totaling ${formatCurrency(stats.totalExpenses, stats.currency)}, with an average of ${formatCurrency(stats.avgPerPerson, stats.currency)} per person. Generated on the Stellar blockchain as proof of participation and transparent expense sharing.`;
};

/**
 * Verifica se o browser suporta as funcionalidades necessárias
 */
export const checkBrowserSupport = (): { supported: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  if (!window.crypto || !window.crypto.subtle) {
    missing.push('Web Crypto API');
  }
  
  if (!window.localStorage) {
    missing.push('Local Storage');
  }
  
  if (!window.fetch) {
    missing.push('Fetch API');
  }
  
  return {
    supported: missing.length === 0,
    missing
  };
};

/**
 * Gera dados de exemplo para teste
 */
export const generateSampleTripData = (): TripData => {
  const destinations = [
    'Rio de Janeiro, Brasil',
    'Lisboa, Portugal', 
    'Buenos Aires, Argentina',
    'Barcelona, Espanha',
    'Tulum, México'
  ];
  
  const tripNames = [
    'Aventura de Verão',
    'Escape de Inverno',
    'Road Trip Épico',
    'Férias dos Sonhos',
    'Mochilão Europeu'
  ];
  
  const participants = [
    'Ana Silva',
    'Bruno Costa',
    'Carlos Lima',
    'Diana Santos',
    'Eduardo Pereira'
  ];
  
  const highlights = [
    'Passeios turísticos',
    'Gastronomia local',
    'Vida noturna',
    'Atividades ao ar livre',
    'Cultura e história',
    'Relaxamento',
    'Aventura'
  ];
  
  const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
  const randomName = tripNames[Math.floor(Math.random() * tripNames.length)];
  const randomParticipants = participants.slice(0, Math.floor(Math.random() * 3) + 2);
  const randomHighlights = highlights.slice(0, Math.floor(Math.random() * 4) + 2);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 3);
  
  return {
    id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: randomName,
    destination: randomDestination,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    participants: randomParticipants,
    totalExpenses: Math.floor(Math.random() * 5000) + 1000,
    currency: 'BRL',
    highlights: randomHighlights,
  };
};

/**
 * Cache para otimização de performance
 */
class NFTCache {
  private cache = new Map<string, any>();
  private readonly maxSize = 100;
  
  set(key: string, value: any): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  get(key: string): any {
    return this.cache.get(key);
  }
  
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const nftCache = new NFTCache();