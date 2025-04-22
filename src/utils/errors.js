/**
 * Custom error types for ATTOM API interactions
 */

/**
 * AttomApiError represents an error encountered during API interaction
 * @class
 */
export class AttomApiError extends Error {
  /**
   * Create a new AttomApiError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AttomApiError';
    this.statusCode = statusCode;
  }
}
