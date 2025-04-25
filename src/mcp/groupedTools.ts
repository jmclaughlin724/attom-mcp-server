/**
 * Consolidated MCP Tool for ATTOM API
 *
 * This file defines a single MCP tool, `attom_query`, that acts as a gateway
 * to all configured ATTOM API endpoints. The specific endpoint is selected
 * using the `kind` parameter, and the `params` object is forwarded to the
 * appropriate handler logic in `queryManager`.
 */

import { z } from 'zod';
import { executeAttomQuery } from '../services/queryManager.js';
import { endpoints } from '../config/endpointConfig.js'; // Import endpoints directly
import { normalizeAddressInParams } from '../utils/addressNormalizer.js';
import { writeLog } from '../utils/logger.js';

// Get ALL endpoint keys directly from the configuration
const ALL_ENDPOINT_KEYS = Object.keys(endpoints);

/**
 * Helper to create the consolidated tool definition.
 */
function buildConsolidatedTool(toolName: string, endpointKeys: string[]) {
  // Build a Zod schema for runtime validation.
  // Loosen params validation slightly at this stage due to potential Inspector nesting issue
  const toolSchema = z.object({
    kind: z.enum(endpointKeys as [string, ...string[]]).describe('Target ATTOM endpoint key for this query'),
    params: z
      .record(z.any()) // Accept any object structure initially
      .optional()
      .default({})
      .describe('Parameters for the selected endpoint'),
  });

  return {
    name: toolName,
    description: `Execute an ATTOM API query. Specify the target endpoint using the 'kind' parameter (one of: ${endpointKeys.join(', ')})`, // Updated description
    parameters: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          description: `Target ATTOM endpoint key (one of: ${endpointKeys.join(', ')})`, // List all keys
        },
        params: {
          type: 'object',
          description: 'Parameters to forward to the selected endpoint (e.g., {"address1": "...", "address2": "..."})', // Updated example
          additionalProperties: true, // Allow any parameters
        },
      },
      required: ['kind'], // Only 'kind' is strictly required by this tool wrapper
    },
    /** Handler forwards to executeQuery while preserving fallback logic. */
    handler: async (input: Record<string, any>) => { // Accept raw object first
      writeLog(`[${toolName} Handler] Received RAW input: ${JSON.stringify(input, null, 2)}`);

      let kind: string;
      let paramsFromInput: Record<string, any>;

      try {
        // Basic validation for top-level structure
        if (typeof input !== 'object' || input === null) {
            throw new Error('Invalid input: Expected an object.');
        }
        if (typeof input.kind !== 'string' || !ALL_ENDPOINT_KEYS.includes(input.kind)) {
            throw new Error(`Invalid or missing 'kind'. Must be one of: ${ALL_ENDPOINT_KEYS.join(', ')}`);
        }
         kind = input.kind;
         // Use input.params directly, default to {} if missing
         paramsFromInput = (typeof input.params === 'object' && input.params !== null) ? input.params : {}; 
         writeLog(`[${toolName} Handler] Initial kind: ${kind}`);
         writeLog(`[${toolName} Handler] Initial paramsFromInput: ${JSON.stringify(paramsFromInput, null, 2)}`);

      } catch (initialError) {
         writeLog(`[${toolName} Handler] Initial input structure validation failed: ${initialError}`);
         throw initialError;
      }

      // --- WORKAROUND for potential Inspector nesting ---
      let actualParams = paramsFromInput;
      if (typeof paramsFromInput.params === 'object' && paramsFromInput.params !== null && typeof paramsFromInput.kind === 'string') {
          writeLog(`[${toolName} Handler] Detected nested structure, likely from Inspector. Using inner params.`);
          actualParams = paramsFromInput.params; // Use the inner params object
      }
      // --- END WORKAROUND ---

      writeLog(`[${toolName} Handler] Params before normalization: ${JSON.stringify(actualParams, null, 2)}`);

      // Normalize address fields within the actual parameters object
      const normalizedParams = await normalizeAddressInParams(actualParams);

      writeLog(`[${toolName} Handler] Normalized params (after normalization): ${JSON.stringify(normalizedParams)}`);

      // Proceed with executeQuery using the extracted kind and normalized (potentially un-nested) params
      return executeAttomQuery(kind, normalizedParams);
    },
  } as const;
}

// Build the single tool instance
const attomQueryTool = buildConsolidatedTool(
  'attom_query', // New single tool name
  ALL_ENDPOINT_KEYS // Use all endpoint keys
);

// Export only the single consolidated tool in the array expected by mcpServer.ts
export const groupedTools = [attomQueryTool] as const;
