# ATTOM MCP Project Structure

```plaintext
attom_mcp/
├── src/
│   ├── runMcpServer.ts           # Starts the MCP server (MCP entry)
│   ├── openapiRegistry.ts        # OpenAPI schema registry
│   ├── mcp/
│   │   ├── mcpServer.ts          # MCP server configuration and registration
│   │   ├── groupedTools.ts       # Defines the single 'attom_query' MCP tool
│   ├── config/
│   │   └── endpointConfig.ts     # API endpoint configuration
│   ├── services/
│   │   ├── attomService.ts       # ATTOM API service
│   │   └── queryManager.ts       # Query management
│   └── utils/
│       ├── fetcher.ts            # HTTP request utility
│       ├── caching.ts            # In-memory caching mechanisms
│       ├── fallback.ts           # Fallback strategies
│       └── googlePlaces.ts       # Google Places API integration
├── openapi/
│   └── attom-api-schema.yaml     # OpenAPI specification
├── attom_mcp.dockerfile          # Docker configuration
├── run_container.sh              # Docker run script
├── .npmignore                    # npm package exclusions
├── .gitignore                    # Git exclusions
├── .env                          # Environment variables (not in Git)
├── .env.example                  # Example environment variables
├── README.md                     # Project documentation
├── framework.md                  # Project structure documentation
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Locked dependencies
├── tsconfig.json                 # TypeScript configuration
└── publish.yml                   # Publication configuration
```

## Key Components

### Server Implementation

- `runMcpServer.ts`: Starts the MCP server (HTTP or stdio).
- `mcp/mcpServer.ts`: Core MCP server configuration and tool registration.
- `mcp/groupedTools.ts`: Defines the single `attom_query` MCP tool exposed by the server.
- `services/attomService.ts`: Service layer handling interaction logic with ATTOM API (used by the MCP tool handler).
- `services/queryManager.ts`: Manages API queries, caching, and fallbacks (used by MCP handlers).

### Utilities

- `utils/caching.ts`: In-memory caching mechanisms
- `utils/fallback.ts`: Fallback strategies for API requests
- `utils/fetcher.ts`: HTTP request utility with error handling
- `utils/googlePlaces.ts`: Google Places API integration for address resolution

### Docker Support

- `attom_mcp.dockerfile`: Multi-stage Docker build for production
- `run_container.sh`: Helper script for running the Docker container
