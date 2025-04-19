// src/utils/caching.ts
import { fetchAttom } from './fetcher.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

export interface RequestCache {
  attomid?: string;
  geoIdV4?: Record<string, string>;
  [key: string]: any;
}

const requestCacheMap = new Map<string, RequestCache>();
const dataCache = new Map<string, CacheItem>();

// Endpoint-specific TTL configuration (in seconds)
const endpointTTL: Record<string, number> = {
  '/propertyapi/v1.0.0/property/detail': 86400, // 24 hours
  '/propertyapi/v1.0.0/property/basicprofile': 86400, // 24 hours
  '/propertyapi/v1.0.0/property/expandedprofile': 86400, // 24 hours
  '/property/v2/salescomparables/address/{street}/{city}/{county}/{state}/{zip}': 86400, // 24 hours
  '/property/v2/salescomparables/propid/{propId}': 86400, // 24 hours
  '/propertyapi/v1.0.0/assessment/detail': 604800, // 1 week
  '/propertyapi/v1.0.0/assessmenthistory/detail': 604800, // 1 week
  '/v4/neighborhood/community': 604800, // 1 week
  '/v4/school/profile': 259200, // 3 days
  '/v4/school/district': 604800, // 1 week
  '/v4/school/search': 259200, // 3 days
  '/v4/poi/search': 259200, // 3 days
  '/transportationnoise': 604800, // 1 week
};

export function getRequestCache(cacheKey: string): RequestCache {
  if (!requestCacheMap.has(cacheKey)) {
    requestCacheMap.set(cacheKey, {});
  }
  return requestCacheMap.get(cacheKey)!;
}

/**
 * Get the TTL for a specific endpoint
 * @param endpoint The API endpoint path
 * @returns TTL in seconds
 */
export function getCacheTTL(endpoint: string): number {
  // Parse the endpoint to handle path parameters
  const parsedEndpoint = endpoint.replace(/\/[^/]+(?=\/|$)/g, '/{param}');
  return endpointTTL[parsedEndpoint] ?? parseInt(process.env.CACHE_TTL_DEFAULT ?? '3600');
}

/**
 * Store data in cache with TTL
 * @param key Cache key
 * @param data Data to cache
 * @param endpoint API endpoint (for TTL determination)
 */
export function cacheData(key: string, data: any, endpoint: string): void {
  const ttl = getCacheTTL(endpoint);
  dataCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttl * 1000 // Convert to milliseconds
  });
}

/**
 * Get data from cache if it exists and is not expired
 * @param key Cache key
 * @returns Cached data or undefined if not found or expired
 */
export function getCachedData(key: string): any {
  if (!dataCache.has(key)) {
    return undefined;
  }
  
  const cacheItem = dataCache.get(key)!;
  const now = Date.now();
  
  // Check if cache is expired
  if (now - cacheItem.timestamp > cacheItem.ttl) {
    dataCache.delete(key); // Remove expired item
    return undefined;
  }
  
  return cacheItem.data;
}

/**
 * If we anticipate multiple calls that need property detail,
 * we can fetch it once, store in cache.
 */
export async function preloadAddressMetadata(address1: string, address2: string, cacheKey: string) {
  const cache = getRequestCache(cacheKey);
  if (cache.attomid !== undefined && cache.geoIdV4 !== undefined) {
    return; // already loaded
  }
  console.log(`[Prefetch] /property/detail => ${address1}, ${address2}`);
  const detail = await fetchAttom('/propertyapi/v1.0.0/property/detail', { address1, address2 });
  cache.attomid = detail?.property?.[0]?.identifier?.attomId?.toString() ?? '';
  cache.geoIdV4 = detail?.property?.[0]?.location?.geoIdV4 ?? {};
}
