/**
 * Model Context Protocol Server Implementation
 * 
 * This file implements the Model Context Protocol (MCP) server for the ATTOM API.
 * It integrates the existing ATTOM API tools with the MCP protocol.
 */

// Import MCP SDK modules using ES module imports
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { groupedTools } from './groupedTools.js'; // Import groupedTools
import { AttomService } from "../services/attomService.js";
import { normalizeAddressStringForAttom } from "../utils/googlePlaces.js";
import { writeLog } from "../utils/logger.js";

// Create ATTOM service instance
const attomService = new AttomService();

/**
 * Create and configure the MCP server
 */
export function createMcpServer() {
  // Create an MCP server
  const server = new McpServer({
    name: "ATTOM Property Data",
    version: "1.0.0",
    description: "Access property data, sales history, and more through the ATTOM API"
  });

  // Standalone tools (normalize_address, search_property) removed to enforce
  // interaction via groupedTools -> queryManager logic chain.

  // Helper function to create a Zod schema from JSON schema properties
  function createZodSchemaFromProperties(properties: any, required: readonly string[] = []): z.ZodRawShape {
    const shape: z.ZodRawShape = {};
    for (const [key, prop] of Object.entries(properties)) {
      const propValue = prop as { type: string; description?: string };
      let fieldSchema: z.ZodTypeAny;

      switch (propValue.type) {
        case 'string':
          fieldSchema = z.string();
          break;
        case 'number':
          fieldSchema = z.number();
          break;
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.any();
      }

      if (propValue.description) {
        fieldSchema = fieldSchema.describe(propValue.description);
      }

      // Make field optional if not in the required list
      if (! (required ?? []).includes(key)) {
        fieldSchema = fieldSchema.optional();
      }

      shape[key] = fieldSchema;
    }
    return shape;
  }

  // Decide whether to keep legacy per‑endpoint tools based on env flag
  // If KEEP_LEGACY_TOOLS is set to the string "true" we append the older one‑endpoint tools.
  // Otherwise (unset, "false", any other value) we expose only the 4 grouped tools.

  // Register the grouped ATTOM API tools
  for (const tool of groupedTools) {
    let zodShape: z.ZodRawShape = {};

    if (tool.parameters.type === 'object' && tool.parameters.properties) {
      // Generate the shape directly from properties
      zodShape = createZodSchemaFromProperties(tool.parameters.properties, tool.parameters.required ?? []);
    } else {
       // Handle cases without properties (e.g., no params needed)
       console.warn(`[MCP Server] Tool ${tool.name} has no properties defined in parameters.`);
       zodShape = {}; // Empty shape for tools with no parameters
    }

    server.tool(
      tool.name,
      zodShape, // Pass the generated ZodRawShape
      async (params: Record<string, any>) => {
        try {
          writeLog(`[McpServer:Handler] Invoking tool: ${tool.name}, Params: ${JSON.stringify(params)}`);
          // Convert params to the expected format for the handler
          const result = await tool.handler(params as any);
          writeLog(`[McpServer:Handler] Tool ${tool.name} executed successfully.`);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
          };
        } catch (error: any) {
          writeLog(`[McpServer:Handler] Error in tool ${tool.name}: ${error instanceof Error ? error.message : String(error)}`); // Log message first
          // Log the full error server-side for better debugging
          console.error("[MCP Error Handler] Caught error:", error);
          // Construct detailed error response
          const errorResponse = {
            success: false,
            error: error.message ?? error.stack ?? "Unknown error", 
            details: error.details, // Include details if they exist
            params // Include original params for context
          };
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify(errorResponse, null, 2)
            }]
          };
        }
      }
    );
  }

  // Add property resource
  server.resource(
    "property",
    new ResourceTemplate("property://{address}", { list: undefined }),
    async (uri: URL, params: Record<string, any>) => {
      const address = params.address as string;
      try {
        // Normalize the address
        const normalized = await normalizeAddressStringForAttom(address);
        if (!normalized) {
          throw new Error("Failed to normalize address");
        }
        
        // Fetch property data
        const propertyData = await attomService.executeQuery("propertyDetail", {
          address1: normalized.address1,
          address2: normalized.address2
        });
        
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(propertyData, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({
              error: error.message ?? "Unknown error",
              address
            }, null, 2)
          }]
        };
      }
    }
  );

  return server;
}

/**
 * Start the MCP server with the specified transport
 * @param transportType The transport type to use (stdio or http)
 */
export async function startMcpServer(transportType: "stdio" | "http" = "http") {
  const server = createMcpServer();
  
  if (transportType === "stdio") {
    // Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP server started with stdio transport");
  } else {
    // Start HTTP server
    const transport = new StreamableHTTPServerTransport({ 
      // Use undefined to disable session management, or provide a session ID generator
      sessionIdGenerator: undefined
    });
    await server.connect(transport);
    console.error(`MCP server started with HTTP transport`);
  }
}
