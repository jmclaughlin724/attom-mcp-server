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
import { mcpTools } from "./tools.js";
import { AttomService } from "../services/attomService.js";
import { normalizeAddressStringForAttom } from "../utils/googlePlaces.js";

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

  // Register address normalization tool
  server.tool(
    "normalize_address",
    { address: z.string().describe("Full address to normalize (e.g., '123 Main St, Anytown, CA 12345')") },
    async ({ address }: { address: string }) => {
      try {
        const normalized = await normalizeAddressStringForAttom(address);
        
        if (!normalized) {
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({
                success: false,
                error: "Failed to normalize address",
                original: address
              }, null, 2)
            }]
          };
        }
        
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              success: true,
              normalized: {
                address1: normalized.address1,
                address2: normalized.address2,
                formattedAddress: normalized.formattedAddress,
                latitude: normalized.latitude,
                longitude: normalized.longitude
              },
              original: address
            }, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              success: false,
              error: error.message ?? "Unknown error during address normalization",
              original: address
            }, null, 2)
          }]
        };
      }
    }
  );

  // Register property search tool
  server.tool(
    "search_property",
    {
      address1: z.string().describe("Street address (e.g., '123 Main St')"),
      address2: z.string().describe("City, state, ZIP (e.g., 'Anytown, CA 12345')"),
      useGoogleNormalization: z.boolean().optional().default(true).describe("Whether to use Google Places for address normalization")
    },
    async ({ address1, address2, useGoogleNormalization }: { address1: string, address2: string, useGoogleNormalization?: boolean }) => {
      try {
        let finalAddress1 = address1;
        let finalAddress2 = address2;
        
        // Normalize address using Google Places if enabled
        if (useGoogleNormalization) {
          try {
            const normalized = await normalizeAddressStringForAttom(`${address1}, ${address2}`);
            if (normalized) {
              finalAddress1 = normalized.address1;
              finalAddress2 = normalized.address2;
            }
          } catch (error: unknown) {
            console.warn('[Google Places] Address normalization failed, using original address', 
              error instanceof Error ? error.message : String(error));
          }
        }
        
        // Fetch property data from ATTOM API
        const propertyData = await attomService.executeQuery("propertyDetail", {
          address1: finalAddress1,
          address2: finalAddress2
        });
        
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              success: true,
              property: propertyData.property,
              normalizedAddress: {
                address1: finalAddress1,
                address2: finalAddress2
              }
            }, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              success: false,
              error: error.message ?? "Unknown error during property search",
              params: { address1, address2, useGoogleNormalization }
            }, null, 2)
          }]
        };
      }
    }
  );

  // Register all ATTOM API tools from the mcpTools array
  for (const tool of mcpTools) {
    // Convert JSON Schema properties to Zod schema
    const zodSchema: Record<string, z.ZodType<any>> = {};
    
    for (const [key, prop] of Object.entries(tool.parameters.properties)) {
      // Use type assertion to access properties safely
      const propValue = prop as { type: string; description?: string };
      if (propValue.type === 'string') {
        zodSchema[key] = z.string().describe(propValue.description ?? '');
      } else if (propValue.type === 'number') {
        zodSchema[key] = z.number().describe(propValue.description ?? '');
      } else if (propValue.type === 'boolean') {
        zodSchema[key] = z.boolean().describe(propValue.description ?? '');
      } else {
        zodSchema[key] = z.any().describe(propValue.description ?? '');
      }
    }
    
    server.tool(
      tool.name,
      zodSchema,
      async (params: Record<string, any>) => {
        try {
          // Convert params to the expected format for the handler
          const result = await tool.handler(params as any);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
          };
        } catch (error: any) {
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({
                success: false,
                error: error.message ?? "Unknown error",
                params
              }, null, 2)
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
    console.log("MCP server started with stdio transport");
  } else {
    // Start HTTP server
    const transport = new StreamableHTTPServerTransport({ 
      // Use undefined to disable session management, or provide a session ID generator
      sessionIdGenerator: undefined
    });
    await server.connect(transport);
    console.log(`MCP server started with HTTP transport`);
  }
}
