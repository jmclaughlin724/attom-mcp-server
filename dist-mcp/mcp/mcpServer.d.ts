/**
 * Model Context Protocol Server Implementation
 *
 * This file implements the Model Context Protocol (MCP) server for the ATTOM API.
 * It integrates the existing ATTOM API tools with the MCP protocol.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
/**
 * Create and configure the MCP server
 */
export declare function createMcpServer(): McpServer;
/**
 * Start the MCP server with the specified transport
 * @param transportType The transport type to use (stdio or http)
 */
export declare function startMcpServer(transportType?: "stdio" | "http"): Promise<void>;
