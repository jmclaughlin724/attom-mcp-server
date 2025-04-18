/**
 * Query Manager Service
 *
 * This service manages API queries using the endpoint configuration.
 * It ensures proper endpoint routing, prevents duplicate calls,
 * and implements rate limiting and caching strategies.
 */
import { fetchAttom } from '../utils/fetcher.js';
import { getEndpointConfig, hasRequiredParams, getFallbackStrategy, FallbackStrategy, endpoints } from '../config/endpointConfig.js';
import { fallbackAttomIdFromAddressCached, fallbackGeoIdV4SubtypeCached } from '../utils/fallback.js';
import { getSalesDateRange, getSalesTrendYearRange } from '../utils/dateUtils.js';
// Queue for tracking in-flight requests
const requestQueue = new Map();
/**
 * Generate a cache key for a request
 * @param endpointKey Endpoint key
 * @param params Request parameters
 * @returns Cache key
 */
function generateCacheKey(endpointKey, params) {
    const sortedParams = Object.entries(params)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    return `${endpointKey}:${sortedParams}`;
}
/**
 * Extract data from AllEvents response based on required fields
 * @param allEventsData AllEvents response data
 * @param fields Required fields from AllEvents
 * @returns Extracted data or null if not available
 */
function extractDataFromAllEvents(allEventsData, fields) {
    // If no data or no property array, return null
    if (!allEventsData?.property || !Array.isArray(allEventsData.property) || allEventsData.property.length === 0) {
        return null;
    }
    const property = allEventsData.property[0];
    const result = { property: [] };
    // Copy status from original response
    if (allEventsData.status) {
        result.status = allEventsData.status;
    }
    // Create a new property object with only the requested fields
    const newProperty = {};
    // Always include identifier
    if (property.identifier) {
        newProperty.identifier = property.identifier;
    }
    // Include requested fields
    fields.forEach(field => {
        if (property[field]) {
            newProperty[field] = property[field];
        }
    });
    // Add the property to the result
    result.property.push(newProperty);
    return result;
}
/**
 * Try to get data from AllEvents endpoint first
 * @param params Request parameters
 * @param fields Required fields from AllEvents
 * @returns AllEvents data or null if not available
 */
async function tryGetDataFromAllEvents(params, fields) {
    try {
        // First, get the attomId if not provided
        let attomId = params.attomid;
        if (!attomId && params.address1 && params.address2) {
            const cacheKey = `${params.address1}|${params.address2}`;
            attomId = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
        }
        // If we couldn't get an attomId, we can't proceed
        if (!attomId) {
            // Removed verbose logging
            return null;
        }
        // Call the AllEvents endpoint
        // Removed verbose logging
        const allEventsData = await fetchAttom('/propertyapi/v1.0.0/allevents/detail', { id: attomId });
        // Extract the required fields
        return extractDataFromAllEvents(allEventsData, fields);
    }
    catch (error) {
        console.error('[AllEvents Fallback] Error:', error instanceof Error ? error.message : String(error));
        return null;
    }
}
/**
 * Try to get data from AllEvents for a specific endpoint
 * @param endpointKey Endpoint key
 * @param params Request parameters
 * @param allEventsFields Required fields from AllEvents
 * @returns AllEvents data or null if not available
 */
async function tryAllEventsForEndpoint(endpointKey, params, allEventsFields) {
    const data = await tryGetDataFromAllEvents(params, allEventsFields);
    if (data) {
        // Removed verbose logging
        return data;
    }
    // Removed verbose logging
    return null;
}
/**
 * Apply address-to-attomid fallback strategy
 * @param params Request parameters
 * @returns Updated parameters with attomid
 */
async function applyAddressToAttomIdFallback(params) {
    const updatedParams = { ...params };
    if (!updatedParams.attomid && updatedParams.address1 && updatedParams.address2) {
        const cacheKey = `${updatedParams.address1}|${updatedParams.address2}`;
        updatedParams.attomid = await fallbackAttomIdFromAddressCached(updatedParams.address1, updatedParams.address2, cacheKey);
    }
    return updatedParams;
}
/**
 * Apply address-to-geoid fallback strategy
 * @param endpointKey Endpoint key to determine preferred geocode subtype
 * @param params Request parameters
 * @returns Updated parameters with geoIdV4
 */
export async function applyAddressToGeoIdFallback(endpointKey, params) {
    const updatedParams = { ...params };
    // Skip processing if geoIdV4 is already present or no address is provided
    if (updatedParams.geoIdV4 ||
        !(updatedParams.address || (updatedParams.address1 && updatedParams.address2))) {
        return updatedParams;
    }
    const config = getEndpointConfig(endpointKey);
    const preferredSubtype = config.preferredGeoIdSubtype ?? 'N2';
    const address1 = updatedParams.address1 ?? updatedParams.address;
    const address2 = updatedParams.address2 ?? '';
    const cacheKey = `${address1}|${address2}`;
    // Removed verbose logging
    let geoIdV4 = await fallbackGeoIdV4SubtypeCached(address1, address2, preferredSubtype, cacheKey, true // Enable Google normalization
    );
    // Process comma-separated geoIdV4 values
    updatedParams.geoIdV4 = processGeoIdV4(geoIdV4, preferredSubtype);
    return updatedParams;
}
/**
 * Process and select the appropriate geoIdV4 from a potentially comma-separated list
 * @param geoIdV4 The raw geoIdV4 string from the API
 * @param preferredSubtype The preferred subtype to select
 * @returns A single geoIdV4 value
 */
function processGeoIdV4(geoIdV4, preferredSubtype) {
    if (!geoIdV4?.includes(',')) {
        return geoIdV4;
    }
    const geoIdList = geoIdV4.split(',').map(id => id.trim());
    let selectedGeoId = geoIdList[0]; // Default to first one
    // Select the appropriate geoId based on the preferred subtype
    const subtypePatterns = getSubtypePatterns();
    const patterns = subtypePatterns[preferredSubtype];
    if (patterns?.length) {
        // Find the first geoId that matches any of the patterns for this subtype
        const matchingGeoId = geoIdList.find(id => patterns.some(pattern => id.startsWith(pattern)));
        if (matchingGeoId) {
            selectedGeoId = matchingGeoId;
            // Removed verbose logging
        }
    }
    return selectedGeoId;
}
/**
 * Get pattern prefixes for different geoIdV4 subtypes
 * @returns A map of subtype to pattern prefixes
 */
function getSubtypePatterns() {
    return {
        'SB': ['ccd2bc', '786e30', 'a1cc1b'], // School-related geoIds
        'DB': ['ea629d'], // Database geoIds
        'ZI': ['9df4a0'], // ZIP code geoIds
        'N2': [], // Default neighborhood
        'N4': [] // Detailed neighborhood
    };
}
/**
 * Apply attomid-to-id fallback strategy
 * @param params Request parameters
 * @returns Updated parameters with id
 */
function applyAttomIdToIdFallback(params) {
    const updatedParams = { ...params };
    if (!updatedParams.id && updatedParams.attomid) {
        updatedParams.id = updatedParams.attomid;
    }
    return updatedParams;
}
/**
 * Apply fallback strategy to get missing parameters
 * @param endpointKey Endpoint key
 * @param params Request parameters
 * @returns Updated parameters with fallback values
 */
async function applyFallbackStrategy(endpointKey, params) {
    const config = getEndpointConfig(endpointKey);
    let updatedParams = { ...params };
    let dataFromAllEvents = null;
    // Skip if no fallback strategy
    if (!config.fallbackStrategy) {
        return { updatedParams, dataFromAllEvents };
    }
    // Try AllEvents first if configured
    if (config.fallbackStrategy === FallbackStrategy.TRY_ALLEVENTS_FIRST &&
        Array.isArray(config.allEventsFields) &&
        config.allEventsFields.length > 0) {
        dataFromAllEvents = await tryAllEventsForEndpoint(endpointKey, params, config.allEventsFields);
        // If we got data from AllEvents, we can return it
        if (dataFromAllEvents) {
            return { updatedParams, dataFromAllEvents };
        }
    }
    // Apply appropriate fallback strategy based on configuration
    switch (config.fallbackStrategy) {
        case FallbackStrategy.ADDRESS_TO_ATTOMID:
        case FallbackStrategy.TRY_ALLEVENTS_FIRST:
            updatedParams = await applyAddressToAttomIdFallback(updatedParams);
            break;
        case FallbackStrategy.ADDRESS_TO_GEOID:
            updatedParams = await applyAddressToGeoIdFallback(endpointKey, updatedParams);
            break;
        case FallbackStrategy.ATTOMID_TO_ID:
            updatedParams = applyAttomIdToIdFallback(updatedParams);
            break;
    }
    return { updatedParams, dataFromAllEvents };
}
/**
 * Apply automatic date parameters based on endpoint
 * @param endpointKey Endpoint key
 * @param params Original parameters
 * @returns Updated parameters with date calculations
 */
function applyDateParameters(endpointKey, params) {
    // Clone the original params
    const updatedParams = { ...params };
    // Apply date calculations based on endpoint
    switch (endpointKey) {
        case 'saleSnapshot':
            // If either date is missing, calculate both to ensure consistency
            if (!updatedParams.startsalesearchdate || !updatedParams.endsalesearchdate) {
                const { startDate, endDate } = getSalesDateRange();
                updatedParams.startsalesearchdate = startDate;
                updatedParams.endsalesearchdate = endDate;
                // Removed verbose logging
            }
            break;
        case 'transactionSalesTrend':
            // Add interval if not provided (default to yearly) using nullish coalescing operator
            updatedParams.interval ?? (updatedParams.interval = 'yearly');
            // If either year is missing, calculate both to ensure consistency
            if (!updatedParams.startyear || !updatedParams.endyear) {
                const { startYear, endYear } = getSalesTrendYearRange();
                updatedParams.startyear = startYear;
                updatedParams.endyear = endYear;
                // Removed verbose logging
            }
            break;
    }
    return updatedParams;
}
/**
 * Execute a query to the ATTOM API
 * @param endpointKey Endpoint key from configuration
 * @param params Query parameters (can include address, geoIdV4, attomId, etc.)
 * @returns API response with status and data specific to the endpoint
 */
export async function executeQuery(endpointKey, params) {
    // Get endpoint configuration
    const config = getEndpointConfig(endpointKey);
    // Apply automatic date parameters
    const paramsWithDates = applyDateParameters(endpointKey, params);
    // Check if we have address parameters but no geoIdV4
    // This allows address-to-geoIdV4 conversion even when not specified in the fallback strategy
    let enhancedParams = { ...paramsWithDates };
    if (!enhancedParams.geoIdV4 &&
        (enhancedParams.address || (enhancedParams.address1 && enhancedParams.address2))) {
        // Try to apply address-to-geoIdV4 conversion regardless of fallback strategy
        try {
            enhancedParams = await applyAddressToGeoIdFallback(endpointKey, enhancedParams);
            // Removed verbose logging
        }
        catch (error) {
            console.warn(`[AddressFallback] Failed to convert address to geoIdV4: ${error}`);
        }
    }
    // Generate cache key for deduplication
    const cacheKey = generateCacheKey(endpointKey, enhancedParams);
    // Check if request is already in flight
    const existingRequest = requestQueue.get(cacheKey);
    if (existingRequest) {
        // Removed verbose logging
        return existingRequest;
    }
    // Create request promise
    const requestPromise = (async () => {
        try {
            // Apply fallback strategy to get missing parameters
            const { updatedParams, dataFromAllEvents } = await applyFallbackStrategy(endpointKey, enhancedParams);
            // If we got data from AllEvents, return it directly
            if (dataFromAllEvents) {
                return dataFromAllEvents;
            }
            // Execute the API request
            // Removed verbose logging
            const response = await fetchAttom(config.path, updatedParams);
            return response;
        }
        finally {
            // Remove from queue when done
            requestQueue.delete(cacheKey);
        }
    })();
    // Add to queue
    requestQueue.set(cacheKey, requestPromise);
    return requestPromise;
}
/**
 * Check if a query is valid based on required parameters
 * @param endpointKey Endpoint key
 * @param params Query parameters
 * @returns True if query is valid
 */
export function isValidQuery(endpointKey, params) {
    try {
        // We only need fallbackStrategy, not the full config here
        const fallbackStrategy = getFallbackStrategy(endpointKey);
        // Check if all required parameters are present
        const hasRequired = hasRequiredParams(endpointKey, params);
        // If we have required params, query is valid
        if (hasRequired) {
            return true;
        }
        // Check if we can use fallback strategies
        if (!fallbackStrategy) {
            return false;
        }
        // Check based on fallback strategy type
        switch (fallbackStrategy) {
            case FallbackStrategy.TRY_ALLEVENTS_FIRST:
            case FallbackStrategy.ADDRESS_TO_ATTOMID:
                return !!(params.address1 && params.address2);
            case FallbackStrategy.ADDRESS_TO_GEOID:
                return !!(params.address || (params.address1 && params.address2));
            case FallbackStrategy.ATTOMID_TO_ID:
                return !!params.attomid;
            default:
                return false;
        }
    }
    catch (error) {
        console.error('Error validating query:', error instanceof Error ? error.message : String(error));
        return false;
    }
}
/**
 * Get all available query types
 * @returns Array of endpoint keys
 */
export function getAvailableQueryTypes() {
    return Object.keys(endpoints);
}
//# sourceMappingURL=queryManager.js.map