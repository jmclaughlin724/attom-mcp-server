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
  const toolSchema = z.object({
    kind: z.enum(endpointKeys as [string, ...string[]]).describe('Target ATTOM endpoint key for this query'),
    params: z
      .record(z.any())
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
          description: 'Parameters to forward to the selected endpoint',
          additionalProperties: true, // Allow any parameters
        },
      },
      required: ['kind'], // Only 'kind' is strictly required by this tool wrapper
    },
    /** Handler forwards to executeQuery while preserving fallback logic. */
    handler: async (input: z.infer<typeof toolSchema>) => {
      // Validate the input against the schema (kind is required, params is optional object)
      const { kind, params } = toolSchema.parse(input);

      // Normalize ONLY address fields within the provided params
      const normalizedParams = await normalizeAddressInParams(params ?? {});

      // Log the normalization for debugging
      writeLog(`[${toolName}] Original params: ${JSON.stringify(params)}`);
      writeLog(`[${toolName}] Normalized params: ${JSON.stringify(normalizedParams)}`);

      // Then proceed with executeQuery, which handles endpoint-specific validation and fallbacks
      return executeAttomQuery(kind, normalizedParams);
    },
  } as const; // Use 'as const' for better type inference if needed elsewhere
}

// Build the single tool instance
const attomQueryTool = buildConsolidatedTool(
  'attom_query', // New single tool name
  ALL_ENDPOINT_KEYS // Use all endpoint keys
);

// Export only the single consolidated tool in the array expected by mcpServer.ts
export const groupedTools = [attomQueryTool] as const;

// No longer exporting individual tools
// export const propertyQueryTool = propertyTool;
// export const salesQueryTool = salesTool;
// export const communityQueryTool = communityTool;
// export const miscQueryTool = miscTool;
