import React from 'react';
import { NFTReceipt } from '../types/nft';
import '../styles/NFTGallery.css';

interface NFTGalleryProps {
    receipts: NFTReceipt[];
    onViewDetails?: (receipt: NFTReceipt) => void;
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ receipts, onViewDetails }) => {
    const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    };

    const getAttributeValue = (receipt: NFTReceipt, traitType: string): string => {
    const attribute = receipt.metadata.attributes.find(
        attr => attr.trait_type === traitType
    );
    return attribute?.value?.toString() || 'N/A';
    };

    if (receipts.length === 0) {
    return (
        <div className="nft-gallery empty">
        <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No NFT Receipts Yet</h3>
            <p>Complete your first trip and generate an NFT receipt to see it here!</p>
            </div>
        </div>
    );
    }

    return (
    <div className="nft-gallery">
        <div className="gallery-header">
        <h2>Your Travel NFT Collection</h2>
        <p>Digital memories and receipts from your shared adventures</p>
        </div>
        
        <div className="nft-grid">
        {receipts.map((receipt) => (
            <div key={receipt.id} className="nft-card">
                <div className="nft-image-container">
                <img 
                src={receipt.imageUrl} 
                alt={receipt.metadata.name}
                className="nft-image"
                onError={(e) => {
                  // Fallback se imagem não carregar
                    (e.target as HTMLImageElement).src = '/placeholder-nft.png';
                }}
                />
                <div className="nft-overlay">
                <span className="asset-code">{receipt.stellarAssetCode}</span>
                </div>
            </div>
            
            <div className="nft-content">
                <h3 className="nft-title">{receipt.metadata.name}</h3>
                
                <div className="nft-attributes">
                    <div className="attribute">
                    <span className="attr-label">Destination:</span>
                    <span className="attr-value">{getAttributeValue(receipt, 'Destination')}</span>
                    </div>
                    
                    <div className="attribute">
                    <span className="attr-label">Duration:</span>
                    <span className="attr-value">{getAttributeValue(receipt, 'Duration')}</span>
                    </div>
                    
                    <div className="attribute">
                    <span className="attr-label">Travelers:</span>
                    <span className="attr-value">{getAttributeValue(receipt, 'Participants')}</span>
                    </div>
                
                    <div className="attribute">
                    <span className="attr-label">Total Expenses:</span>
                    <span className="attr-value">{getAttributeValue(receipt, 'Total Expenses')}</span>
                    </div>
                </div>
                
                <div className="nft-footer">
                    <div className="mint-info">
                    <span className="mint-date">
                        Minted {receipt.mintedAt ? formatDate(receipt.mintedAt) : 'Unknown'}
                    </span>
                    </div>
                    
                    <div className="nft-actions">
                    {receipt.txHash && (
                        <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-link"
                        >
                        View on Stellar
                        </a>
                    )}
                    
                    {onViewDetails && (
                        <button 
                        onClick={() => onViewDetails(receipt)}
                        className="btn-details"
                        >
                        Details
                        </button>
                    )}
                    </div>
                </div>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
};

export default NFTGallery;