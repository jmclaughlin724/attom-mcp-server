import dotenv from 'dotenv';
// Load environment variables *immediately*
console.error('[runMcpServer] Loading environment variables...');
dotenv.config();
console.error(`[runMcpServer] Environment loaded. ATTOM_API_KEY set: ${!!process.env.ATTOM_API_KEY}`);

/**
 * Run MCP Server
 *
 * This script starts the Model Context Protocol server for the ATTOM API.
 * It can be run in either stdio or HTTP mode.
 */
console.error('[runMcpServer] Script started.');

import { startMcpServer } from './mcp/mcpServer.js';

// Get transport type from command line arguments
const args = process.argv.slice(2);
const transportType = args.includes('--stdio') ? 'stdio' : 'http';
console.error(`[runMcpServer] Determined transport type: ${transportType}`);

// Start the MCP server
console.error('[runMcpServer] Attempting to start MCP server...');
startMcpServer(transportType).catch((error: Error) => {
  console.error('[runMcpServer] Failed to start MCP server:', error);
  process.exit(1);
});
