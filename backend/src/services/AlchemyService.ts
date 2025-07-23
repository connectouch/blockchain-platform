import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';
import { ethers } from 'ethers';
import { logger } from '@/utils/logger';

/**
 * Alchemy Blockchain Service
 * Real-time blockchain data integration using Alchemy SDK
 * Applying Augment Agent's comprehensive blockchain data approach
 */

export interface BlockchainNetwork {
  name: string;
  chainId: number;
  network: Network;
  rpcUrl: string;
}

export interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  error?: string;
}

export interface NFTMetadata {
  contract: {
    address: string;
    name: string;
    symbol: string;
    totalSupply: string;
  };
  id: {
    tokenId: string;
    tokenMetadata: {
      tokenType: string;
    };
  };
  title: string;
  description: string;
  tokenUri: {
    raw: string;
    gateway: string;
  };
  media: Array<{
    raw: string;
    gateway: string;
  }>;
  metadata: any;
  timeLastUpdated: string;
}

export interface TransactionData {
  hash: string;
  blockNumber: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed?: string;
  status?: string;
  timestamp?: number;
}

export class AlchemyService {
  private alchemyInstances: Map<string, Alchemy> = new Map();
  private readonly API_KEY: string;
  private readonly SUPPORTED_NETWORKS: BlockchainNetwork[] = [
    {
      name: 'ethereum',
      chainId: 1,
      network: Network.ETH_MAINNET,
      rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/`
    },
    {
      name: 'polygon',
      chainId: 137,
      network: Network.MATIC_MAINNET,
      rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/`
    },
    {
      name: 'arbitrum',
      chainId: 42161,
      network: Network.ARB_MAINNET,
      rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/`
    },
    {
      name: 'optimism',
      chainId: 10,
      network: Network.OPT_MAINNET,
      rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/`
    }
  ];

  constructor() {
    this.API_KEY = process.env.ALCHEMY_API_KEY || '';
    if (!this.API_KEY) {
      logger.error('Alchemy API key not found. Blockchain features will be limited.');
      return;
    }
    this.initializeAlchemyInstances();
  }

  /**
   * Initialize Alchemy instances for all supported networks
   */
  private initializeAlchemyInstances(): void {
    this.SUPPORTED_NETWORKS.forEach(network => {
      try {
        const config = {
          apiKey: this.API_KEY,
          network: network.network,
        };
        
        const alchemy = new Alchemy(config);
        this.alchemyInstances.set(network.name, alchemy);
        logger.info(`Alchemy instance initialized for ${network.name}`);
      } catch (error) {
        logger.error(`Failed to initialize Alchemy for ${network.name}:`, error);
      }
    });
  }

  /**
   * Get Alchemy instance for a specific network
   */
  private getAlchemyInstance(network: string = 'ethereum'): Alchemy {
    const instance = this.alchemyInstances.get(network);
    if (!instance) {
      throw new Error(`Alchemy instance not found for network: ${network}`);
    }
    return instance;
  }

  /**
   * Get real-time ETH balance for an address
   */
  public async getETHBalance(address: string, network: string = 'ethereum'): Promise<string> {
    try {
      const alchemy = this.getAlchemyInstance(network);
      const balance = await alchemy.core.getBalance(address, 'latest');
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error(`Error getting ETH balance for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Get token balances for an address
   */
  public async getTokenBalances(
    address: string, 
    network: string = 'ethereum'
  ): Promise<TokenBalance[]> {
    try {
      const alchemy = this.getAlchemyInstance(network);
      const balances = await alchemy.core.getTokenBalances(address);
      
      return balances.tokenBalances.map(balance => ({
        contractAddress: balance.contractAddress,
        tokenBalance: balance.tokenBalance || '0',
        error: balance.error
      }));
    } catch (error) {
      logger.error(`Error getting token balances for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Get NFTs owned by an address
   */
  public async getNFTs(
    address: string, 
    network: string = 'ethereum'
  ): Promise<NFTMetadata[]> {
    try {
      const alchemy = this.getAlchemyInstance(network);
      const nfts = await alchemy.nft.getNftsForOwner(address);
      
      return nfts.ownedNfts.map(nft => ({
        contract: {
          address: nft.contract.address,
          name: nft.contract.name || '',
          symbol: nft.contract.symbol || '',
          totalSupply: nft.contract.totalSupply || '0'
        },
        id: {
          tokenId: nft.tokenId,
          tokenMetadata: {
            tokenType: nft.tokenType || 'ERC721'
          }
        },
        title: nft.title || '',
        description: nft.description || '',
        tokenUri: {
          raw: nft.tokenUri?.raw || '',
          gateway: nft.tokenUri?.gateway || ''
        },
        media: nft.media || [],
        metadata: nft.metadata,
        timeLastUpdated: nft.timeLastUpdated || new Date().toISOString()
      }));
    } catch (error) {
      logger.error(`Error getting NFTs for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Get transaction history for an address
   */
  public async getTransactionHistory(
    address: string,
    network: string = 'ethereum',
    fromBlock?: string,
    toBlock?: string
  ): Promise<TransactionData[]> {
    try {
      const alchemy = this.getAlchemyInstance(network);
      const history = await alchemy.core.getAssetTransfers({
        fromAddress: address,
        fromBlock: fromBlock || '0x0',
        toBlock: toBlock || 'latest',
        category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
        maxCount: 100
      });

      return history.transfers.map(transfer => ({
        hash: transfer.hash || '',
        blockNumber: transfer.blockNum || '',
        from: transfer.from || '',
        to: transfer.to || '',
        value: transfer.value?.toString() || '0',
        gas: '0', // Not available in asset transfers
        gasPrice: '0', // Not available in asset transfers
        timestamp: 0 // Would need additional call to get block timestamp
      }));
    } catch (error) {
      logger.error(`Error getting transaction history for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Get current gas prices
   */
  public async getGasPrices(network: string = 'ethereum'): Promise<any> {
    try {
      const alchemy = this.getAlchemyInstance(network);
      const gasPrice = await alchemy.core.getGasPrice();
      
      // Get fee data for EIP-1559 networks
      const feeData = await alchemy.core.getFeeData();
      
      return {
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
        lastBaseFeePerGas: feeData.lastBaseFeePerGas ? ethers.formatUnits(feeData.lastBaseFeePerGas, 'gwei') : null
      };
    } catch (error) {
      logger.error(`Error getting gas prices for ${network}:`, error);
      throw error;
    }
  }

  /**
   * Get latest block information
   */
  public async getLatestBlock(network: string = 'ethereum'): Promise<any> {
    try {
      const alchemy = this.getAlchemyInstance(network);
      const block = await alchemy.core.getBlock('latest');
      
      return {
        number: block.number,
        hash: block.hash,
        timestamp: block.timestamp,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        baseFeePerGas: block.baseFeePerGas?.toString(),
        transactionCount: block.transactions.length
      };
    } catch (error) {
      logger.error(`Error getting latest block for ${network}:`, error);
      throw error;
    }
  }

  /**
   * Get token metadata
   */
  public async getTokenMetadata(
    contractAddress: string,
    network: string = 'ethereum'
  ): Promise<any> {
    try {
      const alchemy = this.getAlchemyInstance(network);
      const metadata = await alchemy.core.getTokenMetadata(contractAddress);
      
      return {
        name: metadata.name,
        symbol: metadata.symbol,
        decimals: metadata.decimals,
        logo: metadata.logo
      };
    } catch (error) {
      logger.error(`Error getting token metadata for ${contractAddress}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time events (WebSocket)
   */
  public async subscribeToAddressActivity(
    address: string,
    network: string = 'ethereum',
    callback: (activity: any) => void
  ): Promise<void> {
    try {
      const alchemy = this.getAlchemyInstance(network);
      
      // Subscribe to pending transactions
      alchemy.ws.on(
        {
          method: AlchemySubscription.PENDING_TRANSACTIONS,
          fromAddress: address
        },
        (tx) => callback({ type: 'pending_transaction', data: tx })
      );

      // Subscribe to mined transactions
      alchemy.ws.on(
        {
          method: AlchemySubscription.MINED_TRANSACTIONS,
          addresses: [{ from: address }, { to: address }]
        },
        (tx) => callback({ type: 'mined_transaction', data: tx })
      );

      logger.info(`Subscribed to address activity for ${address} on ${network}`);
    } catch (error) {
      logger.error(`Error subscribing to address activity:`, error);
      throw error;
    }
  }

  /**
   * Get supported networks
   */
  public getSupportedNetworks(): BlockchainNetwork[] {
    return this.SUPPORTED_NETWORKS;
  }

  /**
   * Health check for Alchemy service
   */
  public async healthCheck(): Promise<{ status: string; networks: any[] }> {
    const networkStatus = await Promise.allSettled(
      this.SUPPORTED_NETWORKS.map(async (network) => {
        try {
          const alchemy = this.getAlchemyInstance(network.name);
          const block = await alchemy.core.getBlockNumber();
          return {
            network: network.name,
            status: 'healthy',
            latestBlock: block
          };
        } catch (error) {
          return {
            network: network.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return {
      status: 'operational',
      networks: networkStatus.map(result => 
        result.status === 'fulfilled' ? result.value : result.reason
      )
    };
  }
}

export const alchemyService = new AlchemyService();
