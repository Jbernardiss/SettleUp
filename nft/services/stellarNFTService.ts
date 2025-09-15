import { 
    Server, 
    Keypair, 
    TransactionBuilder, 
    Networks, 
    Operation,
    Asset,
    Account
  } from 'stellar-sdk';
  
  import { NFTMetadata, NFTReceipt, TripData } from '../types/nft';
  
  class StellarNFTService {
    private server: Server;
    private networkPassphrase: string;
  
    constructor(isTestnet = true) {
      this.server = new Server(
        isTestnet 
          ? 'https://horizon-testnet.stellar.org' 
          : 'https://horizon.stellar.org'
      );
      this.networkPassphrase = isTestnet 
        ? Networks.TESTNET 
        : Networks.PUBLIC;
    }
  
    /**
     * Cria um NFT na rede Stellar
     */
    async createNFT(
      issuerSecretKey: string,
      distributorSecretKey: string,
      recipientPublicKey: string,
      metadata: NFTMetadata
    ): Promise<{ assetCode: string; txHash: string }> {
      try {
        const issuerKeypair = Keypair.fromSecret(issuerSecretKey);
        const distributorKeypair = Keypair.fromSecret(distributorSecretKey);
        
        // Gera um código único para o NFT
        const assetCode = this.generateAssetCode(metadata.name);
        
        // Cria o asset NFT
        const nftAsset = new Asset(assetCode, issuerKeypair.publicKey());
        
        // Carrega a conta do distribuidor
        const distributorAccount = await this.server.loadAccount(distributorKeypair.publicKey());
        
        // Constrói a transação
        const transaction = new TransactionBuilder(distributorAccount, {
          fee: '100000', // Fee mais alto para garantir processamento
          networkPassphrase: this.networkPassphrase,
        })
          // Estabelece trustline se necessário
          .addOperation(
            Operation.changeTrust({
              asset: nftAsset,
              limit: '1', // NFT tem supply limitado a 1
              source: recipientPublicKey,
            })
          )
          // Emite o NFT para o destinatário
          .addOperation(
            Operation.payment({
              destination: recipientPublicKey,
              asset: nftAsset,
              amount: '1',
            })
          )
          // Adiciona metadata como manage_data operations
          .addOperation(
            Operation.manageData({
              name: `nft_name_${assetCode}`,
              value: metadata.name,
            })
          )
          .addOperation(
            Operation.manageData({
              name: `nft_desc_${assetCode}`,
              value: metadata.description,
            })
          )
          .addOperation(
            Operation.manageData({
              name: `nft_image_${assetCode}`,
              value: metadata.image,
            })
          )
          // Lock o asset (impede criação de mais tokens)
          .addOperation(
            Operation.setOptions({
              masterWeight: 0,
              source: issuerKeypair.publicKey(),
            })
          )
          .setTimeout(300)
          .build();
        
        // Assina com ambas as chaves
        transaction.sign(distributorKeypair);
        transaction.sign(issuerKeypair);
        
        // Submete para a rede
        const result = await this.server.submitTransaction(transaction);
        
        return {
          assetCode,
          txHash: result.hash,
        };
      } catch (error) {
        console.error('Error creating NFT on Stellar:', error);
        throw error;
      }
    }
  
    /**
     * Gera um código único para o asset baseado no nome
     */
    private generateAssetCode(name: string): string {
      // Remove caracteres especiais e pega os primeiros caracteres
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const timestamp = Date.now().toString().slice(-4);
      return `${cleanName.slice(0, 8)}${timestamp}`.slice(0, 12); // Máximo 12 caracteres
    }
  
    /**
     * Gera metadata JSON para o NFT baseado nos dados da viagem
     */
    generateNFTMetadata(tripData: TripData, imageUrl: string): NFTMetadata {
      const duration = this.calculateTripDuration(tripData.startDate, tripData.endDate);
      
      return {
        name: `${tripData.name} - Travel Receipt NFT`,
        description: `Commemorative NFT for the trip "${tripData.name}" to ${tripData.destination}. This NFT serves as a digital receipt and proof of participation in shared expenses totaling ${tripData.currency} ${tripData.totalExpenses.toFixed(2)}.`,
        image: imageUrl,
        attributes: [
          {
            trait_type: 'Destination',
            value: tripData.destination,
          },
          {
            trait_type: 'Duration',
            value: `${duration} days`,
          },
          {
            trait_type: 'Participants',
            value: tripData.participants.length,
          },
          {
            trait_type: 'Total Expenses',
            value: `${tripData.currency} ${tripData.totalExpenses.toFixed(2)}`,
          },
          {
            trait_type: 'Start Date',
            value: tripData.startDate,
          },
          {
            trait_type: 'End Date',
            value: tripData.endDate,
          },
          {
            trait_type: 'Trip Type',
            value: 'Group Travel',
          },
          {
            trait_type: 'Blockchain',
            value: 'Stellar',
          },
        ],
      };
    }
  
    private calculateTripDuration(startDate: string, endDate: string): number {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
  
    /**
     * Verifica se uma conta possui um NFT específico
     */
    async checkNFTOwnership(accountId: string, assetCode: string, issuerPublicKey: string): Promise<boolean> {
      try {
        const account = await this.server.loadAccount(accountId);
        const balance = account.balances.find(
          (balance) => 
            balance.asset_type !== 'native' &&
            'asset_code' in balance &&
            balance.asset_code === assetCode &&
            'asset_issuer' in balance &&
            balance.asset_issuer === issuerPublicKey
        );
        
        return balance !== undefined && parseFloat(balance.balance) > 0;
      } catch (error) {
        console.error('Error checking NFT ownership:', error);
        return false;
      }
    }
  
    /**
     * Busca metadata de um NFT na rede
     */
    async getNFTMetadata(issuerPublicKey: string, assetCode: string): Promise<Partial<NFTMetadata> | null> {
      try {
        const account = await this.server.loadAccount(issuerPublicKey);
        
        const metadata: Partial<NFTMetadata> = {};
        
        // Busca dados armazenados na conta
        const nameKey = `nft_name_${assetCode}`;
        const descKey = `nft_desc_${assetCode}`;
        const imageKey = `nft_image_${assetCode}`;
        
        if (account.data_attr[nameKey]) {
          metadata.name = Buffer.from(account.data_attr[nameKey], 'base64').toString();
        }
        
        if (account.data_attr[descKey]) {
          metadata.description = Buffer.from(account.data_attr[descKey], 'base64').toString();
        }
        
        if (account.data_attr[imageKey]) {
          metadata.image = Buffer.from(account.data_attr[imageKey], 'base64').toString();
        }
        
        return Object.keys(metadata).length > 0 ? metadata : null;
      } catch (error) {
        console.error('Error fetching NFT metadata:', error);
        return null;
      }
    }
  }
  
  export default StellarNFTService;