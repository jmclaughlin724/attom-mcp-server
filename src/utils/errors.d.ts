/**
 * Type declarations for errors.js
 */

export class AttomApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode?: number);
}
