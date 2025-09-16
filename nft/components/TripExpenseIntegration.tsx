import React from 'react';
import { useState, useEffect } from 'react';
import { TripData } from '../types/nft';
import { convertExpensesToTripData, validateTripForNFT, TripExpenseData } from '../utils/nftUtils';
import { useNFTReceipts } from '../hooks/useNFTReceipts';
import NFTReceiptGenerator from './NFTReceiptGenerator';
import '../styles/TripExpenseIntegration.css';

interface TripExpenseIntegrationProps {
  expenseData: TripExpenseData; // Dados do seu app de gastos
  userWalletAddress?: string;
  onClose?: () => void;
}

/**
 * Componente de integração para conectar com seu app de gastos existente
 */
const TripExpenseIntegration: React.FC<TripExpenseIntegrationProps> = ({
  expenseData,
  userWalletAddress,
  onClose,
}) => {
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showNFTGenerator, setShowNFTGenerator] = useState(false);
  const { addReceipt } = useNFTReceipts();

  useEffect(() => {
    // Converte dados de gastos para formato NFT
    const converted = convertExpensesToTripData(expenseData);
    setTripData(converted);
    
    // Valida os dados
    const validation = validateTripForNFT(converted);
    setValidationErrors(validation.errors);
  }, [expenseData]);

  const handleProceedToNFT = () => {
    if (validationErrors.length === 0) {
      setShowNFTGenerator(true);
    }
  };

  const handleNFTCreated = (receipt: any) => {
    addReceipt(receipt);
    onClose?.();
  };

  if (!tripData) {
    return <div>Loading...</div>;
  }

  if (showNFTGenerator) {
    return (
      <div className="trip-expense-integration">
        <NFTReceiptGenerator
          tripData={tripData}
          userPublicKey={userWalletAddress || ''}
          onNFTCreated={handleNFTCreated}
        />
        <button 
          onClick={() => setShowNFTGenerator(false)}
          className="back-btn"
        >
          ← Back to Summary
        </button>
      </div>
    );
  }

  return (
    <div className="trip-expense-integration">
      <div className="integration-header">
        <h2>🎆 Generate NFT Receipt</h2>
        <p>Create a commemorative NFT for this completed trip</p>
      </div>

      <div className="trip-preview">
        <h3>Trip Summary</h3>
        <div className="summary-grid">
          <div className="summary-row">
            <span className="label">Trip:</span>
            <span className="value">{tripData.name}</span>
          </div>
          <div className="summary-row">
            <span className="label">Destination:</span>
            <span className="value">{tripData.destination}</span>
          </div>
          <div className="summary-row">
            <span className="label">Duration:</span>
            <span className="value">
              {new Date(tripData.startDate).toLocaleDateString()} - 
              {new Date(tripData.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="summary-row">
            <span className="label">Participants:</span>
            <span className="value">{tripData.participants.length} people</span>
          </div>
          <div className="summary-row">
            <span className="label">Total Expenses:</span>
            <span className="value font-weight-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: tripData.currency === 'BRL' ? 'BRL' : 'USD',
              }).format(tripData.totalExpenses)}
            </span>
          </div>
        </div>
      </div>

      <div className="expense-breakdown">
        <h4>Expense Breakdown</h4>
        <div className="expense-list">
          {expenseData.expenses.slice(0, 5).map((expense, index) => (
            <div key={expense.id} className="expense-item">
              <span className="expense-desc">{expense.description}</span>
              <span className="expense-amount">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: tripData.currency === 'BRL' ? 'BRL' : 'USD',
                }).format(expense.amount)}
              </span>
            </div>
          ))}
          {expenseData.expenses.length > 5 && (
            <div className="expense-item more">
              <span>... and {expenseData.expenses.length - 5} more expenses</span>
            </div>
          )}
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h4>Issues Found:</h4>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          <p>Please resolve these issues in your trip data before generating the NFT.</p>
        </div>
      )}

      <div className="nft-benefits">
        <h4>NFT Receipt Benefits</h4>
        <ul>
          <li>✨ Commemorative digital artwork of your trip</li>
          <li>🔒 Immutable proof of expense sharing on blockchain</li>
          <li>🏆 Collectible memory of your travel adventures</li>
          <li>🔗 Verifiable transaction history on Stellar</li>
        </ul>
      </div>

      <div className="integration-actions">
        {userWalletAddress ? (
          <button 
            onClick={handleProceedToNFT}
            disabled={validationErrors.length > 0}
            className="proceed-btn"
          >
            🎆 Generate NFT Receipt
          </button>
        ) : (
          <div className="wallet-required">
            <p>Connect your Stellar wallet to generate NFT receipt</p>
            <button className="connect-wallet-btn">
              Connect Wallet
            </button>
          </div>
        )}
        
        {onClose && (
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default TripExpenseIntegration;