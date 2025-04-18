# ATTOM MCP Project Structure

```plaintext
attom_mcp/
├── src/
│   ├── index.ts                  # CLI entry point
│   ├── server.ts                 # MCP server implementation
│   ├── attomApiFramework.ts      # Core API framework
│   ├── openapiRegistry.ts        # OpenAPI schema registry
│   ├── mcp_handler.ts            # MCP protocol handler
│   ├── mcp_tools.ts              # Legacy MCP tools
│   ├── mcp/
│   │   └── tools.ts              # MCP tool registrations
│   ├── config/
│   │   └── endpointConfig.ts     # API endpoint configuration
│   ├── services/
│   │   ├── attomService.ts       # ATTOM API service
│   │   └── queryManager.ts       # Query management
│   └── utils/
│       ├── fetcher.ts            # HTTP request utility
│       ├── caching.ts            # Caching mechanisms
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

- `server.ts`: Express.js server that implements the MCP protocol
- `mcp/tools.ts`: Registers all ATTOM API endpoints as MCP tools

### API Framework

- `attomApiFramework.ts`: Core framework for interacting with ATTOM API
- `services/attomService.ts`: Service layer for ATTOM API endpoints
- `services/queryManager.ts`: Manages API queries with caching and fallbacks

### Utilities

- `utils/caching.ts`: In-memory and Redis caching mechanisms
- `utils/fallback.ts`: Fallback strategies for API requests
- `utils/fetcher.ts`: HTTP request utility with error handling
- `utils/googlePlaces.ts`: Google Places API integration for address resolution

### Docker Support

- `attom_mcp.dockerfile`: Multi-stage Docker build for production
- `run_container.sh`: Helper script for running the Docker container
