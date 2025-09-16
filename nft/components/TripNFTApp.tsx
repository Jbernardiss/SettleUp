import React, { useState } from 'react';
import NFTReceiptGenerator from './components/NFTReceiptGenerator';
import NFTGallery from './components/NFTGallery';
import { useNFTReceipts, useExampleTripData } from './hooks/useNFTReceipts';
import { NFTReceipt } from './types/nft';
import './styles/NFTReceiptGenerator.css';
import './styles/NFTGallery.css';

// Componente principal que demonstra o uso das NFTs
const TripNFTApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');
  const [userPublicKey, setUserPublicKey] = useState<string>('');
  
  // Hooks personalizados
  const { receipts, addReceipt } = useNFTReceipts();
  const exampleTripData = useExampleTripData();

  // Simula conexão com carteira Stellar
  const connectWallet = () => {
    // Em produção, isso integraria com uma carteira real como Freighter
    const demoPublicKey = 'GDEMOKEY...' + Math.random().toString(36).substring(7);
    setUserPublicKey(demoPublicKey);
  };

  const disconnectWallet = () => {
    setUserPublicKey('');
  };

  const handleNFTCreated = (receipt: NFTReceipt) => {
    addReceipt(receipt);
    // Muda para a galeria para mostrar o NFT criado
    setActiveTab('gallery');
  };

  return (
    <div className="trip-nft-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🌟 Trip NFT Receipts</h1>
          <p>Generate commemorative NFTs for your group travel expenses</p>
          
          <div className="wallet-section">
            {userPublicKey ? (
              <div className="wallet-connected">
                <span className="wallet-indicator">🟢 Connected</span>
                <span className="wallet-key">
                  {userPublicKey.slice(0, 8)}...{userPublicKey.slice(-8)}
                </span>
                <button onClick={disconnectWallet} className="btn-disconnect">
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={connectWallet} className="btn-connect">
                Connect Stellar Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <button 
          className={`nav-btn ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          ✨ Generate NFT
        </button>
        <button 
          className={`nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          🖼️ My Collection ({receipts.length})
        </button>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {activeTab === 'generate' && (
          <div className="tab-content">
            <h2>Generate NFT Receipt</h2>
            <p>Create a commemorative NFT for your completed trip with shared expenses.</p>
            
            <NFTReceiptGenerator
              tripData={exampleTripData}
              userPublicKey={userPublicKey}
              onNFTCreated={handleNFTCreated}
            />
          </div>
        )}
        
        {activeTab === 'gallery' && (
          <div className="tab-content">
            <NFTGallery
              receipts={receipts}
              onViewDetails={(receipt) => {
                console.log('View details:', receipt);
                // Aqui você poderia abrir um modal com detalhes completos
              }}
            />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <p>Powered by Stellar Network • Hackathon 2024 • MiniMax Agent</p>
      </footer>
    </div>
  );
};

export default TripNFTApp;