/**
 * MCP Tools Registration
 * 
 * This file registers the ATTOM API tools with the MCP framework.
 */

import { AttomService } from '../services/attomService';
import { executeQuery } from '../services/queryManager';

// Create ATTOM service instance
const attomService = new AttomService();

// Define parameter types for better type safety

// For endpoints that require address parameters
interface AddressParams {
  address1: string;
  address2: string;
}

// For endpoints that require attomid parameter
interface AttomIdParams {
  attomid: string;
}

// For endpoints that require attomid
interface AttomIdParams {
  attomid: string;
}

// For endpoints that require address1 and address2
interface AddressParams {
  address1: string;
  address2: string;
}

interface SaleSnapshotParams {
  geoIdV4: string;
  startsalesearchdate?: string;
  endsalesearchdate?: string;
}

interface TransportationNoiseParams {
  address: string;
}

interface GeographicBoundaryParams {
  format: string;
  geoIdV4: string;
}

interface SalesComparablesAddressParams {
  street: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  searchType?: string;
  minComps?: number;
  maxComps?: number;
  miles?: number;
}

interface SalesComparablesPropIdParams {
  propId: string;
  searchType?: string;
  minComps?: number;
  maxComps?: number;
  miles?: number;
}

interface PropertyDetailsWithSchoolsParams {
  attomid: string;
}

// For community endpoints that require geoIdV4
interface CommunityParams {
  geoIdV4: string;
}

// For school profile endpoint
interface SchoolProfileParams {
  geoIdV4: string;
}

// For school district endpoint
interface SchoolDistrictParams {
  geoIdV4: string;
}

interface SchoolSearchParams {
  geoIdV4: string;
  radius?: number | string;
  page?: number;
  pageSize?: number;
}

interface SchoolParams {
  address?: string;
  address1?: string;
  address2?: string;
  geoIdV4?: string;
  radius?: number | string;
  page?: number;
  pageSize?: number;
}

interface POIParams {
  address: string;
  radius?: string | number;
  categoryName?: string;
  recordLimit?: number;
}

interface AllEventsParams {
  id: string;
}

interface ExecuteQueryParams {
  endpointKey: string;
  params: Record<string, any>;
}

// MCP tool definitions
export const mcpTools = [
  {
    name: 'get_property_basic_profile',
    description: 'Get basic property information',
    parameters: {
      type: 'object',
      properties: {
        address1: { type: 'string', description: 'Street address' },
        address2: { type: 'string', description: 'City, state, ZIP' }
      },
      required: ['address1', 'address2']
    },
    handler: async (params: AddressParams) => {
      const { address1, address2 } = params;
      return attomService.getPropertyBasicProfile({ address1, address2 });
    }
  },
  {
    name: 'get_property_mortgage_details',
    description: 'Get mortgage details for a property',
    parameters: {
      type: 'object',
      properties: {
        attomid: { type: 'string', description: 'ATTOM property ID' }
      },
      required: ['attomid']
    },
    handler: async (params: AttomIdParams) => {
      const { attomid } = params;
      return attomService.getPropertyMortgageDetails({ attomid });
    }
  },
  {
    name: 'get_property_detail_mortgage_owner',
    description: 'Get detailed mortgage and owner information for a property',
    parameters: {
      type: 'object',
      properties: {
        attomid: { type: 'string', description: 'ATTOM property ID' }
      },
      required: ['attomid']
    },
    handler: async (params: AttomIdParams) => {
      const { attomid } = params;
      return attomService.getPropertyDetailMortgageOwner({ attomid });
    }
  },
  {
    name: 'get_property_avm_detail',
    description: 'Get AVM (Automated Valuation Model) details for a property',
    parameters: {
      type: 'object',
      properties: {
        address1: { type: 'string', description: 'Street address' },
        address2: { type: 'string', description: 'City, state, ZIP' }
      },
      required: ['address1', 'address2']
    },
    handler: async (params: AddressParams) => {
      const { address1, address2 } = params;
      return attomService.getPropertyAVMDetail({ address1, address2 });
    }
  },
  {
    name: 'get_property_assessment_detail',
    description: 'Get assessment details for a property',
    parameters: {
      type: 'object',
      properties: {
        address1: { type: 'string', description: 'Street address' },
        address2: { type: 'string', description: 'City, state, ZIP' }
      },
      required: ['address1', 'address2']
    },
    handler: async (params: AddressParams) => {
      const { address1, address2 } = params;
      return attomService.getPropertyAssessmentDetail({ address1, address2 });
    }
  },
  {
    name: 'get_property_home_equity',
    description: 'Get home equity information for a property',
    parameters: {
      type: 'object',
      properties: {
        attomid: { type: 'string', description: 'ATTOM property ID' }
      },
      required: ['attomid']
    },
    handler: async (params: AttomIdParams) => {
      const { attomid } = params;
      return attomService.getPropertyHomeEquity({ attomid });
    }
  },
  {
    name: 'get_property_rental_avm',
    description: 'Get rental AVM (Automated Valuation Model) for a property',
    parameters: {
      type: 'object',
      properties: {
        attomid: { type: 'string', description: 'ATTOM property ID' }
      },
      required: ['attomid']
    },
    handler: async (params: AttomIdParams) => {
      const { attomid } = params;
      return attomService.getPropertyRentalAVM({ attomid });
    }
  },
  {
    name: 'get_avm_snapshot',
    description: 'Get AVM snapshot for a property',
    parameters: {
      type: 'object',
      properties: {
        attomid: { type: 'string', description: 'ATTOM property ID' }
      },
      required: ['attomid']
    },
    handler: async (params: { attomid: string }) => {
      const { attomid } = params;
      return attomService.getAvmSnapshot({ attomid });
    }
  },
  {
    name: 'get_avm_history_detail',
    description: 'Get AVM history for a property',
    parameters: {
      type: 'object',
      properties: {
        address1: { type: 'string', description: 'Street address' },
        address2: { type: 'string', description: 'City, state, ZIP' }
      },
      required: ['address1', 'address2']
    },
    handler: async (params: { address1: string, address2: string }) => {
      const { address1, address2 } = params;
      return attomService.getAvmHistoryDetail({ address1, address2 });
    }
  },
  {
    name: 'get_property_details_with_schools',
    description: 'Get property details with school information',
    parameters: {
      type: 'object',
      properties: {
        attomid: { type: 'string', description: 'ATTOM property ID' }
      },
      required: ['attomid']
    },
    handler: async (params: PropertyDetailsWithSchoolsParams) => {
      const { attomid } = params;
      return attomService.getPropertyDetailsWithSchools({ attomid });
    }
  },
  {
    name: 'get_building_permits',
    description: 'Get building permit history for a property',
    parameters: {
      type: 'object',
      properties: {
        address1: { type: 'string', description: 'Street address' },
        address2: { type: 'string', description: 'City, state, ZIP' }
      }
    },
    handler: async (params: AddressParams) => {
      const { address1, address2 } = params;
      return attomService.getPropertyBuildingPermits({ address1, address2 });
    }
  },
  {
    name: 'get_property_detail_owner',
    description: 'Get detailed owner information for a property',
    parameters: {
      type: 'object',
      properties: {
        attomid: { type: 'string', description: 'ATTOM property ID' }
      },
      required: ['attomid']
    },
    handler: async (params: AttomIdParams) => {
      const { attomid } = params;
      return attomService.getPropertyDetailOwner({ attomid });
    }
  },
  {
    name: 'get_property_sales_history',
    description: 'Get sales history for a property',
    parameters: {
      type: 'object',
      required: ['address1', 'address2'],
      properties: {
        address1: { type: 'string', description: 'Street address' },
        address2: { type: 'string', description: 'City, state, ZIP' }
      }
    },
    handler: async (params: { address1: string; address2: string }) => {
      const { address1, address2 } = params;
      return attomService.getPropertySalesHistory({ address1, address2 });
    }
  },
  {
    name: 'get_sales_history_snapshot',
    description: 'Get sales history snapshot for a property',
    parameters: {
      type: 'object',
      properties: {
        attomid: { type: 'string', description: 'ATTOM property ID' }
      },
      required: ['attomid']
    },
    handler: async (params: AttomIdParams) => {
      const { attomid } = params;
      return attomService.getSalesHistorySnapshot({ attomid });
    }
  },
  {
    name: 'get_sales_history_basic',
    description: 'Get basic sales history for a property',
    parameters: {
      type: 'object',
      properties: {
        address1: { type: 'string', description: 'Street address' },
        address2: { type: 'string', description: 'City, state, ZIP' }
      },
      required: ['address1', 'address2']
    },
    handler: async (params: AddressParams) => {
      const { address1, address2 } = params;
      return attomService.getSalesHistoryBasic({ address1, address2 });
    }
  },
  {
    name: 'get_sales_history_expanded',
    description: 'Get expanded sales history for a property',
    parameters: {
      type: 'object',
      properties: {
        address1: { type: 'string', description: 'Street address' },
        address2: { type: 'string', description: 'City, state, ZIP' }
      },
      required: ['address1', 'address2']
    },
    handler: async (params: AddressParams) => {
      const { address1, address2 } = params;
      return attomService.getSalesHistoryExpanded({ address1, address2 });
    }
  },
  {
    name: 'get_sales_history_detail',
    description: 'Get detailed sales history for a property',
    parameters: {
      type: 'object',
      properties: {
        address1: { type: 'string', description: 'Street address' },
        address2: { type: 'string', description: 'City, state, ZIP' }
      },
      required: ['address1', 'address2']
    },
    handler: async (params: AddressParams) => {
      const { address1, address2 } = params;
      return attomService.getSalesHistoryDetail({ address1, address2 });
    }
  },
  {
    name: 'get_sale_detail',
    description: 'Get sale detail for a property',
    parameters: {
      type: 'object',
      required: ['address1', 'address2'],
      properties: {
        address1: { type: 'string', description: 'Street address' },
        address2: { type: 'string', description: 'City, state, ZIP' }
      }
    },
    handler: async (params: { address1: string; address2: string }) => {
      const { address1, address2 } = params;
      return attomService.getSaleDetail({ address1, address2 });
    }
  },
  {
    name: 'get_sale_snapshot',
    description: 'Get sale snapshot for a location',
    parameters: {
      type: 'object',
      required: ['geoIdV4'],
      properties: {
        geoIdV4: { type: 'string', description: 'Geographic ID (v4)' },
        startsalesearchdate: { type: 'string', description: 'Start sale search date' },
        endsalesearchdate: { type: 'string', description: 'End sale search date' }
      }
    },
    handler: async (params: { 
      geoIdV4: string; 
      startsalesearchdate?: string; 
      endsalesearchdate?: string 
    }) => {
      const { geoIdV4, startsalesearchdate, endsalesearchdate } = params;
      return attomService.getSaleSnapshot({ 
        geoIdV4, 
        startsalesearchdate, 
        endsalesearchdate 
      });
    }
  },
  {
    name: 'get_community_profile',
    description: 'Get community profile information for a neighborhood',
    parameters: {
      type: 'object',
      properties: {
        geoIdV4: { type: 'string', description: 'N2 geoIdV4 for community profile' }
      },
      required: ['geoIdV4']
    },
    handler: async (params: CommunityParams) => {
      const { geoIdV4 } = params;
      return attomService.getCommunityProfile({ geoIdV4 });
    }
  },
  {
    name: 'search_schools',
    description: 'Search for schools near a location',
    parameters: {
      type: 'object',
      properties: {
        geoIdV4: { type: 'string', description: 'GeoIdV4 for school search' },
        radius: { type: 'number', description: 'Search radius in miles (default: 5)' },
        page: { type: 'number', description: 'Page number for pagination' },
        pageSize: { type: 'number', description: 'Number of results per page' }
      },
      required: ['geoIdV4']
    },
    handler: async (params: SchoolSearchParams) => {
      const { geoIdV4, radius, page, pageSize } = params;
      // Convert radius to number if it's a string
      const radiusNum = typeof radius === 'string' ? parseFloat(radius) : radius;
      return attomService.searchSchools({ 
        geoIdV4, 
        radius: radiusNum, 
        page, 
        pageSize 
      });
    }
  },
  {
    name: 'search_poi',
    description: 'Search for points of interest near a location',
    parameters: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Full address' },
        radius: { type: 'string', description: 'Radius in miles (default: 5)' },
        categoryName: { type: 'string', description: 'Business categories (pipe-separated)' },
        recordLimit: { type: 'number', description: 'Maximum number of records to return' }
      },
      required: ['address']
    },
    handler: async (params: POIParams) => {
      const { address, radius, categoryName } = params;
      // Convert radius to number if it's a string
      const radiusNum = typeof radius === 'string' ? parseFloat(radius) : radius;
      return attomService.searchPOI({ 
        address, 
        radius: radiusNum, 
        categoryName      });
    }
  },
  {
    name: 'get_all_events_detail',
    description: 'Get all property events detail',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ATTOM property ID' }
      },
      required: ['id']
    },
    handler: async (params: AllEventsParams) => {
      const { id } = params;
      return attomService.getAllEventsDetail({ id });
    }
  },
  {
    name: 'get_all_events_snapshot',
    description: 'Get all property events snapshot',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ATTOM property ID' }
      },
      required: ['id']
    },
    handler: async (params: AllEventsParams) => {
      const { id } = params;
      return attomService.getAllEventsSnapshot({ id });
    }
  },
  {
    name: 'get_sales_comparables_address',
    description: 'Get sales comparables by address',
    parameters: {
      type: 'object',
      properties: {
        street: { type: 'string', description: 'Street address' },
        city: { type: 'string', description: 'City' },
        county: { type: 'string', description: 'County' },
        state: { type: 'string', description: 'State' },
        zip: { type: 'string', description: 'ZIP code' },
        searchType: { type: 'string', description: 'Search type' },
        minComps: { type: 'number', description: 'Minimum number of comparables' },
        maxComps: { type: 'number', description: 'Maximum number of comparables' },
        miles: { type: 'number', description: 'Search radius in miles' }
      },
      required: ['street', 'city', 'county', 'state', 'zip']
    },
    handler: async (params: SalesComparablesAddressParams) => {
      const { street, city, county, state, zip, searchType, minComps, maxComps, miles } = params;
      return attomService.getSalesComparablesAddress({ 
        street,
        city,
        county,
        state,
        zip,
        searchType: searchType ?? undefined,
        minComps: minComps ?? undefined,
        maxComps: maxComps ?? undefined,
        miles: miles ?? undefined
      });
    }
  },
  {
    name: 'get_sales_comparables_propid',
    description: 'Get sales comparables by property ID',
    parameters: {
      type: 'object',
      properties: {
        propId: { type: 'string', description: 'Property ID' },
        searchType: { type: 'string', description: 'Search type' },
        minComps: { type: 'number', description: 'Minimum number of comparables' },
        maxComps: { type: 'number', description: 'Maximum number of comparables' },
        miles: { type: 'number', description: 'Search radius in miles' }
      },
      required: ['propId']
    },
    handler: async (params: SalesComparablesPropIdParams) => {
      const { propId, searchType, minComps, maxComps, miles } = params;
      return attomService.getSalesComparablesPropId({ 
        propId,
        searchType: searchType ?? undefined,
        minComps: minComps ?? undefined,
        maxComps: maxComps ?? undefined,
        miles: miles ?? undefined
      });
    }
  },
  {
    name: 'get_geographic_boundary',
    description: 'Get geographic boundary by geoIdV4',
    parameters: {
      type: 'object',
      properties: {
        format: { type: 'string', description: 'Format (e.g., geojson)' },
        geoIdV4: { type: 'string', description: 'Geographic ID (v4)' }
      },
      required: ['format', 'geoIdV4']
    },
    handler: async (params: GeographicBoundaryParams) => {
      const { format, geoIdV4 } = params;
      return attomService.getGeographicBoundary({ format, geoIdV4 });
    }
  },
  {
    name: 'get_school_profile',
    description: 'Get detailed information about a school',
    parameters: {
      type: 'object',
      properties: {
        geoIdV4: { type: 'string', description: 'SB geoIdV4 for school profile' }
      },
      required: ['geoIdV4']
    },
    handler: async (params: SchoolProfileParams) => {
      const { geoIdV4 } = params;
      return attomService.getSchoolProfile({ geoIdV4 });
    }
  },
  {
    name: 'get_school_district',
    description: 'Get school district information for a location',
    parameters: {
      type: 'object',
      properties: {
        geoIdV4: { type: 'string', description: 'N2 geoIdV4 for district search' }
      },
      required: ['geoIdV4']
    },
    handler: async (params: SchoolDistrictParams) => {
      const { geoIdV4 } = params;
      return attomService.getSchoolDistrict({ geoIdV4 });
    }
  },
  {
    name: 'get_transportation_noise',
    description: 'Get transportation noise information for a location by address',
    parameters: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Full address (e.g., 123 Main St, Anytown, CA 12345)' }
      },
      required: ['address']
    },
    handler: async (params: TransportationNoiseParams) => {
      const { address } = params;
      return attomService.getTransportationNoise({ address });
    }
  },
  {
    name: 'execute_query',
    description: 'Execute any ATTOM API query by endpoint key and parameters',
    parameters: {
      type: 'object',
      properties: {
        endpointKey: { type: 'string', description: 'Endpoint key from endpointConfig' },
        params: { 
          type: 'object', 
          description: 'Parameters for the query',
          additionalProperties: true
        }
      },
      required: ['endpointKey']
    },
    handler: async (params: ExecuteQueryParams) => {
      const { endpointKey, params: queryParams } = params;
      return executeQuery(endpointKey, queryParams || {});
    }
  }
];
