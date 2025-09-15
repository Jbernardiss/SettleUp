// Types para NFT-Recibo
export interface TripData {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    participants: string[];
    totalExpenses: number;
    currency: string;
    highlights: string[];
    photos?: string[];
  }
  
  export interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: {
      trait_type: string;
      value: string | number;
    }[];
  }
  
  export interface NFTReceipt {
    id: string;
    tripId: string;
    nftId?: string;
    imageUrl: string;
    metadata: NFTMetadata;
    stellarAssetCode: string;
    mintedAt?: string;
    txHash?: string;
  }
  
  export interface GeminiImageRequest {
    prompt: string;
    style?: 'realistic' | 'artistic' | 'minimalist' | 'vintage';
    aspectRatio?: '1:1' | '16:9' | '9:16';
  }