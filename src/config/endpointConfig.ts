/**
 * ATTOM API Endpoint Configuration
 * 
 * This module centralizes all endpoint definitions and query types for the ATTOM API.
 * It provides a structured way to manage different query types and ensures proper API routing.
 */

import { z } from 'zod';

/**
 * Endpoint category types
 */
export enum EndpointCategory {
  PROPERTY = 'property',
  ASSESSMENT = 'assessment',
  SALE = 'sale',
  MORTGAGE = 'mortgage',
  PERMIT = 'permit',
  RENTAL = 'rental',
  SCHOOL = 'school',
  COMMUNITY = 'community',
  POI = 'poi',
  ALLEVENTS = 'allevents',
  AVM = 'avm',
  TRANSPORTATION = 'transportation',
}

/**
 * Fallback strategy types
 */
export enum FallbackStrategy {
  ADDRESS_TO_ATTOMID = 'address-to-attomid',
  ADDRESS_TO_GEOID = 'address-to-geoid',
  ATTOMID_TO_ID = 'attomid-to-id',
  TRY_ALLEVENTS_FIRST = 'try-allevents-first',
  NONE = 'none'
}

/**
 * Data fields available in allevents/detail response
 */
export enum AllEventsDataField {
  PROPERTY = 'property',
  AVM = 'avm',
  ASSESSMENT = 'assessment',
  SALE = 'sale',
  BUILDING = 'building',
  DEED = 'deed',
  MORTGAGE = 'mortgage',
  TAX = 'tax'
}

/**
 * Rate limit configuration for each endpoint
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerDay: number;
}

/**
 * Cache configuration for each endpoint
 */
export interface CacheConfig {
  ttlSeconds: number;
  useRedis: boolean;
  useMemory: boolean;
}

/**
 * Endpoint configuration interface
 */
export interface EndpointConfig {
  path: string;
  category: EndpointCategory;
  description: string;
  requiredParams: string[];
  optionalParams: string[];
  fallbackStrategy?: FallbackStrategy;
  preferredGeoIdSubtype?: string; // Preferred geocode subtype (e.g., 'ZI', 'DB', 'N2')
  allEventsFields?: AllEventsDataField[];
  rateLimit: RateLimitConfig;
  cache: CacheConfig;
  responseSchema?: z.ZodType<any>;
}

/**
 * Default rate limit configuration
 */
const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  requestsPerMinute: 10,
  requestsPerDay: 1000,
};

/**
 * Default cache configuration
 */
const DEFAULT_CACHE: CacheConfig = {
  ttlSeconds: 3600, // 1 hour
  useRedis: false,
  useMemory: true,
};

/**
 * Property-specific cache configuration (longer TTL)
 */
const PROPERTY_CACHE: CacheConfig = {
  ttlSeconds: 86400, // 24 hours
  useRedis: false,
  useMemory: true,
};

/**
 * Volatile data cache configuration (shorter TTL)
 */
const VOLATILE_CACHE: CacheConfig = {
  ttlSeconds: 900, // 15 minutes
  useRedis: false,
  useMemory: true,
};

/**
 * Endpoint configurations
 */
export const endpoints: Record<string, EndpointConfig> = {
  // AllEvents endpoint - comprehensive property data
  allEventsDetail: {
    path: '/propertyapi/v1.0.0/allevents/detail',
    category: EndpointCategory.ALLEVENTS,
    description: 'Comprehensive property information including assessment, AVM, and sales data',
    requiredParams: ['id'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ATTOMID_TO_ID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },
  
  // Property endpoints
  propertyBasicProfile: {
    path: '/propertyapi/v1.0.0/property/basicprofile',
    category: EndpointCategory.PROPERTY,
    description: 'Basic property information',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },

  propertyExpandedProfile: {
    path: '/propertyapi/v1.0.0/property/expandedprofile',
    category: EndpointCategory.PROPERTY,
    description: 'Expanded property information with additional details',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },
  
  propertyDetailOwner: {
    path: '/propertyapi/v1.0.0/property/detailowner',
    category: EndpointCategory.PROPERTY,
    description: 'Detailed property information with owner data',
    requiredParams: ['attomid'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_ATTOMID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },
  
  propertyDetailMortgage: {
    path: '/propertyapi/v1.0.0/property/detailmortgage',
    category: EndpointCategory.MORTGAGE,
    description: 'Property mortgage details',
    requiredParams: ['attomid'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_ATTOMID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },
  
  propertyBuildingPermits: {
    path: '/propertyapi/v1.0.0/property/buildingpermits',
    category: EndpointCategory.PERMIT,
    description: 'Get a basic property information and building permits detail for a specific address.',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },
  
  propertyRentalAVM: {
    path: '/propertyapi/v1.0.0/valuation/rentalavm',
    category: EndpointCategory.RENTAL,
    description: 'Rental AVM for a property',
    requiredParams: ['attomid'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_ATTOMID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },
  
  homeEquity: {
    path: '/propertyapi/v1.0.0/valuation/homeequity',
    category: EndpointCategory.AVM,
    description: 'Home equity valuation for a property',
    requiredParams: ['attomid'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_ATTOMID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },
  
  avmSnapshot: {
    path: '/propertyapi/v1.0.0/avm/snapshot',
    category: EndpointCategory.AVM,
    description: 'AVM snapshot for a property',
    requiredParams: ['attomid'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_ATTOMID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },
  
  avmDetail: {
    path: '/propertyapi/v1.0.0/attomavm/detail',
    category: EndpointCategory.AVM,
    description: 'Detailed AVM information for a property',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },
  
  avmHistoryDetail: {
    path: '/propertyapi/v1.0.0/avmhistory/detail',
    category: EndpointCategory.AVM,
    description: 'AVM history for a property',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },
  
  propertyAssessmentDetail: {
    path: '/propertyapi/v1.0.0/assessment/detail',
    category: EndpointCategory.ASSESSMENT,
    description: 'Property assessment details',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },
  
  propertyAVMDetail: {
    path: '/propertyapi/v1.0.0/attomavm/detail',
    category: EndpointCategory.AVM,
    description: 'Property AVM details',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },

  propertyDetailsWithSchools: {
    path: '/propertyapi/v4/property/detailwithschools',
    category: EndpointCategory.PROPERTY,
    description: 'Property details with assigned schools',
    requiredParams: ['attomid'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_ATTOMID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },
  
  // Sales history variants
  salesHistorySnapshot: {
    path: '/propertyapi/v1.0.0/saleshistory/snapshot',
    category: EndpointCategory.SALE,
    description: 'Sales history snapshot for a property',
    requiredParams: ['attomid'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_ATTOMID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },

  // Sale detail and snapshot endpoints
  saleDetail: {
    path: '/propertyapi/v1.0.0/sale/detail',
    category: EndpointCategory.SALE,
    description: 'Sale detail for a property',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },

  saleSnapshot: {
    path: '/propertyapi/v1.0.0/sale/snapshot',
    category: EndpointCategory.SALE,
    description: 'Sale snapshot for a property',
    requiredParams: ['geoIdV4', 'startsalesearchdate', 'endsalesearchdate'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_GEOID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },

  transactionSalesTrend: {
    path: '/propertyapi/v1.0.0/transaction/salestrend',
    category: EndpointCategory.SALE,
    description: 'Sales trend data for a location over time',
    requiredParams: ['geoIdV4', 'interval', 'startyear', 'endyear'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_GEOID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },

  salesHistoryBasic: {
    path: '/propertyapi/v1.0.0/saleshistory/basichistory',
    category: EndpointCategory.SALE,
    description: 'Basic sales history for a property',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },

  salesHistoryExpanded: {
    path: '/propertyapi/v1.0.0/saleshistory/expandedhistory',
    category: EndpointCategory.SALE,
    description: 'Expanded sales history for a property',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },

  salesHistoryDetail: {
    path: '/propertyapi/v1.0.0/saleshistory/detail',
    category: EndpointCategory.SALE,
    description: 'Detailed sales history for a property',
    requiredParams: ['address1', 'address2'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },
  
  // Community endpoints
  communityProfile: {
    path: '/v4/neighborhood/community',
    category: EndpointCategory.COMMUNITY,
    description: 'Community profile information',
    requiredParams: ['geoIdV4'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_GEOID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },
  
  // School endpoints
  schoolSearch: {
    path: '/v4/school/search',
    category: EndpointCategory.SCHOOL,
    description: 'Search for schools in an area',
    requiredParams: ['geoIdV4'],
    optionalParams: ['latitude', 'longitude', 'radius', 'page', 'pageSize'],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_GEOID,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },

  schoolProfile: {
    path: '/v4/school/profile',
    category: EndpointCategory.SCHOOL,
    description: 'Get detailed information about a school',
    requiredParams: ['geoIdV4'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_GEOID,
    preferredGeoIdSubtype: 'SB', // Use SB geocode for school profiles
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },

  schoolDistrict: {
    path: '/v4/school/district',
    category: EndpointCategory.SCHOOL,
    description: 'Get detailed information about a school district',
    requiredParams: ['geoIdV4'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.ADDRESS_TO_GEOID,
    preferredGeoIdSubtype: 'DB', // Use DB geocode for school districts
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },
  
  // POI endpoints
  poiSearch: {
    path: '/v4/poi/search',
    category: EndpointCategory.POI,
    description: 'Search for points of interest',
    requiredParams: ['address', 'categoryName', 'radius'],
    optionalParams: ['point', 'zipcode'],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: VOLATILE_CACHE,
  },

  // Transportation endpoints
  transportationNoise: {
    path: '/transportationnoise',
    category: EndpointCategory.TRANSPORTATION,
    description: 'Get transportation noise data',
    requiredParams: ['address'],
    optionalParams: [],
    fallbackStrategy: FallbackStrategy.NONE,
    rateLimit: DEFAULT_RATE_LIMIT,
    cache: PROPERTY_CACHE,
  },
};

/**
 * Get endpoint configuration by key
 * @param key Endpoint key
 * @returns Endpoint configuration
 */
export function getEndpointConfig(key: string): EndpointConfig {
  const config = endpoints[key];
  if (!config) {
    throw new Error(`Unknown endpoint key: ${key}`);
  }
  return config;
}

/**
 * Get all endpoints in a specific category
 * @param category Endpoint category
 * @returns Array of endpoint configurations
 */
export function getEndpointsByCategory(category: EndpointCategory): EndpointConfig[] {
  return Object.values(endpoints).filter(endpoint => endpoint.category === category);
}

/**
 * Check if a request has all required parameters
 * @param endpointKey Endpoint key
 * @param params Request parameters
 * @returns True if all required parameters are present
 */
export function hasRequiredParams(endpointKey: string, params: Record<string, any>): boolean {
  const config = getEndpointConfig(endpointKey);
  return config.requiredParams.every(param => params[param] !== undefined);
}

/**
 * Get fallback strategy for an endpoint
 * @param endpointKey Endpoint key
 * @returns Fallback strategy or undefined if none
 */
export function getFallbackStrategy(endpointKey: string): FallbackStrategy | undefined {
  const config = getEndpointConfig(endpointKey);
  return config.fallbackStrategy;
}

/**
 * Get AllEvents fields for an endpoint
 * @param endpointKey Endpoint key
 * @returns Array of AllEvents fields or undefined if none
 */
export function getAllEventsFields(endpointKey: string): AllEventsDataField[] | undefined {
  const config = getEndpointConfig(endpointKey);
  return config.allEventsFields;
}

/**
 * Check if an endpoint can use AllEvents data
 * @param endpointKey Endpoint key
 * @returns True if endpoint can use AllEvents data
 */
export function canUseAllEventsData(endpointKey: string): boolean {
  const config = getEndpointConfig(endpointKey);
  return config.fallbackStrategy === FallbackStrategy.TRY_ALLEVENTS_FIRST && 
         Array.isArray(config.allEventsFields) && 
         config.allEventsFields.length > 0;
}
