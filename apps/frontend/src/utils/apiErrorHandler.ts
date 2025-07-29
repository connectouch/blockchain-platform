/**
 * API Error Handler Utility
 * Handles JSON parsing errors and provides graceful fallbacks
 */

export interface APIError {
  success: false;
  error: string;
  code?: string;
  retryAfter?: number;
  statusCode?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  retryAfter?: number;
  cached?: boolean;
}

export class APIErrorHandler {
  /**
   * Safely parse JSON response with fallback handling
   */
  static async safeParseResponse<T = any>(response: Response): Promise<APIResponse<T>> {
    try {
      // Check if response is ok
      if (!response.ok) {
        return this.handleHTTPError(response);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('⚠️ Non-JSON response received:', contentType);
        const text = await response.text();
        return this.handleNonJSONResponse(text, response.status);
      }

      // Try to parse JSON
      const text = await response.text();
      if (!text.trim()) {
        return {
          success: false,
          error: 'Empty response received',
          code: 'EMPTY_RESPONSE',
          statusCode: response.status
        };
      }

      try {
        const data = JSON.parse(text);
        
        // Ensure response has success field
        if (data.success === undefined) {
          console.warn('⚠️ Response missing success field, assuming success');
          return {
            success: true,
            data: data
          };
        }

        return data;
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ Response text:', text.substring(0, 500));
        
        return this.handleJSONParseError(text, response.status);
      }

    } catch (error) {
      console.error('❌ API Error Handler failed:', error);
      return {
        success: false,
        error: 'Failed to process API response',
        code: 'HANDLER_ERROR',
        statusCode: 500
      };
    }
  }

  /**
   * Handle HTTP errors (4xx, 5xx)
   */
  private static async handleHTTPError(response: Response): Promise<APIError> {
    try {
      const text = await response.text();
      
      // Try to parse as JSON first
      try {
        const errorData = JSON.parse(text);
        return {
          success: false,
          error: errorData.error || errorData.message || `HTTP ${response.status}`,
          code: errorData.code || `HTTP_${response.status}`,
          retryAfter: errorData.retryAfter,
          statusCode: response.status
        };
      } catch {
        // If not JSON, handle as text
        return this.handleNonJSONResponse(text, response.status);
      }
    } catch {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        code: `HTTP_${response.status}`,
        statusCode: response.status
      };
    }
  }

  /**
   * Handle non-JSON responses (HTML error pages, plain text)
   */
  private static handleNonJSONResponse(text: string, status: number): APIError {
    // Check for common error patterns
    if (text.includes('Too many requests')) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 60,
        statusCode: status
      };
    }

    if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
      return {
        success: false,
        error: 'Server returned HTML error page instead of JSON',
        code: 'HTML_RESPONSE',
        statusCode: status
      };
    }

    if (text.includes('Cannot GET') || text.includes('Cannot POST')) {
      return {
        success: false,
        error: 'API endpoint not found',
        code: 'ENDPOINT_NOT_FOUND',
        statusCode: status
      };
    }

    return {
      success: false,
      error: text.substring(0, 200) || `HTTP ${status} error`,
      code: 'NON_JSON_RESPONSE',
      statusCode: status
    };
  }

  /**
   * Handle JSON parsing errors
   */
  private static handleJSONParseError(text: string, status: number): APIError {
    // Analyze the text to provide better error messages
    if (text.startsWith('Too many requests')) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 60,
        statusCode: status
      };
    }

    if (text.includes('Unexpected token')) {
      return {
        success: false,
        error: 'Server returned malformed JSON response',
        code: 'MALFORMED_JSON',
        statusCode: status
      };
    }

    return {
      success: false,
      error: 'Failed to parse server response as JSON',
      code: 'JSON_PARSE_ERROR',
      statusCode: status
    };
  }

  /**
   * Create a user-friendly error message
   */
  static getUserFriendlyMessage(error: APIError): string {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        return `Too many requests. Please wait ${error.retryAfter || 60} seconds and try again.`;
      
      case 'ENDPOINT_NOT_FOUND':
        return 'The requested feature is currently unavailable. Please try again later.';
      
      case 'HTML_RESPONSE':
      case 'NON_JSON_RESPONSE':
      case 'MALFORMED_JSON':
      case 'JSON_PARSE_ERROR':
        return 'There was a communication error with the server. Please refresh the page and try again.';
      
      case 'EMPTY_RESPONSE':
        return 'No data received from server. Please try again.';
      
      default:
        if (error.statusCode === 500) {
          return 'Internal server error. Please try again later.';
        } else if (error.statusCode === 503) {
          return 'Service temporarily unavailable. Please try again later.';
        } else if (error.statusCode === 404) {
          return 'The requested resource was not found.';
        }
        return error.error || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Determine if error is retryable
   */
  static isRetryable(error: APIError): boolean {
    const retryableCodes = [
      'RATE_LIMIT_EXCEEDED',
      'HTML_RESPONSE',
      'NON_JSON_RESPONSE',
      'MALFORMED_JSON',
      'JSON_PARSE_ERROR',
      'EMPTY_RESPONSE',
      'HANDLER_ERROR'
    ];

    const retryableStatuses = [429, 500, 502, 503, 504];

    return retryableCodes.includes(error.code || '') || 
           retryableStatuses.includes(error.statusCode || 0);
  }

  /**
   * Get retry delay in milliseconds
   */
  static getRetryDelay(error: APIError, attempt: number = 1): number {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return (error.retryAfter || 60) * 1000;
    }

    // Exponential backoff for other errors
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }
}

export default APIErrorHandler;
