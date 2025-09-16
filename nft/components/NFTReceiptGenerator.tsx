import React from 'react';
import { useState, useEffect } from 'react';
import { TripData, NFTReceipt } from '../types/nft';
import GeminiImageService from '../services/geminiImageService';
import StellarNFTService from '../services/stellarNFTService';
import '../styles/NFTReceiptGenerator.css';

interface NFTReceiptGeneratorProps {
  tripData: TripData;
  userPublicKey: string;
  onNFTCreated?: (nftReceipt: NFTReceipt) => void;
}

const NFTReceiptGenerator: React.FC<NFTReceiptGeneratorProps> = ({
  tripData,
  userPublicKey,
  onNFTCreated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [nftReceipt, setNftReceipt] = useState<NFTReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Configurações (em produção, estas devem vir de variáveis de ambiente)
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
  const ISSUER_SECRET_KEY = process.env.REACT_APP_STELLAR_ISSUER_SECRET || '';
  const DISTRIBUTOR_SECRET_KEY = process.env.REACT_APP_STELLAR_DISTRIBUTOR_SECRET || '';

  const geminiService = new GeminiImageService(GEMINI_API_KEY);
  const stellarService = new StellarNFTService(true); // testnet

  const generateNFTReceipt = async () => {
    if (!userPublicKey) {
      setError('User wallet not connected');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Passo 1: Gerar imagem com Gemini
      setCurrentStep('Generating commemorative image...');
      let imageUrl: string;
      
      try {
        imageUrl = await geminiService.generateTripImage(tripData);
      } catch (geminiError) {
        console.warn('Gemini API failed, using placeholder:', geminiError);
        // Fallback para placeholder se Gemini falhar
        imageUrl = await geminiService.generatePlaceholderImage(tripData);
      }
      
      setGeneratedImage(imageUrl);
      
      // Passo 2: Criar metadata
      setCurrentStep('Preparing NFT metadata...');
      const metadata = stellarService.generateNFTMetadata(tripData, imageUrl);
      
      // Passo 3: Criar NFT na Stellar
      setCurrentStep('Minting NFT on Stellar Network...');
      const { assetCode, txHash } = await stellarService.createNFT(
        ISSUER_SECRET_KEY,
        DISTRIBUTOR_SECRET_KEY,
        userPublicKey,
        metadata
      );
      
      // Passo 4: Criar o recibo
      const receipt: NFTReceipt = {
        id: `nft_${tripData.id}_${Date.now()}`,
        tripId: tripData.id,
        nftId: assetCode,
        imageUrl,
        metadata,
        stellarAssetCode: assetCode,
        mintedAt: new Date().toISOString(),
        txHash,
      };
      
      setNftReceipt(receipt);
      setCurrentStep('NFT Receipt created successfully!');
      
      // Chama callback se fornecido
      onNFTCreated?.(receipt);
      
    } catch (error) {
      console.error('Error generating NFT receipt:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
    }).format(amount);
  };

  return (
    <div className="nft-receipt-generator">
      <div className="trip-summary">
        <h3>Trip Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Destination:</span>
            <span className="value">{tripData.destination}</span>
          </div>
          <div className="summary-item">
            <span className="label">Duration:</span>
            <span className="value">
              {new Date(tripData.startDate).toLocaleDateString()} - 
              {new Date(tripData.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Participants:</span>
            <span className="value">{tripData.participants.length} travelers</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Expenses:</span>
            <span className="value">{formatCurrency(tripData.totalExpenses, tripData.currency)}</span>
          </div>
        </div>
      </div>

      {generatedImage && (
        <div className="generated-image">
          <h4>Generated Commemorative Image</h4>
          <img src={generatedImage} alt="Trip commemorative" className="trip-image" />
        </div>
      )}

      {nftReceipt && (
        <div className="nft-receipt">
          <h4>NFT Receipt Created! ✨</h4>
          <div className="receipt-details">
            <div className="detail-item">
              <span className="label">Asset Code:</span>
              <span className="value font-mono">{nftReceipt.stellarAssetCode}</span>
            </div>
            <div className="detail-item">
              <span className="label">Transaction Hash:</span>
              <a 
                href={`https://stellar.expert/explorer/testnet/tx/${nftReceipt.txHash}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="tx-link"
              >
                {nftReceipt.txHash?.slice(0, 8)}...{nftReceipt.txHash?.slice(-8)}
              </a>
            </div>
            <div className="detail-item">
              <span className="label">Minted:</span>
              <span className="value">{new Date(nftReceipt.mintedAt!).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h4>Error</h4>
          <p>{error}</p>
        </div>
      )}

      <div className="actions">
        <button 
          onClick={generateNFTReceipt}
          disabled={isGenerating || !userPublicKey}
          className="generate-btn"
        >
          {isGenerating ? (
            <span className="loading">
              <span className="spinner"></span>
              {currentStep}
            </span>
          ) : (
            '✨ Generate NFT Receipt'
          )}
        </button>
        
        {!userPublicKey && (
          <p className="warning">Please connect your Stellar wallet to generate NFT receipt</p>
        )}
      </div>

      <div className="info-box">
        <h5>About NFT Receipts</h5>
        <ul>
          <li>Each trip generates a unique commemorative NFT</li>
          <li>Stored permanently on Stellar blockchain</li>
          <li>Proof of participation and expense sharing</li>
          <li>Collectible digital memory of your travels</li>
        </ul>
      </div>
    </div>
  );
};

export default NFTReceiptGenerator;