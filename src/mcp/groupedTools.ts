/**
 * Grouped MCP Tools
 *
 * These tools consolidate ATTOM API endpoints by resource type. Each grouped tool
 * accepts a `kind` field that maps to a concrete endpoint key plus a `params`
 * object that is forwarded as‑is to `executeQuery`.  This reduces the overall
 * number of registered tools while preserving existing logic chains and fallback
 * behaviour handled inside `executeQuery` / `AttomService`.
 */

import { z } from 'zod';
import { executeQuery } from '../services/queryManager.js';
import { endpoints, EndpointCategory } from '../config/endpointConfig.js';

/**
 * Build an array of endpoint keys that belong to the supplied categories.
 */
function getEndpointKeys(categories: EndpointCategory[]): string[] {
  return Object.entries(endpoints)
    .filter(([, cfg]) => categories.includes(cfg.category))
    .map(([key]) => key);
}

// Group definitions ---------------------------------------------------------
const PROPERTY_CATEGORIES = [
  EndpointCategory.PROPERTY,
  EndpointCategory.ASSESSMENT,
  EndpointCategory.AVM,
  EndpointCategory.MORTGAGE,
  EndpointCategory.PERMIT,
  EndpointCategory.RENTAL,
  EndpointCategory.ALLEVENTS,
];

const SALES_CATEGORIES = [EndpointCategory.SALE];
const COMMUNITY_CATEGORIES = [EndpointCategory.COMMUNITY];
const MISC_CATEGORIES = [
  EndpointCategory.SCHOOL,
  EndpointCategory.POI,
  EndpointCategory.TRANSPORTATION,
];

/**
 * Helper to create a grouped tool definition in the same shape as items in
 * `mcpTools`. We generate a minimal JSON‑schema description for MCP
 * registration.  Detailed per‑endpoint validation continues to live in the
 * individual handlers executed via `executeQuery`.
 */
function buildGroupedTool(toolName: string, endpointKeys: string[]) {
  // Build a Zod schema for runtime validation.
  const toolSchema = z.object({
    kind: z.enum(endpointKeys as [string, ...string[]]).describe('Endpoint key for this query'),
    params: z
      .record(z.any())
      .default({})
      .describe('Parameters for the selected endpoint'),
  });

  return {
    name: toolName,
    description: `Execute an ATTOM API query in the ${toolName.replace('_', ' ')} group.`,
    parameters: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          description: `Endpoint key (one of: ${endpointKeys.join(', ')})`,
        },
        params: {
          type: 'object',
          description: 'Parameters to forward to the selected endpoint',
          additionalProperties: true,
        },
      },
      required: ['kind'],
    },
    /** Handler forwards to executeQuery while preserving fallback logic. */
    handler: async (input: z.infer<typeof toolSchema>) => {
      const { kind, params } = toolSchema.parse(input);
      return executeQuery(kind, params ?? {});
    },
  } as const;
}

// Build tool instances ------------------------------------------------------
const propertyTool = buildGroupedTool(
  'property_query',
  getEndpointKeys(PROPERTY_CATEGORIES),
);

const salesTool = buildGroupedTool(
  'sales_query',
  getEndpointKeys(SALES_CATEGORIES),
);

const communityTool = buildGroupedTool(
  'community_query',
  getEndpointKeys(COMMUNITY_CATEGORIES),
);

const miscTool = buildGroupedTool('misc_query', getEndpointKeys(MISC_CATEGORIES));

export const groupedTools = [propertyTool, salesTool, communityTool, miscTool] as const;

// Named exports for easier unit testing
export const propertyQueryTool = propertyTool;
export const salesQueryTool = salesTool;
export const communityQueryTool = communityTool;
export const miscQueryTool = miscTool;
