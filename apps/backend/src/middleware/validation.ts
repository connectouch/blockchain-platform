/**
 * Validation Middleware Export
 * Re-exports validation functionality for backward compatibility
 */

export {
  validateRequest,
  commonSchemas,
  type ValidationSchema
} from './validationMiddleware';

// Additional validation utilities
import Joi from 'joi';

/**
 * Extended validation schemas for specific use cases
 */
export const validationSchemas = {
  // Starknet specific validations
  starknet: {
    address: Joi.string().pattern(/^0x[a-fA-F0-9]{63,64}$/).required().messages({
      'string.pattern.base': 'Invalid Starknet address format'
    }),
    
    transactionHash: Joi.string().pattern(/^0x[a-fA-F0-9]{63,64}$/).required().messages({
      'string.pattern.base': 'Invalid Starknet transaction hash format'
    }),

    contractAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{63,64}$/).required().messages({
      'string.pattern.base': 'Invalid Starknet contract address format'
    }),

    amount: Joi.string().pattern(/^\d+(\.\d+)?$/).required().messages({
      'string.pattern.base': 'Amount must be a valid number string'
    }),

    networkId: Joi.string().valid('mainnet', 'sepolia', 'goerli').required()
  },

  // AI Intelligence validations
  aiIntelligence: {
    query: Joi.object({
      prompt: Joi.string().min(1).max(1000).required(),
      context: Joi.string().max(5000).optional(),
      model: Joi.string().valid('gpt-4', 'gpt-3.5-turbo', 'claude-3').optional(),
      temperature: Joi.number().min(0).max(2).optional(),
      maxTokens: Joi.number().min(1).max(4000).optional()
    }),

    analysis: Joi.object({
      data: Joi.object().required(),
      analysisType: Joi.string().valid('technical', 'fundamental', 'sentiment', 'risk').required(),
      timeframe: Joi.string().valid('1h', '4h', '1d', '1w', '1m').optional()
    })
  },

  // Quantum DeFi validations
  quantumDefi: {
    portfolio: Joi.object({
      accountAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
      riskTolerance: Joi.string().valid('conservative', 'moderate', 'aggressive').required(),
      timeHorizon: Joi.string().valid('short', 'medium', 'long').optional(),
      investmentAmount: Joi.string().pattern(/^\d+(\.\d+)?$/).optional()
    }),

    strategy: Joi.object({
      strategyType: Joi.string().valid('yield_farming', 'liquidity_provision', 'arbitrage', 'lending').required(),
      protocols: Joi.array().items(Joi.string()).min(1).required(),
      allocation: Joi.object().pattern(Joi.string(), Joi.number().min(0).max(100)).required()
    })
  },

  // DeFi protocol validations
  defi: {
    protocol: Joi.object({
      name: Joi.string().required(),
      network: Joi.string().valid('ethereum', 'polygon', 'arbitrum', 'optimism', 'starknet').required(),
      tvl: Joi.number().min(0).optional(),
      apy: Joi.number().min(0).max(1000).optional()
    }),

    transaction: Joi.object({
      from: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
      to: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
      amount: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
      token: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional(),
      gasLimit: Joi.string().pattern(/^\d+$/).optional(),
      gasPrice: Joi.string().pattern(/^\d+$/).optional()
    })
  },

  // Market data validations
  market: {
    priceQuery: Joi.object({
      symbols: Joi.array().items(Joi.string().uppercase()).min(1).max(100).required(),
      currency: Joi.string().valid('USD', 'EUR', 'BTC', 'ETH').default('USD'),
      timeframe: Joi.string().valid('1m', '5m', '15m', '1h', '4h', '1d', '1w').optional()
    }),

    historicalData: Joi.object({
      symbol: Joi.string().uppercase().required(),
      from: Joi.date().iso().required(),
      to: Joi.date().iso().min(Joi.ref('from')).required(),
      interval: Joi.string().valid('1m', '5m', '15m', '1h', '4h', '1d', '1w').default('1h')
    })
  }
};

/**
 * Validation middleware factory for specific domains
 */
export const createDomainValidator = (domain: keyof typeof validationSchemas) => {
  return (schema: keyof typeof validationSchemas[typeof domain]) => {
    const { validateRequest: validationMiddleware } = require('./validationMiddleware');
    return validationMiddleware({
      body: validationSchemas[domain][schema] as Joi.ObjectSchema
    });
  };
};

// Domain-specific validators
export const starknetValidator = createDomainValidator('starknet');
export const aiValidator = createDomainValidator('aiIntelligence');
export const quantumValidator = createDomainValidator('quantumDefi');
export const defiValidator = createDomainValidator('defi');
export const marketValidator = createDomainValidator('market');

/**
 * Custom validation functions
 */
export const customValidators = {
  isEthereumAddress: (value: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  },

  isStarknetAddress: (value: string): boolean => {
    return /^0x[a-fA-F0-9]{63,64}$/.test(value);
  },

  isValidAmount: (value: string): boolean => {
    return /^\d+(\.\d+)?$/.test(value) && parseFloat(value) > 0;
  },

  isValidPercentage: (value: number): boolean => {
    return value >= 0 && value <= 100;
  },

  isValidTimestamp: (value: number): boolean => {
    const date = new Date(value * 1000);
    return date.getTime() > 0 && date.getTime() < Date.now() + (365 * 24 * 60 * 60 * 1000); // Within next year
  }
};

/**
 * Validation error formatter
 */
export const formatValidationError = (error: Joi.ValidationError): string => {
  return error.details.map(detail => detail.message).join(', ');
};

/**
 * Async validation wrapper
 */
export const asyncValidate = async <T>(
  schema: Joi.ObjectSchema<T>,
  data: any
): Promise<{ value: T; error?: string }> => {
  try {
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      return { value: data, error: formatValidationError(error) };
    }
    return { value };
  } catch (err) {
    return { value: data, error: 'Validation failed' };
  }
};
