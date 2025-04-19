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
export declare function getRequestCache(cacheKey: string): RequestCache;
/**
 * Get the TTL for a specific endpoint
 * @param endpoint The API endpoint path
 * @returns TTL in seconds
 */
export declare function getCacheTTL(endpoint: string): number;
/**
 * Store data in cache with TTL
 * @param key Cache key
 * @param data Data to cache
 * @param endpoint API endpoint (for TTL determination)
 */
export declare function cacheData(key: string, data: any, endpoint: string): void;
/**
 * Get data from cache if it exists and is not expired
 * @param key Cache key
 * @returns Cached data or undefined if not found or expired
 */
export declare function getCachedData(key: string): any;
/**
 * If we anticipate multiple calls that need property detail,
 * we can fetch it once, store in cache.
 */
export declare function preloadAddressMetadata(address1: string, address2: string, cacheKey: string): Promise<void>;
