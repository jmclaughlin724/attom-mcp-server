# ATTOM MCP Server

A comprehensive TypeScript MCP server for ATTOM Data API with complete OpenAPI specification. This MCP server provides access to property details, sales history, assessments, and geographic data with built-in caching and fallback mechanisms, and can be easily integrated with other APIs, databases, and applications.

## Features

- **Intelligent Fallback**: Automatic address-to-ID conversion and other fallback mechanisms
- **Multi-level Caching**: In-memory and Redis caching with configurable TTL values
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Detailed Documentation**: Complete OpenAPI specification with examples
- **Dual Interface**: Both CLI and MCP server interfaces for flexibility
- **RESTful API**: Exposes ATTOM API functionality through RESTful endpoints
- **Docker Support**: Easy containerization and deployment

## Installation

```bash
# Install dependencies
npm install

# Copy the example environment file and update with your API keys
cp .env.example .env
```

## GitHub Deployment

To deploy this project to GitHub:

1. Create a new repository on GitHub
2. Initialize Git in your local project (if not already done):

   ```bash
   git init
   ```

3. Add your files to Git:

   ```bash
   git add .
   ```

4. Commit your changes:

   ```bash
   git commit -m "Initial commit of ATTOM MCP Server"
   ```

5. Link your local repository to the GitHub repository:

   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   ```

6. Push your code to GitHub:

   ```bash
   git push -u origin main
   ```

> **Note**: Make sure your `.env` file is in the `.gitignore` to avoid exposing API keys. Use `.env.example` as a template for others to set up their environment.

## Build

```bash
npm run build
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
ATTOM_API_KEY=your_api_key_here
ATTOM_API_BASE_URL=https://api.gateway.attomdata.com
CACHE_TTL_DEFAULT=3600
REDIS_URL=redis://localhost:6379
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|--------|
| `ATTOM_API_KEY` | Your ATTOM API key (required) | - |
| `ATTOM_API_BASE_URL` | Base URL for ATTOM API | [https://api.gateway.attomdata.com](https://api.gateway.attomdata.com) |
| `CACHE_TTL_DEFAULT` | Default TTL for cached responses in seconds | 3600 (1 hour) |
| `REDIS_URL` | Redis connection URL for caching | [redis://localhost:6379](redis://localhost:6379) |
| `ATTOM_API_RETRIES` | Number of retry attempts for failed API calls | 0 |

## Usage

### Running the MCP Server

```bash
# Start the MCP server in development mode
npm run server

# Start the MCP server in development mode with auto-reload
npm run dev

# Build and start the MCP server in production mode
npm run build && node dist/server.js
```

The MCP server will start on port 3000 (or the port specified in your .env file) and expose the following endpoints:

- `/health` - Health check endpoint
- `/mcp/get_property_basic_profile` - Get basic property information
- `/mcp/get_building_permits` - Get building permit history
- `/mcp/get_property_detail_owner` - Get detailed owner information for a property
- `/mcp/get_property_mortgage_details` - Get mortgage details for a property
- `/mcp/get_property_detail_mortgage_owner` - Get detailed mortgage and owner information
- `/mcp/get_property_avm_detail` - Get AVM (Automated Valuation Model) details
- `/mcp/get_property_assessment_detail` - Get assessment details for a property
- `/mcp/get_property_home_equity` - Get home equity information
- `/mcp/get_property_rental_avm` - Get rental AVM for a property
- `/mcp/get_property_details_with_schools` - Get property details with school information
- `/mcp/get_property_sales_history` - Get property sales history
- `/mcp/get_sales_history_snapshot` - Get sales history snapshot
- `/mcp/get_sales_history_basic` - Get basic sales history
- `/mcp/get_sales_history_expanded` - Get expanded sales history
- `/mcp/get_sales_history_detail` - Get detailed sales history
- `/mcp/get_sale_detail` - Get sale detail for a property
- `/mcp/get_sale_snapshot` - Get sale snapshot for a location
- `/mcp/get_all_events_detail` - Get all property events detail
- `/mcp/get_all_events_snapshot` - Get all property events snapshot
- `/mcp/get_sales_comparables_address` - Get sales comparables by address
- `/mcp/get_sales_comparables_propid` - Get sales comparables by property ID
- `/mcp/get_geographic_boundary` - Get geographic boundary by geoIdV4
- `/mcp/get_community_profile` - Get community profile information
- `/mcp/get_school_profile` - Get detailed information about a school
- `/mcp/get_school_district` - Get school district information
- `/mcp/search_schools` - Search for schools near a location
- `/mcp/search_poi` - Search for points of interest
- `/mcp/get_transportation_noise` - Get transportation noise information
- `/mcp/execute_query` - Generic endpoint for any ATTOM API query

### Command Line Interface

```bash
# Basic property profile by address
npx ts-node src/index.ts property basicprofile \
  --address1="123 Main St" \
  --address2="Anytown, CA 12345"

# Sales comparables by address
npx ts-node src/index.ts property salescomparables address \
  --street="123 Main St" \
  --city="Anytown" \
  --county="-" \
  --state="CA" \
  --zip="12345" \
  --searchType="Radius" \
  --minComps=2 \
  --maxComps=5 \
  --miles=3
```

### Programmatic Usage

#### Using the MCP Server

```typescript
// Using fetch to call the MCP server
async function getPropertyDetails() {
  const response = await fetch('http://localhost:3000/mcp/get_property_basic_profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      address1: '123 Main St',
      address2: 'Anytown, CA 12345'
    })
  });
  
  const data = await response.json();
  console.log(data);
}
```

#### Using the ATTOM API Directly

```typescript
import { fetchAttom } from './utils/fetcher';

async function getPropertyDetails() {
  const data = await fetchAttom('/propertyapi/v1.0.0/property/basicprofile', {
    address1: '123 Main St',
    address2: 'Anytown, CA 12345'
  });
  
  console.log(data);
}
```

## Caching

This MCP server implements a multi-level caching strategy:

- **In-memory cache**: Quick access to frequently requested data
- **Redis cache**: Distributed caching across multiple instances
- **Configurable TTL values**: Different TTL values based on data volatility

### Default TTL Values

| Data Type | TTL |
|-----------|-----|
| Property data | 24 hours |
| Sales comparables | 24 hours |
| Assessment data | 1 week |
| School data | 3 days |
| POI data | 3 days |
| Community data | 1 week |
| Transportation data | 1 week |

## Fallback Mechanisms

The MCP server implements intelligent fallback mechanisms to handle missing parameters:

- **Address-to-ID conversion**: Automatically converts address to ATTOM ID when needed
- **GeoID lookups**: Handles missing geographic identifiers
- **Parameter validation**: Validates and normalizes input parameters

## API Endpoints

### Property Endpoints

- `/propertyapi/v1.0.0/property/basicprofile` - Basic property information
- `/propertyapi/v1.0.0/property/buildingpermits` - Building permits information
- `/propertyapi/v1.0.0/property/detail` - Detailed property information
- `/propertyapi/v1.0.0/property/detailowner` - Property details with owner information
- `/propertyapi/v1.0.0/property/expandedprofile` - Expanded property profile
- `/propertyapi/v1.0.0/property/detailmortgage` - Property details with mortgage information
- `/propertyapi/v1.0.0/attomavm/detail` - Automated valuation model details
- `/propertyapi/v1.0.0/assessment/detail` - Assessment details

### Sales Endpoints

- `/propertyapi/v1.0.0/sale/detail` - Sale details
- `/propertyapi/v1.0.0/sale/snapshot` - Sale snapshot
- `/propertyapi/v1.0.0/saleshistory/snapshot` - Sales history snapshot
- `/propertyapi/v1.0.0/saleshistory/basichistory` - Basic sales history
- `/propertyapi/v1.0.0/saleshistory/expandedhistory` - Expanded sales history
- `/propertyapi/v1.0.0/saleshistory/detail` - Detailed sales history
- `/property/v2/salescomparables/address/{street}/{city}/{county}/{state}/{zip}` - Sales comparables by address
- `/property/v2/salescomparables/propid/{propId}` - Sales comparables by property ID

### Transaction Endpoints

- `/v4/transaction/salestrend` - Sales trend data

### Events Endpoints

- `/propertyapi/v1.0.0/allevents/detail` - All events detail
- `/propertyapi/v1.0.0/allevents/snapshot` - All events snapshot

### School Endpoints

- `/propertyapi/v4/property/detailwithschools` - Property details with schools
- `/v4/school/profile` - School profile
- `/v4/school/district` - School district
- `/v4/school/search` - School search

### Community Endpoints

- `/v4/neighborhood/community` - Community profile
- `/transportationnoise` - Transportation noise data

## Google Places Autocomplete Integration for MCP Server

This project includes integration with Google Places Autocomplete API to normalize addresses before querying the ATTOM API within an MCP server context. This ensures that addresses are properly formatted and validated, improving the accuracy of property data retrieval.

### How It Works

1. When an address is submitted to the MCP tool, it's sent to the Google Places Autocomplete API
2. The address is normalized into the ATTOM API format (address1 and address2)
3. The normalized address is then used to query the ATTOM API
4. Results are cached to improve performance for subsequent requests

### Setup

1. Ensure you have a valid Google Maps API key with Places API enabled
2. Add your API key to the `.env` file as `GOOGLE_MAPS_API_KEY`
3. The MCP server will automatically use the Google Places integration when processing address queries

### MCP Tools

The MCP server exposes the following tools:

1. **get_property_basic_profile**: Get basic property information
   - Input: address1, address2 (both required)
   - Output: Basic property details

2. **get_building_permits**: Get building permit history
   - Input: address1, address2 (both required)
   - Output: Building permit history

3. **get_property_detail_owner**: Get detailed owner information
   - Input: attomid (required)
   - Output: Property details with owner information

4. **get_property_mortgage_details**: Get mortgage details for a property
   - Input: attomid (required)
   - Output: Property mortgage details

5. **get_property_detail_mortgage_owner**: Get detailed mortgage and owner information
   - Input: attomid (required)
   - Output: Property details with mortgage and owner information

6. **get_property_avm_detail**: Get AVM details for a property
   - Input: address1, address2 (both required)
   - Output: Property AVM details

7. **get_property_assessment_detail**: Get assessment details for a property
   - Input: address1, address2 (both required)
   - Output: Property assessment details

8. **get_property_home_equity**: Get home equity information
   - Input: attomid (required)
   - Output: Property home equity information

9. **get_property_rental_avm**: Get rental AVM for a property
   - Input: attomid (required)
   - Output: Property rental AVM

10. **get_property_details_with_schools**: Get property details with school information
    - Input: attomid (required)
    - Output: Property details with school information

11. **get_property_sales_history**: Get property sales history
    - Input: address1, address2 (both required)
    - Output: Property sales history

12. **get_sales_history_snapshot**: Get sales history snapshot
    - Input: attomid (required)
    - Output: Sales history snapshot

13. **get_sales_history_basic**: Get basic sales history
    - Input: address1, address2 (both required)
    - Output: Basic sales history

14. **get_sales_history_expanded**: Get expanded sales history
    - Input: address1, address2 (both required)
    - Output: Expanded sales history

15. **get_sales_history_detail**: Get detailed sales history
    - Input: address1, address2 (both required)
    - Output: Detailed sales history

16. **get_sale_detail**: Get sale detail for a property
    - Input: address1, address2 (both required)
    - Output: Sale detail

17. **get_sale_snapshot**: Get sale snapshot for a location
    - Input: geoIdV4, startsalesearchdate, endsalesearchdate (all required)
    - Output: Sale snapshot

18. **get_all_events_detail**: Get all property events detail
    - Input: id (required)
    - Output: All property events detail

19. **get_all_events_snapshot**: Get all property events snapshot
    - Input: id (required)
    - Output: All property events snapshot

20. **get_sales_comparables_address**: Get sales comparables by address
    - Input: street, city, county, state, zip, searchType, minComps, maxComps, miles (all required)
    - Output: Sales comparables

21. **get_sales_comparables_propid**: Get sales comparables by property ID
    - Input: propId, searchType, minComps, maxComps, miles (all required)
    - Output: Sales comparables

22. **get_geographic_boundary**: Get geographic boundary by geoIdV4
    - Input: format, geoIdV4 (both required)
    - Output: Geographic boundary information

23. **get_community_profile**: Get community profile information
    - Input: geoIdV4 (required)
    - Output: Community profile information

24. **get_school_profile**: Get detailed information about a school
    - Input: geoIdV4 (required)
    - Output: School profile information

25. **get_school_district**: Get school district information
    - Input: geoIdV4 (required)
    - Output: School district information

26. **search_schools**: Search for schools near a location
    - Input: geoIdV4 (required), radius, page, pageSize (optional)
    - Output: School search results

27. **search_poi**: Search for points of interest
    - Input: address (required), radius, categoryName, recordLimit (optional)
    - Output: Points of interest search results

28. **get_transportation_noise**: Get transportation noise information
    - Input: address (required)
    - Output: Transportation noise information

29. **execute_query**: Generic endpoint for any ATTOM API query
    - Input: endpointKey, params
    - Output: Query results

### Usage Example

```typescript
// Example of using the get_property_basic_profile tool
const response = await fetch('http://localhost:3000/mcp/get_property_basic_profile', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    address1: '123 Main St',
    address2: 'Anytown, CA 12345'
  })
});

const propertyData = await response.json();
```

## Project Development

### Project Structure

```text
├── openapi/
│   └── attom-api-schema.yaml   # OpenAPI specification with endpoint parameters
├── src/
│   ├── index.ts               # CLI entry point
│   ├── server.ts              # MCP server implementation
│   ├── attomApiFramework.ts   # API framework
│   ├── mcp/
│   │   └── tools.ts           # MCP tool registrations
│   ├── config/
│   │   └── endpointConfig.ts  # Endpoint configuration
│   └── services/
│       ├── attomService.ts    # ATTOM API service
│       ├── queryManager.ts    # Query management
│       └── cacheManager.ts    # Cache management
├── .env                       # Environment variables
├── Dockerfile                 # Docker configuration
└── tsconfig.json              # TypeScript configuration
```

### Building and Testing

```bash
# Build the project
npm run build

# Run tests
npm test

# Start the server
npm start
```

## License

Proprietary - All rights reserved

## Support

For support, contact [ATTOM API Support](https://api.gateway.attomdata.com/support) or email [apisupport@attomdata.com](mailto:apisupport@attomdata.com).

### Area Endpoints

- /v4/area/boundary/detail

**POI**:

- /v4/neighborhood/poi

**Community**:

- /v4/neighborhood/community

**School**:

- /v4/school/profile
- /v4/school/district
- /v4/school/search

All param sets are enumerated in `openapiRegistry.ts` for a complete OpenAPI spec.

## Docker

### Building and Running the Docker Container

```bash
# Build the Docker image
docker build -t attom-mcp-server -f attom_mcp.dockerfile .

# Run the Docker container
docker run -p 3000:3000 \
  -e ATTOM_API_KEY=your_api_key_here \
  -e GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here \
  attom-mcp-server
```

### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3'

services:
  attom-mcp-server:
    build:
      context: .
      dockerfile: attom_mcp.dockerfile
    ports:
      - "3000:3000"
    environment:
      - ATTOM_API_KEY=your_api_key_here
      - GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

Run with Docker Compose:

```bash
docker-compose up -d
```

## Generate OpenAPI

npm run gen:openapi

## Implementation Details

- Fallback logic is in `utils/fallback.ts` (for address => attomid => geoIdV4).
- Prefetch caching is in `utils/caching.ts`.
- Full CLI usage is in `src/index.ts`.
- Full typed endpoints in `src/attomApiFramework.ts`.
- MCP server implementation in `src/server.ts`.
- MCP tools registration in `src/mcp/tools.ts`.

## Query Workflow

The MCP server implements an intelligent query workflow:

1. **Parameter Validation**: Validates input parameters and checks if required parameters are present
2. **Fallback Strategy Selection**: Selects the appropriate fallback strategy based on the endpoint and available parameters
3. **Address Normalization**: Normalizes addresses using Google Places API if needed
4. **Parameter Derivation**: Derives missing parameters (attomId, geoIdV4) from available parameters
5. **AllEvents Integration**: Uses the `/allevents/detail` endpoint as a primary data source when appropriate
6. **Data Extraction**: Extracts relevant data from comprehensive responses
7. **Fallback Execution**: Falls back to specific endpoints when needed
8. **Caching**: Caches results for improved performance

This workflow ensures that the MCP server can handle a wide variety of queries with minimal input parameters, making it easy to integrate with other systems.
