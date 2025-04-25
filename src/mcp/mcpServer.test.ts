import { describe, it, expect } from 'vitest';
import { createMcpServer } from './mcpServer.js'; // Added .js extension
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Try specific subpath import

describe('MCP Server Setup', () => {
  it('should create an MCP server instance without errors', () => {
    let server: McpServer | null = null;
    // Use a try-catch block to check for errors during creation
    try {
      server = createMcpServer();
    } catch (error) {
      // Fail the test if an error occurs
      expect(error).toBeUndefined();
    }

    // Check if the server object was created and is an instance of McpServer
    expect(server).toBeInstanceOf(McpServer);
    expect(server).not.toBeNull();

    // Optional: Add more specific checks later if needed
  });

  // Add more tests here as needed for tools, resources, etc.
});