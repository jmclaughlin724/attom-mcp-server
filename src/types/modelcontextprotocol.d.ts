/**
 * Type declarations for the Model Context Protocol SDK
 */

declare module '@modelcontextprotocol/sdk' {
  export class McpServer {
    constructor(options: { name: string; version: string; description: string });
    
    tool(
      name: string,
      paramsSchema: Record<string, any>,
      callback: (params: any) => Promise<any> | any
    ): any;
    
    resource(
      name: string,
      template: ResourceTemplate,
      callback: (uri: URL, params: Record<string, any>) => Promise<any> | any
    ): any;
    
    connect(transport: any): Promise<void>;
  }
  
  export class ResourceTemplate {
    constructor(template: string, options: { list?: any });
  }
  
  export class StdioServerTransport {
    constructor();
  }
  
  export class StreamableHttpServerTransport {
    constructor(options: { port: number });
  }
}

declare module '@modelcontextprotocol/sdk/dist/server/mcp.js' {
  export * from '@modelcontextprotocol/sdk';
}

declare module '@modelcontextprotocol/sdk/dist/server/resource.js' {
  export * from '@modelcontextprotocol/sdk';
}

declare module '@modelcontextprotocol/sdk/dist/server/stdio.js' {
  export * from '@modelcontextprotocol/sdk';
}

declare module '@modelcontextprotocol/sdk/dist/server/streamable-http.js' {
  export * from '@modelcontextprotocol/sdk';
}
