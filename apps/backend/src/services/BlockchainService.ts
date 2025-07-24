import { ethers } from 'ethers';
import { logger } from '../utils/logger';

// Contract ABI (simplified for key functions)
const CONNECTOUCH_REGISTRY_ABI = [
  "function registerUser(string memory username, uint8 riskTolerance, uint256 investmentAmount) external returns (uint256)",
  "function createStrategy(string memory name, string memory description, uint8 riskLevel, string memory protocols) external returns (uint256)",
  "function getUserProfile(address userAddress) external view returns (tuple(uint256 id, string username, uint8 riskTolerance, uint256 investmentAmount, uint256 totalStrategies, bool isActive, uint256 registrationTime))",
  "function getStrategy(uint256 strategyId) external view returns (tuple(uint256 id, address creator, string name, string description, uint8 riskLevel, string protocols, uint256 creationTime, bool isActive))",
  "function totalUsers() external view returns (uint256)",
  "function totalStrategies() external view returns (uint256)",
  "function totalActiveUsers() external view returns (uint256)",
  "event UserRegistered(address indexed user, uint256 indexed userId, string username)",
  "event StrategyCreated(address indexed creator, uint256 indexed strategyId, string name)"
];

/**
 * Blockchain Service - Handles smart contract interactions
 * Manages user registration, strategy creation, and blockchain queries
 */
export class BlockchainService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;
  private networkName: string;

  constructor() {
    this.contractAddress = process.env.CONTRACT_ADDRESS || '';
    this.networkName = process.env.NETWORK_NAME || 'sepolia';
    this.initializeProvider();
  }

  /**
   * Initialize blockchain provider and contract
   */
  private async initializeProvider(): Promise<void> {
    try {
      // Initialize provider
      const rpcUrl = process.env.ETHEREUM_RPC_URL;
      if (!rpcUrl) {
        logger.warn('No RPC URL configured, using default provider');
        this.provider = ethers.getDefaultProvider(this.networkName);
      } else {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
      }

      // Initialize signer if private key is available
      if (process.env.PRIVATE_KEY && this.provider) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        logger.info('Blockchain signer initialized');
      }

      // Initialize contract if address is available
      if (this.contractAddress && this.provider) {
        this.contract = new ethers.Contract(
          this.contractAddress,
          CONNECTOUCH_REGISTRY_ABI,
          this.signer || this.provider
        );
        logger.info(`Contract initialized at ${this.contractAddress}`);
      }

      logger.info(`Blockchain service initialized for ${this.networkName}`);

    } catch (error) {
      logger.error('Failed to initialize blockchain service:', error);
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<any> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();

      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber,
        gasPrice: {
          gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : null,
          maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
          maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null
        }
      };

    } catch (error) {
      logger.error('Error getting network info:', error);
      throw error;
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<any> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [totalUsers, totalStrategies, totalActiveUsers] = await Promise.all([
        this.contract.totalUsers(),
        this.contract.totalStrategies(),
        this.contract.totalActiveUsers()
      ]);

      return {
        totalUsers: totalUsers.toString(),
        totalStrategies: totalStrategies.toString(),
        totalActiveUsers: totalActiveUsers.toString(),
        contractAddress: this.contractAddress,
        network: this.networkName
      };

    } catch (error) {
      logger.error('Error getting contract stats:', error);
      throw error;
    }
  }

  /**
   * Register a new user on the blockchain
   */
  async registerUser(
    username: string,
    riskTolerance: number,
    investmentAmount: number,
    userAddress?: string
  ): Promise<any> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      logger.info('Registering user on blockchain', {
        username,
        riskTolerance,
        investmentAmount
      });

      // Convert investment amount to wei (assuming USD to ETH conversion)
      const investmentAmountWei = ethers.parseEther((investmentAmount / 2000).toString()); // Rough USD to ETH

      const tx = await this.contract.registerUser(
        username,
        riskTolerance,
        investmentAmountWei
      );

      logger.info('User registration transaction sent', { txHash: tx.hash });

      const receipt = await tx.wait();
      logger.info('User registration confirmed', { 
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

      // Parse events to get user ID
      const userRegisteredEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'UserRegistered';
        } catch {
          return false;
        }
      });

      let userId = null;
      if (userRegisteredEvent) {
        const parsed = this.contract.interface.parseLog(userRegisteredEvent);
        userId = parsed?.args?.userId?.toString();
      }

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        userId,
        username
      };

    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Create a new strategy on the blockchain
   */
  async createStrategy(
    name: string,
    description: string,
    riskLevel: number,
    protocols: string[]
  ): Promise<any> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      logger.info('Creating strategy on blockchain', {
        name,
        riskLevel,
        protocols: protocols.length
      });

      const protocolsString = protocols.join(',');

      const tx = await this.contract.createStrategy(
        name,
        description,
        riskLevel,
        protocolsString
      );

      logger.info('Strategy creation transaction sent', { txHash: tx.hash });

      const receipt = await tx.wait();
      logger.info('Strategy creation confirmed', {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

      // Parse events to get strategy ID
      const strategyCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'StrategyCreated';
        } catch {
          return false;
        }
      });

      let strategyId = null;
      if (strategyCreatedEvent) {
        const parsed = this.contract.interface.parseLog(strategyCreatedEvent);
        strategyId = parsed?.args?.strategyId?.toString();
      }

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        strategyId,
        name
      };

    } catch (error) {
      logger.error('Error creating strategy:', error);
      throw error;
    }
  }

  /**
   * Get user profile from blockchain
   */
  async getUserProfile(userAddress: string): Promise<any> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const profile = await this.contract.getUserProfile(userAddress);

      return {
        id: profile.id.toString(),
        username: profile.username,
        riskTolerance: profile.riskTolerance,
        investmentAmount: ethers.formatEther(profile.investmentAmount),
        totalStrategies: profile.totalStrategies.toString(),
        isActive: profile.isActive,
        registrationTime: new Date(Number(profile.registrationTime) * 1000)
      };

    } catch (error) {
      logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Get strategy details from blockchain
   */
  async getStrategy(strategyId: number): Promise<any> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const strategy = await this.contract.getStrategy(strategyId);

      return {
        id: strategy.id.toString(),
        creator: strategy.creator,
        name: strategy.name,
        description: strategy.description,
        riskLevel: strategy.riskLevel,
        protocols: strategy.protocols.split(','),
        creationTime: new Date(Number(strategy.creationTime) * 1000),
        isActive: strategy.isActive
      };

    } catch (error) {
      logger.error('Error getting strategy:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for user registration
   */
  async estimateRegistrationGas(
    username: string,
    riskTolerance: number,
    investmentAmount: number
  ): Promise<any> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const investmentAmountWei = ethers.parseEther((investmentAmount / 2000).toString());
      
      const gasEstimate = await this.contract.registerUser.estimateGas(
        username,
        riskTolerance,
        investmentAmountWei
      );

      const feeData = await this.provider!.getFeeData();
      
      const estimatedCost = gasEstimate * (feeData.gasPrice || BigInt(0));

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
        estimatedCostETH: ethers.formatEther(estimatedCost),
        estimatedCostUSD: (parseFloat(ethers.formatEther(estimatedCost)) * 2000).toFixed(2) // Rough ETH to USD
      };

    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw error;
    }
  }

  /**
   * Test blockchain connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.provider) {
        return false;
      }

      // Test basic provider connection
      const blockNumber = await this.provider.getBlockNumber();
      logger.info(`Blockchain connection test: Block ${blockNumber}`);

      // Test contract connection if available
      if (this.contract) {
        const totalUsers = await this.contract.totalUsers();
        logger.info(`Contract connection test: ${totalUsers} total users`);
      }

      return true;

    } catch (error) {
      logger.error('Blockchain connection test failed:', error);
      return false;
    }
  }

  /**
   * Get current gas prices
   */
  async getCurrentGasPrices(): Promise<any> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const feeData = await this.provider.getFeeData();

      return {
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
        maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Error getting gas prices:', error);
      throw error;
    }
  }
}
