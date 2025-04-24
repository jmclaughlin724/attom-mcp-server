// src/openapiRegistry.ts

import { z } from 'zod';
import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const openApiRegistry = new OpenAPIRegistry();
const errorSchema = z.object({}).describe('ErrorResponse');

// Register API information
openApiRegistry.registerComponent('securitySchemes', 'apiKey', {
  type: 'apiKey',
  in: 'header',
  name: 'apikey',
  description: 'API key for ATTOM Data Solutions API'
});

// Register API information
// The OpenAPI metadata is handled by the generator when we create the document
// We'll register components and paths instead of trying to set the metadata directly

// Register schemas and routes as needed
// The OpenAPI version and info will be set when generating the final document

/**
 * Examples of param sets for property endpoints:
 */
const addressFallbackParams = z.object({
  attomid: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
}).describe('Either attomid OR address1+address2 for fallback');

const dateRangeParams = z.object({
  startsalesearchdate: z.string().regex(/\d{4}-\d{2}-\d{2}/),
  endsalesearchdate: z.string().regex(/\d{4}-\d{2}-\d{2}/),
}).describe('Start & end sale date in YYYY-MM-DD format');

// Basic property paths
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/property/basicprofile',
  summary: 'Get property basic profile by ID or fallback from address',
  description: 'Returns basic property information including address, owner, and basic building characteristics.',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Property basic profile data',
      content: {
        'application/json': {
          schema: z.any().describe('BasicProfileResponse'),
        },
      },
    },
    '400': {
      description: 'Bad Request - Invalid parameters',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '401': {
      description: 'Unauthorized - Invalid or missing API key',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '404': {
      description: 'Not Found - Property not found',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '429': {
      description: 'Too Many Requests - Rate limit exceeded',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '500': {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
  tags: ['Property'],
});

// Sales comparables paths
openApiRegistry.registerPath({
  method: 'get',
  path: '/property/v2/salescomparables/propid/{propId}',
  summary: 'Get sales comparables by property ID',
  description: 'Returns comparable property sales based on ATTOM property ID with configurable search parameters.',
  request: {
    params: z.object({
      propId: z.string().describe('ATTOM property ID')
    }),
    query: z.object({
      searchType: z.enum(['Radius', 'Subdivision', 'Block']).optional().describe('Type of search to perform'),
      minComps: z.number().int().min(1).max(25).optional().describe('Minimum number of comparables'),
      maxComps: z.number().int().min(1).max(25).optional().describe('Maximum number of comparables'),
      miles: z.number().min(0.1).max(10).optional().describe('Search radius in miles'),
    }),
  },
  responses: {
    '200': {
      description: 'Sales comparables data',
      content: {
        'application/json': {
          schema: z.any().describe('SalesComparablesResponse'),
        },
      },
    },
    '400': {
      description: 'Bad Request - Invalid parameters',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '401': {
      description: 'Unauthorized - Invalid or missing API key',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '404': {
      description: 'Not Found - Property not found',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '429': {
      description: 'Too Many Requests - Rate limit exceeded',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '500': {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
  tags: ['Sale'],
});

// Community API paths
openApiRegistry.registerPath({
  method: 'get',
  path: '/v4/neighborhood/community',
  summary: 'Get community profile by GeoID V4',
  description: 'Returns comprehensive community data including demographics, crime statistics, and more.',
  request: {
    query: z.object({
      geoIdV4: z.string().regex(/^N2/).describe('Neighborhood GeoID V4 (must start with N2)')
    }),
  },
  responses: {
    '200': {
      description: 'Community profile data',
      content: {
        'application/json': {
          schema: z.any().describe('CommunityResponse'),
        },
      },
    },
    '400': {
      description: 'Bad Request - Invalid parameters',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '401': {
      description: 'Unauthorized - Invalid or missing API key',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '404': {
      description: 'Not Found - Community not found',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '429': {
      description: 'Too Many Requests - Rate limit exceeded',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '500': {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
  tags: ['Community'],
});

// School API paths
openApiRegistry.registerPath({
  method: 'get',
  path: '/v4/school/profile',
  summary: 'Get school profile by GeoID V4',
  description: 'Returns detailed information about a specific school.',
  request: {
    query: z.object({
      geoIdV4: z.string().regex(/^SB/).describe('School GeoID V4 (must start with SB)')
    }),
  },
  responses: {
    '200': {
      description: 'School profile data',
      content: {
        'application/json': {
          schema: z.any().describe('SchoolProfileResponse'),
        },
      },
    },
    '400': {
      description: 'Bad Request - Invalid parameters',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '401': {
      description: 'Unauthorized - Invalid or missing API key',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '404': {
      description: 'Not Found - School not found',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '429': {
      description: 'Too Many Requests - Rate limit exceeded',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '500': {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
  tags: ['School'],
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/v4/school/search',
  summary: 'Search for schools near a location',
  description: 'Returns a list of schools within a specified radius of a location.',
  request: {
    query: z.object({
      latitude: z.number().optional().describe('Latitude coordinate'),
      longitude: z.number().optional().describe('Longitude coordinate'),
      address: z.string().optional().describe('Full address'),
      radius: z.number().min(0.1).max(25).optional().describe('Search radius in miles (default: 5)')
    }),
  },
  responses: {
    '200': {
      description: 'School search data',
      content: {
        'application/json': {
          schema: z.any().describe('SchoolSearchResponse'),
        },
      },
    },
    '400': {
      description: 'Bad Request - Invalid parameters',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '401': {
      description: 'Unauthorized - Invalid or missing API key',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '429': {
      description: 'Too Many Requests - Rate limit exceeded',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '500': {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
  tags: ['School'],
});

// POI API paths
openApiRegistry.registerPath({
  method: 'get',
  path: '/v4/neighborhood/poi',
  summary: 'Search for points of interest near a location',
  description: 'Returns a list of points of interest within a specified radius of a location.',
  request: {
    query: z.object({
      point: z.string().optional().describe('WKT point (e.g., POINT(-74.019215,40.706554))'),
      address: z.string().optional().describe('Full address'),
      zipcode: z.string().optional().describe('ZIP code'),
      categoryName: z.string().optional().describe('Business categories (pipe-separated)'),
      radius: z.number().min(0.1).max(25).optional().describe('Search radius in miles (default: 5)')
    }),
  },
  responses: {
    '200': {
      description: 'POI search data',
      content: {
        'application/json': {
          schema: z.any().describe('POISearchResponse'),
        },
      },
    },
    '400': {
      description: 'Bad Request - Invalid parameters',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '401': {
      description: 'Unauthorized - Invalid or missing API key',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '429': {
      description: 'Too Many Requests - Rate limit exceeded',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
    '500': {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
    },
  },
  tags: ['POI'],
});

openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/property/buildingpermits',
  summary: 'Get property building permits',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Property building permits data',
      content: {
        'application/json': {
          schema: z.any().describe('BuildingPermitsResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});

// detailowner
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/property/detailowner',
  summary: 'Property detail with owner info',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Property detail owner data',
      content: {
        'application/json': {
          schema: z.any().describe('DetailOwnerResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});

// detailmortgage
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/property/detailmortgage',
  summary: 'Property detail with mortgage info',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Property detail mortgage data',
      content: {
        'application/json': {
          schema: z.any().describe('DetailMortgageResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});

// detailmortgageowner
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/property/detailmortgageowner',
  summary: 'Property detail with mortgage + owner info',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Property detail mortgage owner data',
      content: {
        'application/json': {
          schema: z.any().describe('DetailMortgageOwnerResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});

// attomavm/detail
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/attomavm/detail',
  summary: 'AVM detail for a property',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'AVM detail data',
      content: {
        'application/json': {
          schema: z.any().describe('AttomAvmResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});

// valuation/homeequity
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/valuation/homeequity',
  summary: 'Estimated home equity for a property',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Home equity data',
      content: {
        'application/json': {
          schema: z.any().describe('HomeEquityResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});

// valuation/rentalavm
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/valuation/rentalavm',
  summary: 'Rental AVM for a property',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Rental AVM data',
      content: {
        'application/json': {
          schema: z.any().describe('RentalAvmResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});

// assessment/detail
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/assessment/detail',
  summary: 'Assessment detail for a property',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Assessment detail data',
      content: {
        'application/json': {
          schema: z.any().describe('AssessmentDetailResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});

// saleshistory => snapshot, basichistory, expandedhistory, detail
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/saleshistory/snapshot',
  summary: 'Sales history snapshot for a property',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Sales history snapshot data',
      content: {
        'application/json': {
          schema: z.any().describe('SaleshistorySnapshotResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/saleshistory/basichistory',
  summary: 'Basic deed + mortgage history for a property',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Basic deed + mortgage history data',
      content: {
        'application/json': {
          schema: z.any().describe('SaleshistoryBasicResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/saleshistory/expandedhistory',
  summary: 'Expanded deed + mortgage + preforeclosure for a property',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Expanded deed + mortgage + preforeclosure data',
      content: {
        'application/json': {
          schema: z.any().describe('SaleshistoryExpandedResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/saleshistory/detail',
  summary: 'Sale history detail for a property',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Sale history detail data',
      content: {
        'application/json': {
          schema: z.any().describe('SaleshistoryDetailResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});

// sale => detail, snapshot
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/sale/detail',
  summary: 'Last sale for a property address or ID fallback',
  request: { query: addressFallbackParams },
  responses: {
    '200': {
      description: 'Last sale data',
      content: {
        'application/json': {
          schema: z.any().describe('SaleDetailResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/sale/snapshot',
  summary: 'Sale info for a geography or fallback from address => geoIdV4 + dateRange',
  request: {
    query: addressFallbackParams
      .extend({
        geoIdV4: z.string().optional(),
        startsalesearchdate: z.string(),
        endsalesearchdate: z.string(),
      })
      .describe('SaleSnapshotParams')
  },
  responses: {
    '200': {
      description: 'Sale info data',
      content: {
        'application/json': {
          schema: z.any().describe('SaleSnapshotResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});

// allevents => detail, snapshot
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/allevents/detail',
  summary: 'All event detail for a property. If no id, fallback from address => attomid => id',
  request: {
    query: z.object({
      id: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
    }).describe('AlleventsDetailParams')
  },
  responses: {
    '200': {
      description: 'All event detail data',
      content: {
        'application/json': {
          schema: z.any().describe('AlleventsDetailResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});
openApiRegistry.registerPath({
  method: 'get',
  path: '/propertyapi/v1.0.0/allevents/snapshot',
  summary: 'All event snapshot for a property. If no id, fallback from address => attomid => id',
  request: {
    query: z.object({
      id: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
    }).describe('AlleventsSnapshotParams')
  },
  responses: {
    '200': {
      description: 'All event snapshot data',
      content: {
        'application/json': {
          schema: z.any().describe('AlleventsSnapshotResponse'),
        },
      },
    },
  },
  tags: ['Property'],
});



/**
 * Now define area, poi, community, school, etc. with no placeholders:
 */

// area => boundary/detail
openApiRegistry.registerPath({
  method: 'get',
  path: '/v4/area/boundary/detail',
  summary: 'Returns boundaries for the specified geoIdV4 (fallback if no geoIdV4 => address => property => geoIdV4).',
  request: {
    query: z.object({
      geoIdV4: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
      format: z.string().optional(),
    }).describe('AreaBoundaryDetailParams')
  },
  responses: {
    '200': {
      description: 'Boundaries data',
      content: {
        'application/json': {
          schema: z.any().describe('AreaBoundaryDetailResponse'),
        },
      },
    },
  },
  tags: ['Area'],
});

// poi => search
openApiRegistry.registerPath({
  method: 'get',
  path: '/v4/neighborhood/poi',
  summary: 'Points of interest near an address, zip, or lat/lon point',
  request: {
    query: z.object({
      address: z.string().optional(),
      zipcode: z.string().optional(),
      point: z.string().optional(),
      radius: z.number().optional(),
      categoryName: z.string().optional(),
      recordLimit: z.number().optional(),
    }).describe('PoiSearchParams')
  },
  responses: {
    '200': {
      description: 'Points of interest data',
      content: {
        'application/json': {
          schema: z.any().describe('PoiSearchResponse'),
        },
      },
    },
  },
  tags: ['POI'],
});

// community => profile
openApiRegistry.registerPath({
  method: 'get',
  path: '/v4/neighborhood/community',
  summary: 'Community profile for geoIdV4 or fallback from address => N2 etc.',
  request: {
    query: z.object({
      geoIdV4: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
    }).describe('CommunityProfileParams')
  },
  responses: {
    '200': {
      description: 'Community profile data',
      content: {
        'application/json': {
          schema: z.any().describe('CommunityProfileResponse'),
        },
      },
    },
  },
  tags: ['Community'],
});

// school => profile
openApiRegistry.registerPath({
  method: 'get',
  path: '/v4/school/profile',
  summary: 'School profile for a given SB geoIdV4 or fallback from address => property => SB code',
  request: {
    query: z.object({
      geoIdV4: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
    }).describe('SchoolProfileParams')
  },
  responses: {
    '200': {
      description: 'School profile data',
      content: {
        'application/json': {
          schema: z.any().describe('SchoolProfileResponse'),
        },
      },
    },
  },
  tags: ['School'],
});

// school => district
openApiRegistry.registerPath({
  method: 'get',
  path: '/v4/school/district',
  summary: 'School district for DB geoIdV4 or fallback from address => property => DB code',
  request: {
    query: z.object({
      geoIdV4: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
    }).describe('SchoolDistrictParams')
  },
  responses: {
    '200': {
      description: 'School district data',
      content: {
        'application/json': {
          schema: z.any().describe('SchoolDistrictResponse'),
        },
      },
    },
  },
  tags: ['School'],
});

// school => search
openApiRegistry.registerPath({
  method: 'get',
  path: '/v4/school/search',
  summary: 'School search by geoIdV4 or fallback from address => N2 code, plus radius/paging.',
  request: {
    query: z.object({
      geoIdV4: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
      radius: z.number().optional(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
    }).describe('SchoolSearchParams')
  },
  responses: {
    '200': {
      description: 'School search data',
      content: {
        'application/json': {
          schema: z.any().describe('SchoolSearchResponse'),
        },
      },
    },
  },
  tags: ['School'],
});
