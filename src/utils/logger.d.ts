/**
 * Type definitions for logger.ts
 */

/**
 * Writes a message to the debug log file.
 * @param message The message to log.
 * @param level Optional log level (e.g., 'error', 'warn', 'info')
 */
export function writeLog(message: string, level: string): void;
