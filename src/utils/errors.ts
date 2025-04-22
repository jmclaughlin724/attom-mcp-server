/**
 * Custom error types for the ATTOM API
 */

/**
 * Error thrown when ATTOM API request fails
 */
export class AttomApiError extends Error {
  status?: number;
  details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = 'AttomApiError';
    this.status = status;
    this.details = details;
  }
}
