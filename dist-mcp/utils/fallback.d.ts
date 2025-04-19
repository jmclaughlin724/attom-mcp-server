import { NormalizedAddress } from './googlePlaces.js';
/**
 * Normalize address using Google Places API
 * @param address1 Street address
 * @param address2 City, state, ZIP
 * @returns Normalized address or null if not found
 */
export declare function normalizeAddress(address1: string, address2: string): Promise<NormalizedAddress | null>;
/**
 * Fallback to get ATTOM ID from address with caching
 * @param address1 Street address
 * @param address2 City, state, ZIP
 * @param cacheKey Cache key for request cache
 * @param useGoogleNormalization Whether to use Google Places for address normalization
 * @returns ATTOM ID or empty string if not found
 */
export declare function fallbackAttomIdFromAddressCached(address1: string, address2: string, cacheKey: string, useGoogleNormalization?: boolean): Promise<string>;
export declare function fallbackGeoIdV4FromAttomId(attomId: string, cacheKey: string): Promise<Record<string, string>>;
/**
 * Fallback to get school information by GeoID V4
 * @param geoIdV4 GeoID V4 value (must be SB type)
 * @returns School information or null if not found
 */
export declare function fallbackSchoolByGeoIdV4(geoIdV4: string): Promise<any>;
/**
 * Fallback to get community data by GeoID V4
 * @param geoIdV4 GeoID V4 value (must be N2 type)
 * @returns Community data or null if not found
 */
export declare function fallbackCommunityByGeoIdV4(geoIdV4: string): Promise<any>;
export declare function fallbackGeoIdV4SubtypeCached(address1: string, address2: string, subtype: string, cacheKey: string, useGoogleNormalization?: boolean): Promise<string>;
