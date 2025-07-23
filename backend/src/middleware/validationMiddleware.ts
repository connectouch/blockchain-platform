/**
 * Request Validation Middleware
 * Standardized input validation using Joi schemas
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
}

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(`Body validation: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(`Query validation: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate route parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(`Params validation: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate headers
    if (schema.headers) {
      const { error } = schema.headers.validate(req.headers);
      if (error) {
        errors.push(`Headers validation: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Request validation failed', { errors });
    }

    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  id: Joi.object({
    id: Joi.string().required()
  }),

  email: Joi.string().email().required(),

  password: Joi.string().min(8).pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')
  ).required().messages({
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
  }),

  blockchain: {
    address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required().messages({
      'string.pattern.base': 'Invalid Ethereum address format'
    }),
    
    transactionHash: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required().messages({
      'string.pattern.base': 'Invalid transaction hash format'
    }),

    amount: Joi.string().pattern(/^\d+(\.\d+)?$/).required().messages({
      'string.pattern.base': 'Amount must be a valid number string'
    })
  }
};
