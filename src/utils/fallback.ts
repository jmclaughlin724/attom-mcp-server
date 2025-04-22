// src/utils/fallback.ts
import { fetchAttom } from './fetcher.js';
import { getRequestCache, cacheData, getCachedData } from './caching.js';
import { writeLog } from './logger.js';
import { normalizeAddressStringForAttom, NormalizedAddress } from './googlePlaces.js';
import dotenv from 'dotenv';

// Import type only to avoid runtime dependency
type AttomApiError = { statusCode: number };

// Load environment variables
dotenv.config();

// Fallback configuration
const MAX_FALLBACK_ATTEMPTS = parseInt(process.env.MAX_FALLBACK_ATTEMPTS ?? '3');
const FALLBACK_DELAY_MS = parseInt(process.env.FALLBACK_DELAY_MS ?? '500');

/**
 * Sleep utility for fallback delay
 * @param ms Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Normalize address using Google Places API
 * @param address1 Street address
 * @param address2 City, state, ZIP
 * @returns Normalized address or null if not found
 */
export async function normalizeAddress(
  address1: string,
  address2: string
): Promise<NormalizedAddress | null> {
  // Try to normalize the full address
  const fullAddress = `${address1}, ${address2}`;
  return normalizeAddressStringForAttom(fullAddress);
}

/**
 * Helper function to normalize address if enabled
 * Extracted to reduce cognitive complexity
 * @param address1 Street address
 * @param address2 City, state, ZIP
 * @param useGoogleNormalization Whether to use Google Places for address normalization
 * @returns Object with normalized addresses
 */
async function normalizeAddressIfEnabled(
  address1: string,
  address2: string,
  useGoogleNormalization: boolean
): Promise<{ normalizedAddress1: string; normalizedAddress2: string }> {
  let normalizedAddress1 = address1;
  let normalizedAddress2 = address2;
  
  if (useGoogleNormalization) {
    try {
      const normalized = await normalizeAddress(address1, address2);
      if (normalized) {
        normalizedAddress1 = normalized.address1;
        normalizedAddress2 = normalized.address2;
        writeLog(`[Google Places] Normalized address: ${normalized.formattedAddress}, address1: ${normalizedAddress1}, address2: ${normalizedAddress2}`);
      }
    } catch (error: unknown) {
      writeLog(`[Google Places] Address normalization failed, using original address. Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return { normalizedAddress1, normalizedAddress2 };
}

/**
 * Extract ATTOM ID from various response structures
 * @param response API response object
 * @returns ATTOM ID if found, null otherwise
 */
/**
 * Check for ATTOM ID in the status object
 */
function checkStatusAttomId(response: any): string | null {
  if (response?.status?.attomId) {
    writeLog(`[Fallback] Found attomId in status: ${response.status.attomId}`);
    return response.status.attomId.toString();
  }
  return null;
}

/**
 * Check for ATTOM ID in the primary property identifier
 */
function checkPropertyIdentifierAttomId(response: any): string | null {
  if (response?.property?.[0]?.identifier?.attomId) {
    writeLog(`[Fallback] Found attomId in property identifier: ${response.property[0].identifier.attomId}`);
    return response.property[0].identifier.attomId.toString();
  }
  
  // Check alternate location (Id field as a known alias) - just log, don't return
  if (response?.property?.[0]?.identifier?.Id) {
    writeLog(`[Fallback] Found Id in property identifier: ${response.property[0].identifier.Id} (Using as fallback)`);
  }
  
  return null;
}

/**
 * Check for ATTOM ID directly in the property object
 */
function checkDirectPropertyAttomId(response: any): string | null {
  if (response?.property?.[0]?.attomId) {
    writeLog(`[Fallback] Found attomId in property object: ${response.property[0].attomId}`);
    return response.property[0].attomId.toString();
  }
  return null;
}

/**
 * Check for ATTOM ID in property array elements
 */
function checkPropertyArrayAttomIds(response: any): string | null {
  if (!Array.isArray(response?.property)) {
    return null;
  }
  
  for (const prop of response.property) {
    // Check identifier within array element
    if (prop?.identifier?.attomId) {
      writeLog(`[Fallback] Found attomId in property array identifier: ${prop.identifier.attomId}`);
      return prop.identifier.attomId.toString();
    }
    
    // Check direct attomId within array element
    if (prop?.attomId) {
      writeLog(`[Fallback] Found attomId directly in property array element: ${prop.attomId}`);
      return prop.attomId.toString();
    }
    
    // Check identifier 'Id' within array element - just log, don't return
    if (prop?.identifier?.Id) {
       writeLog(`[Fallback] Found Id in property array identifier: ${prop.identifier.Id} (Using as fallback)`);
    }
  }
  
  return null;
}

/**
 * Extract ATTOM ID from various response structures
 * Main function with reduced cognitive complexity
 */
export function extractAttomIdFromResponse(response: any): string | null {
  if (!response) {
    writeLog('[Fallback] Response is null or undefined.');
    return null;
  }

  // Try each potential ATTOM ID location in priority order
  const attomId = checkStatusAttomId(response) ?? 
                  checkPropertyIdentifierAttomId(response) ??
                  checkDirectPropertyAttomId(response) ??
                  checkPropertyArrayAttomIds(response);
                  
  if (!attomId) {
    writeLog('[Fallback] No valid ATTOM ID found in response structure.');
  }
  
  // Note: We intentionally do not check assessment.parcelNumber or sale.parcelNumber as these are different identifiers
  // and not ATTOM IDs.
  
  return attomId;
}

/**
 * Fallback to get GeoID V4 from ATTOM ID with caching
 * @param attomId ATTOM property ID
 * @param cacheKey Cache key for request cache
 * @returns GeoID V4 map or empty object if not found
 */
/**
 * Helper function to fetch property details for GeoID V4 lookup
 * Extracted to reduce cognitive complexity
 * @param attomId ATTOM property ID
 * @returns Property detail response or null
 */
async function fetchPropertyDetailForGeoIdV4(attomId: string): Promise<any> {
  for (let attempts = 0; attempts < MAX_FALLBACK_ATTEMPTS; attempts++) {
    try {
      const result = await fetchAttom('/propertyapi/v1.0.0/property/detail', { attomid: attomId });
      
      if (result?.status === 'ok' && result?.property?.[0]?.location?.geoIdV4) {
        return result;
      }
      
      // Log appropriate warning based on response
      const warningMessage = result?.status === 'ok' 
        ? '[Fallback] Got successful response but no geoIdV4 found'
        : `[Fallback] Attempt ${attempts + 1} failed: Invalid response`;
      writeLog(warningMessage);
      
    } catch (error: unknown) {
      writeLog(`[Fallback] Attempt ${attempts + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Only sleep if we're going to retry
    if (attempts < MAX_FALLBACK_ATTEMPTS - 1) {
      await sleep(FALLBACK_DELAY_MS);
    }
  }
  
  writeLog(`[Fallback] Failed to get geoIdV4 after ${MAX_FALLBACK_ATTEMPTS} attempts`);
  return null;
}

export async function fallbackGeoIdV4FromAttomId(
  attomId: string,
  cacheKey: string
): Promise<Record<string, string>> {
  // Type assertion to help TypeScript understand our cache structure
  const cache = getRequestCache(cacheKey) as GeoIdCache;
  
  // Initialize geoIdV4 if it doesn't exist
  if (!cache.geoIdV4) {
    cache.geoIdV4 = {};
  }
  
  // If we already have the geoIdV4 map in cache with content, use it
  if (Object.keys(cache.geoIdV4).length > 0) {
    return cache.geoIdV4;
  }
  
  // Check data cache first
  const cacheDataKey = `geoIdV4:${attomId}`;
  const cachedGeoIdV4 = getCachedData(cacheDataKey);
  if (cachedGeoIdV4) {
    // Merge with existing cache
    Object.assign(cache.geoIdV4, cachedGeoIdV4);
    return cache.geoIdV4;
  }
  
  writeLog(`[Fallback] calling /property/detail => geoIdV4 for attomId: ${attomId}`);
  
  // Fetch property details with retry logic
  const result = await fetchPropertyDetailForGeoIdV4(attomId);
  
  if (result?.property?.[0]?.location?.geoIdV4) {
    const geoIdV4 = result.property[0].location.geoIdV4;
    
    // Cache the result by merging with existing cache
    if (typeof geoIdV4 === 'object' && geoIdV4 !== null) {
      Object.assign(cache.geoIdV4, geoIdV4);
      cacheData(cacheDataKey, cache.geoIdV4, '/propertyapi/v1.0.0/property/detail');
    }
  }
  
  return cache.geoIdV4; // Return the cache (empty or populated)
}

/**
 * Fallback to get school information by GeoID V4
 * @param geoIdV4 GeoID V4 value (must be SB type)
 * @returns School information or null if not found
 */
export async function fallbackSchoolByGeoIdV4(geoIdV4: string): Promise<any> {
  // Early return for invalid input
  if (!geoIdV4?.startsWith('SB')) {
    return null;
  }
  
  // Check data cache first
  const cacheDataKey = `school:geoIdV4:${geoIdV4}`;
  const cachedSchool = getCachedData(cacheDataKey);
  if (cachedSchool) {
    return cachedSchool;
  }
  
  return await fetchSchoolProfileData(geoIdV4);
}

/**
 * Helper function to fetch school profile data with retry logic
 * @param geoIdV4 GeoID V4 value
 * @returns School profile data or null
 */
async function fetchSchoolProfileData(geoIdV4: string): Promise<any> {
  writeLog(`[Fallback] calling /v4/school/profile for geoIdV4: ${geoIdV4}`);
  
  let attempts = 0;
  
  while (attempts < MAX_FALLBACK_ATTEMPTS) {
    try {
      const schoolData = await fetchAttom('/v4/school/profile', { geoIdV4 });
      if (schoolData?.status === 'ok') {
        // Cache the result
        cacheData(`school:geoIdV4:${geoIdV4}`, schoolData, '/v4/school/profile');
        return schoolData;
      }
    } catch (error: unknown) {
      attempts++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      writeLog(`[Fallback] Attempt ${attempts} failed: ${errorMessage}`);
      
      if (attempts >= MAX_FALLBACK_ATTEMPTS) {
        writeLog(`[Fallback] Failed to get school data after ${MAX_FALLBACK_ATTEMPTS} attempts: ${errorMessage}`);
        return null;
      }
      
      await sleep(FALLBACK_DELAY_MS);
    }
  }
  
  return null;
}

/**
 * Fallback to get community data by GeoID V4
 * @param geoIdV4 GeoID V4 value (must be N2 type)
 * @returns Community data or null if not found
 */
export async function fallbackCommunityByGeoIdV4(geoIdV4: string): Promise<any> {
  if (!geoIdV4?.startsWith('N2')) {
    writeLog(`[Fallback] Invalid GeoID V4 for community: ${geoIdV4}`);
    return null;
  }
  
  // Check data cache first
  const cacheDataKey = `community:${geoIdV4}`;
  const cachedData = getCachedData(cacheDataKey);
  if (cachedData) {
    return cachedData;
  }
  
  writeLog(`[Fallback] calling /neighborhood/community for geoIdV4: ${geoIdV4}`);
  
  let communityData = null;
  
  for (let attempts = 0; attempts < MAX_FALLBACK_ATTEMPTS; attempts++) {
    try {
      communityData = await fetchAttom('/v4/neighborhood/community', { geoIdV4 });
      
      if (communityData?.status?.code === 0) {
        break; // Successfully got the data
      }
      
      writeLog(`[Fallback] Attempt ${attempts + 1} failed: Invalid response status`);
      
    } catch (error: unknown) {
      writeLog(`[Fallback] Attempt ${attempts + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Only sleep if we're going to retry
    if (attempts < MAX_FALLBACK_ATTEMPTS - 1) {
      await sleep(FALLBACK_DELAY_MS);
    }
  }
  
  // Cache the result
  if (communityData) {
    cacheData(cacheDataKey, communityData, '/v4/neighborhood/community');
  }
  
  return communityData;
}

/**
 * Helper function to fetch building permits with retry logic
 * Extracted to reduce cognitive complexity
 * @param address1 Normalized street address
 * @param address2 Normalized city, state, ZIP
 * @returns Building permits response or null
 */
async function fetchBuildingPermitsWithRetry(
  address1: string,
  address2: string
): Promise<any> {
  let detail = null;
  let attempts = 0;
  
  while (attempts < MAX_FALLBACK_ATTEMPTS) {
    try {
      detail = await fetchAttom('/propertyapi/v1.0.0/property/buildingpermits', { 
        address1, 
        address2 
      });
      
      // Log the response for debugging
      writeLog(`[Fallback] Building permits response: ${JSON.stringify(detail, null, 2)}`);      
      if (detail?.status === 'ok' && detail?.property?.[0]?.identifier?.attomId) {
        return detail; // Successfully got the data with ATTOM ID
      }
      
      // If we got a response but it doesn't have the data we need
      if (detail?.status === 'ok') {
        writeLog('[Fallback] Got successful response but no attomId data');
      }
      
    } catch (error: unknown) {
      writeLog(`[Fallback] Attempt ${attempts + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    attempts++;
    if (attempts < MAX_FALLBACK_ATTEMPTS) {
      await sleep(FALLBACK_DELAY_MS);
    }
  }
  
  if (attempts >= MAX_FALLBACK_ATTEMPTS) {
    writeLog(`[Fallback] Failed to get building permits after ${MAX_FALLBACK_ATTEMPTS} attempts`);
  }
  
  return detail;
}

/**
 * Helper function to fetch basic profile with retry logic
 * @param address1 Normalized street address
 * @param address2 Normalized city, state, ZIP
 * @returns Basic profile response or null
 */
async function fetchBasicProfileWithRetry(
  address1: string,
  address2: string
): Promise<any> {
  let detail: any = null;
  for (let attempts = 0; attempts < MAX_FALLBACK_ATTEMPTS; attempts++) {
    try {
      detail = await fetchAttom('/propertyapi/v1.0.0/property/basicprofile', {
        address1,
        address2,
      });
      if (detail?.status === 'ok' || detail?.status?.code === 0) {
        return detail;
      }
    } catch (error: unknown) {
      writeLog(`[Fallback] Attempt ${attempts + 1} failed for basicprofile: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (attempts < MAX_FALLBACK_ATTEMPTS - 1) {
      await sleep(FALLBACK_DELAY_MS);
    }
  }
  return detail;
}

/**
 * Fallback to get GeoID V4 subtype from address with caching
 * @param address1 Street address
 * @param address2 City, state, ZIP
 * @param subtype GeoID subtype (e.g., 'CO', 'ZI', 'N2')
 * @param cacheKey Cache key for request cache
 * @param useGoogleNormalization Whether to use Google Places for address normalization
 * @returns GeoID V4 value or empty string if not found
 */
/**
 * Interface for the request cache structure
 * This helps TypeScript understand the shape of our cache object
 */
/**
 * Interface for the GeoID cache structure
 * Stores mapping of subtypes to GeoID values
 */
interface GeoIdCache {
  geoIdV4: Record<string, string>;
  [key: string]: any;
}

/**
 * Interface for the ATTOM ID cache structure
 * Stores the ATTOM ID for an address
 */
interface AttomIdCache {
  attomid: string;
  [key: string]: any;
}

export async function fallbackGeoIdV4SubtypeCached(
  address1: string,
  address2: string,
  subtype: string,
  cacheKey: string,
  useGoogleNormalization: boolean = true
): Promise<string> {
  // Type assertion to help TypeScript understand our cache structure
  const cache = getRequestCache(cacheKey) as GeoIdCache;
  
  // Initialize geoIdV4 if it doesn't exist
  if (!cache.geoIdV4) {
    cache.geoIdV4 = {};
  }
  
  // If we already have the geoIdV4 map in cache, use it
  if (cache.geoIdV4[subtype]) {
    return cache.geoIdV4[subtype];
  }
  
  // Check data cache first
  const cacheDataKey = `geoIdV4:${address1}:${address2}:${subtype}`;
  const cachedGeoId = getCachedData(cacheDataKey);
  if (cachedGeoId) {
    cache.geoIdV4[subtype] = cachedGeoId;
    return cachedGeoId;
  }
  
  writeLog(`[Fallback] calling /property/buildingpermits => geoIdV4 for subtype: ${subtype}`);
  
  // Try to normalize the address using Google Places if enabled
  const { normalizedAddress1, normalizedAddress2 } = await normalizeAddressIfEnabled(
    address1, 
    address2, 
    useGoogleNormalization
  );
  
  // Fetch building permits with retry logic
  const detail = await fetchBuildingPermitsWithRetry(
    normalizedAddress1,
    normalizedAddress2
  );
  
  // Process geoIdV4 data if available
  if (detail?.property?.[0]?.location?.geoIdV4) {
    const geoIdV4Data = detail.property[0].location.geoIdV4;
    
    // Convert the geoIdV4 data to the expected format
    if (typeof geoIdV4Data === 'object' && geoIdV4Data !== null) {
      Object.entries(geoIdV4Data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // We know cache.geoIdV4 is defined because we initialized it at the beginning of the function
          cache.geoIdV4[key] = value;
        }
      });
    }
  }
  
  // Cache individual geoId values for future use
  // We know cache.geoIdV4 is defined because we initialized it at the beginning of the function
  Object.entries(cache.geoIdV4).forEach(([key, value]) => {
    if (value) { // Only cache non-empty values
      cacheData(`geoIdV4:${address1}:${address2}:${key}`, value, '/propertyapi/v1.0.0/property/buildingpermits');
    }
  });
  
  return cache.geoIdV4[subtype] ?? '';

}

/**
 * Attempts to retrieve an ATTOM ID using address parameters via fallback endpoints.
 * Includes caching, normalization, and retry logic.
 * 
 * @param address1 The first line of the address
 * @param address2 The second line of the address (city, state, zip)
 * @param cacheKey Key for caching the result
 * @param useGoogleNormalization Whether to use Google Places for address normalization
 * @returns The found ATTOM ID string, or empty string if not found
 */
export async function fallbackAttomIdFromAddressCached(
  address1: string,
  address2: string,
  cacheKey: string,
  useGoogleNormalization: boolean = true
): Promise<string> {
  // Type assertion for cache structure - use dedicated AttomIdCache interface
  const cache = getRequestCache(cacheKey) as AttomIdCache;
  
  // Initialize attomid if it doesn't exist in cache
  if (!cache.attomid) {
    cache.attomid = '';
  }
  
  // If we already have the attomid in cache, use it
  if (cache.attomid) {
    writeLog(`[fallbackAttomIdFromAddressCached] Using cached ATTOM ID: ${cache.attomid}`);
    return cache.attomid;
  }
  
  // Check data cache first
  const cacheDataKey = `attomid:${address1}:${address2}:${useGoogleNormalization ? 'google' : 'default'}`;
  const cachedAttomId = getCachedData(cacheDataKey);
  if (cachedAttomId) {
    writeLog(`[fallbackAttomIdFromAddressCached] Using data-cached ATTOM ID: ${cachedAttomId}`);
    cache.attomid = cachedAttomId;
    return cachedAttomId;
  }
  
  writeLog(`[fallbackAttomIdFromAddressCached] Looking up ATTOM ID for address: ${address1}, ${address2}`);
  
  // Try to normalize the address using Google Places if enabled
  const normalizedAddressResult = await normalizeAddressIfEnabled(
    address1, 
    address2, 
    useGoogleNormalization
  );
  
  // If normalization failed, use original addresses
  const normalizedAddress1 = normalizedAddressResult.normalizedAddress1 || address1;
  const normalizedAddress2 = normalizedAddressResult.normalizedAddress2 || address2;
  
  writeLog(`[fallbackAttomIdFromAddressCached] Using normalized addresses: ${normalizedAddress1}, ${normalizedAddress2}`);
  
  // Attempt ATTOM ID extraction using helpers with retry logic
  const candidateResponses = [
    await fetchBuildingPermitsWithRetry(normalizedAddress1, normalizedAddress2),
    await fetchBasicProfileWithRetry(normalizedAddress1, normalizedAddress2),
  ];

  for (const response of candidateResponses) {
    const attomId = extractAttomIdFromResponse(response);
    if (attomId) {
      writeLog(`[fallbackAttomIdFromAddressCached] Found ATTOM ID via helper`);
      cache.attomid = attomId;
      cacheData(cacheDataKey, attomId, 'fallback-helpers');
      return attomId;
    }
  }
  
  // If we reach here, no ATTOM ID was found
  writeLog('[fallbackAttomIdFromAddressCached] Failed to find ATTOM ID after trying all endpoints');
  cacheData(cacheDataKey, '', 'fallback-failure'); // Cache failure
  return '';
}
