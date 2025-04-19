// src/mcp_handler.ts
import { normalizeAddress, searchProperty, schemas } from './mcp_tools.js';

/**
 * MCP Handler for ATTOM API with Google Places integration
 * 
 * This file exports the necessary functions and schemas for MCP server integration.
 * It provides tools for address normalization and property data retrieval.
 */

// Export MCP tools
export const mcpTools = {
  // Address normalization tool
  normalize_address: async (params: any) => {
    return normalizeAddress(params);
  },
  
  // Property search tool
  search_property: async (params: any) => {
    return searchProperty(params);
  }
};

// Export MCP tool schemas
export const mcpSchemas = {
  normalize_address: schemas.normalizeAddress,
  search_property: schemas.searchProperty
};

// Export default handler for MCP server
export default {
  tools: mcpTools,
  schemas: mcpSchemas
};
