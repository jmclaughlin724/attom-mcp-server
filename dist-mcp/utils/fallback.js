// src/utils/fallback.ts
import { fetchAttom } from './fetcher.js';
import { getRequestCache, cacheData, getCachedData } from './caching.js';
import { normalizeAddressStringForAttom } from './googlePlaces.js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Fallback configuration
const MAX_FALLBACK_ATTEMPTS = parseInt(process.env.MAX_FALLBACK_ATTEMPTS ?? '3');
const FALLBACK_DELAY_MS = parseInt(process.env.FALLBACK_DELAY_MS ?? '500');
/**
 * Sleep utility for fallback delay
 * @param ms Milliseconds to sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
/**
 * Normalize address using Google Places API
 * @param address1 Street address
 * @param address2 City, state, ZIP
 * @returns Normalized address or null if not found
 */
export async function normalizeAddress(address1, address2) {
    // Try to normalize the full address
    const fullAddress = `${address1}, ${address2}`;
    return normalizeAddressStringForAttom(fullAddress);
}
/**
 * Helper function to normalize address if enabled
 * Extracted to reduce cognitive complexity
 * @param address1 Street address
 * @param address2 City, state, ZIP
 * @param useGoogleNormalization Whether to use Google Places for normalization
 * @returns Object with normalized addresses
 */
async function normalizeAddressIfEnabled(address1, address2, useGoogleNormalization) {
    let normalizedAddress1 = address1;
    let normalizedAddress2 = address2;
    if (useGoogleNormalization) {
        try {
            const normalized = await normalizeAddress(address1, address2);
            if (normalized) {
                normalizedAddress1 = normalized.address1;
                normalizedAddress2 = normalized.address2;
                console.log(`[Google Places] Normalized address: ${normalized.formattedAddress}`);
                console.log(`[Google Places] address1: ${normalizedAddress1}, address2: ${normalizedAddress2}`);
            }
        }
        catch (error) {
            console.error('[Google Places] Address normalization failed, using original address', error instanceof Error ? error.message : String(error));
        }
    }
    return { normalizedAddress1, normalizedAddress2 };
}
/**
 * Fallback to get ATTOM ID from address with caching
 * @param address1 Street address
 * @param address2 City, state, ZIP
 * @param cacheKey Cache key for request cache
 * @param useGoogleNormalization Whether to use Google Places for address normalization
 * @returns ATTOM ID or empty string if not found
 */
export async function fallbackAttomIdFromAddressCached(address1, address2, cacheKey, useGoogleNormalization = true) {
    // Type assertion to help TypeScript understand our cache structure
    const cache = getRequestCache(cacheKey);
    // If we already have the attomId in cache, use it
    if (cache.attomid) {
        return cache.attomid;
    }
    // Check data cache first
    const cacheDataKey = `attomId:${address1}:${address2}`;
    const cachedAttomId = getCachedData(cacheDataKey);
    if (cachedAttomId) {
        cache.attomid = cachedAttomId;
        return cachedAttomId;
    }
    console.warn(`[Fallback] calling /property/detail => attomId for: ${address1}, ${address2}`);
    // Try to normalize the address using Google Places if enabled
    const { normalizedAddress1, normalizedAddress2 } = await normalizeAddressIfEnabled(address1, address2, useGoogleNormalization);
    // Attempt to fetch property details with retry logic
    for (let attempts = 0; attempts < MAX_FALLBACK_ATTEMPTS; attempts++) {
        try {
            const result = await fetchAttom('/propertyapi/v1.0.0/property/detail', {
                address1: normalizedAddress1,
                address2: normalizedAddress2
            });
            if (result?.status === 'ok' && result?.property?.[0]?.identifier?.attomId) {
                const attomId = result.property[0].identifier.attomId;
                // Cache the result
                cache.attomid = attomId;
                cacheData(cacheDataKey, attomId, '/propertyapi/v1.0.0/property/detail');
                return attomId;
            }
            // Log appropriate warning based on response
            const warningMessage = result?.status === 'ok'
                ? '[Fallback] Got successful response but no attomId found'
                : `[Fallback] Attempt ${attempts + 1} failed: Invalid response`;
            console.warn(warningMessage);
        }
        catch (error) {
            console.error(`[Fallback] Attempt ${attempts + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        // Only sleep if we're going to retry
        if (attempts < MAX_FALLBACK_ATTEMPTS - 1) {
            await sleep(FALLBACK_DELAY_MS);
        }
    }
    console.error(`[Fallback] Failed to get attomId after ${MAX_FALLBACK_ATTEMPTS} attempts`);
    return '';
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
async function fetchPropertyDetailForGeoIdV4(attomId) {
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
            console.warn(warningMessage);
        }
        catch (error) {
            console.error(`[Fallback] Attempt ${attempts + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        // Only sleep if we're going to retry
        if (attempts < MAX_FALLBACK_ATTEMPTS - 1) {
            await sleep(FALLBACK_DELAY_MS);
        }
    }
    console.error(`[Fallback] Failed to get geoIdV4 after ${MAX_FALLBACK_ATTEMPTS} attempts`);
    return null;
}
export async function fallbackGeoIdV4FromAttomId(attomId, cacheKey) {
    // Type assertion to help TypeScript understand our cache structure
    const cache = getRequestCache(cacheKey);
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
    console.warn(`[Fallback] calling /property/detail => geoIdV4 for attomId: ${attomId}`);
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
export async function fallbackSchoolByGeoIdV4(geoIdV4) {
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
async function fetchSchoolProfileData(geoIdV4) {
    console.warn(`[Fallback] calling /v4/school/profile for geoIdV4: ${geoIdV4}`);
    let attempts = 0;
    while (attempts < MAX_FALLBACK_ATTEMPTS) {
        try {
            const schoolData = await fetchAttom('/v4/school/profile', { geoIdV4 });
            if (schoolData?.status === 'ok') {
                // Cache the result
                cacheData(`school:geoIdV4:${geoIdV4}`, schoolData, '/v4/school/profile');
                return schoolData;
            }
        }
        catch (error) {
            attempts++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[Fallback] Attempt ${attempts} failed: ${errorMessage}`);
            if (attempts >= MAX_FALLBACK_ATTEMPTS) {
                console.error(`[Fallback] Failed to get school data after ${MAX_FALLBACK_ATTEMPTS} attempts: ${errorMessage}`);
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
export async function fallbackCommunityByGeoIdV4(geoIdV4) {
    if (!geoIdV4?.startsWith('N2')) {
        console.error(`[Fallback] Invalid GeoID V4 for community: ${geoIdV4}`);
        return null;
    }
    // Check data cache first
    const cacheDataKey = `community:${geoIdV4}`;
    const cachedData = getCachedData(cacheDataKey);
    if (cachedData) {
        return cachedData;
    }
    console.warn(`[Fallback] calling /neighborhood/community for geoIdV4: ${geoIdV4}`);
    let communityData = null;
    for (let attempts = 0; attempts < MAX_FALLBACK_ATTEMPTS; attempts++) {
        try {
            communityData = await fetchAttom('/v4/neighborhood/community', { geoIdV4 });
            if (communityData?.status?.code === 0) {
                break; // Successfully got the data
            }
            console.warn(`[Fallback] Attempt ${attempts + 1} failed: Invalid response status`);
        }
        catch (error) {
            console.error(`[Fallback] Attempt ${attempts + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
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
 * Helper function to fetch property detail with retry logic
 * Extracted to reduce cognitive complexity
 * @param address1 Normalized street address
 * @param address2 Normalized city, state, ZIP
 * @returns Property detail response or null
 */
async function fetchPropertyDetailWithRetry(address1, address2) {
    let detail = null;
    let attempts = 0;
    while (attempts < MAX_FALLBACK_ATTEMPTS) {
        try {
            detail = await fetchAttom('/propertyapi/v1.0.0/property/detail', {
                address1,
                address2
            });
            if (detail?.status === 'ok' && detail?.property?.[0]?.location?.geoIdV4) {
                return detail; // Successfully got the data
            }
            // If we got a response but it doesn't have the data we need
            if (detail?.status === 'ok') {
                console.warn('[Fallback] Got successful response but no geoIdV4 data');
            }
        }
        catch (error) {
            console.error(`[Fallback] Attempt ${attempts + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        attempts++;
        if (attempts < MAX_FALLBACK_ATTEMPTS) {
            await sleep(FALLBACK_DELAY_MS);
        }
    }
    if (attempts >= MAX_FALLBACK_ATTEMPTS) {
        console.error(`[Fallback] Failed to get property detail after ${MAX_FALLBACK_ATTEMPTS} attempts`);
    }
    return detail;
}
export async function fallbackGeoIdV4SubtypeCached(address1, address2, subtype, cacheKey, useGoogleNormalization = true) {
    // Type assertion to help TypeScript understand our cache structure
    const cache = getRequestCache(cacheKey);
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
    console.warn(`[Fallback] calling /property/detail => geoIdV4 for subtype: ${subtype}`);
    // Try to normalize the address using Google Places if enabled
    const { normalizedAddress1, normalizedAddress2 } = await normalizeAddressIfEnabled(address1, address2, useGoogleNormalization);
    // Fetch property details with retry logic
    const detail = await fetchPropertyDetailWithRetry(normalizedAddress1, normalizedAddress2);
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
            cacheData(`geoIdV4:${address1}:${address2}:${key}`, value, '/propertyapi/v1.0.0/property/detail');
        }
    });
    return cache.geoIdV4[subtype] ?? '';
}
//# sourceMappingURL=fallback.js.map