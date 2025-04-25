/**
 * Query Manager Service
 * 
 * This service manages API queries using the endpoint configuration.
 * It ensures proper endpoint routing, prevents duplicate calls,
 * and implements rate limiting and caching strategies.
 */

import { fetchAttom } from '../utils/fetcher.js';
import { 
  getEndpointConfig, 
  hasRequiredParams,
  FallbackStrategy,
  AllEventsDataField,
  endpoints,
  EndpointConfig
} from '../config/endpointConfig.js';
import { 
  fallbackGeoIdV4SubtypeCached,
  fallbackAttomIdFromAddressCached
} from '../utils/fallback.js';
import { getSalesDateRange, getSalesTrendYearRange, getCalendarDateRange } from '../utils/dateUtils.js'; // Added getCalendarDateRange
import { writeLog } from '../utils/logger.js';
// All caching methods are now imported through fallback utility functions
import { AttomApiError } from '../utils/errors.js'; // Corrected import path

// Load retry constants
const MAX_FALLBACK_ATTEMPTS = parseInt(process.env.MAX_FALLBACK_ATTEMPTS ?? '3');
const FALLBACK_DELAY_MS = parseInt(process.env.FALLBACK_DELAY_MS ?? '500');

// Queue for tracking in-flight requests
const requestQueue: Map<string, Promise<any>> = new Map();

/**
 * Extract data from AllEvents response based on required fields
 * @param allEventsData AllEvents response data
 * @param fields Required fields from AllEvents
 * @returns Extracted data or null if not available
 */
function extractDataFromAllEvents(
  allEventsData: Record<string, unknown>, 
  fields: AllEventsDataField[]
): Record<string, unknown> | null {
  // If no data or no property array, return null
  if (!allEventsData?.property || !Array.isArray(allEventsData.property) || allEventsData.property.length === 0) {
    return null;
  }

  const property = allEventsData.property[0];
  const result: any = { property: [] };
  
  // Copy status from original response
  if (allEventsData.status) {
    result.status = allEventsData.status;
  }
  
  // Create a new property object with only the requested fields
  const newProperty: any = {};
  
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
async function tryGetDataFromAllEvents(
  params: Record<string, any>,
  fields: AllEventsDataField[]
): Promise<Record<string, unknown> | null> {
  try {
    // First, get the attomId if not provided
    let attomId = params.attomid;
    
    if (!attomId && params.address1 && params.address2) {
      try {
        // Use our improved implementation to get the ATTOM ID
        writeLog(`[AllEvents Fallback] Getting ATTOM ID for: ${params.address1}, ${params.address2}`);
        // Use the new fallback function in fallback.ts instead
        attomId = await fallbackAttomIdFromAddressCached(
          params.address1,
          params.address2,
          `allEvents:${params.address1}:${params.address2}`,
          true // Use Google normalization
        );
        writeLog(`[AllEvents Fallback] ${attomId ? 'Successfully retrieved' : 'Failed to retrieve'} ATTOM ID: ${attomId ?? 'Not found'}`);
        if (!attomId) return null;
      } catch (error: any) {
        writeLog(`[AllEvents Fallback] Failed to retrieve ATTOM ID: ${error.message}`);
        return null;
      }
    }
    
    // If we couldn't get an attomId, we can't proceed
    if (!attomId) {
      // Removed verbose logging
      return null;
    }
    
    // Call the AllEvents endpoint
    // Removed verbose logging
    const allEventsData = await fetchAttom('/propertyapi/v1.0.0/allevents/detail', { id: attomId }) as Record<string, unknown>;
    
    // Extract the required fields
    return extractDataFromAllEvents(allEventsData, fields);
  } catch (error: unknown) {
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
async function tryAllEventsForEndpoint(
  endpointKey: string,
  params: Record<string, any>,
  allEventsFields: AllEventsDataField[]
): Promise<Record<string, unknown> | null> {
  const data = await tryGetDataFromAllEvents(params, allEventsFields);
  
  if (data) {
    // Removed verbose logging
    return data;
  }
  
  // Removed verbose logging
  return null;
}

/**
 * Apply address-to-geoid fallback strategy
 * @param endpointKey Endpoint key to determine preferred geocode subtype
 * @param params Request parameters
 * @returns Updated parameters with geoIdV4
 */
/**
 * Helper to select the appropriate geoIdV4 from a potentially comma-separated list
 * @param geoIdV4 The raw geoIdV4 string from the API
 * @param preferredSubtype The preferred subtype to select
 * @returns A single geoIdV4 value
 */
function processGeoIdV4(geoIdV4: string, preferredSubtype: string): string {
  if (!geoIdV4?.includes(',')) {
    return geoIdV4;
  }
  const geoIdList = geoIdV4.split(',').map((id: string) => id.trim());
  let selectedGeoId = geoIdList[0]; // Default to first one

  // Select the appropriate geoId based on the preferred subtype
  const subtypePatterns: Record<string, string[]> = {
    'SB': ['ccd2bc', '786e30', 'a1cc1b'],  // School-related geoIds
    'DB': ['ea629d'],                       // Database geoIds
    'ZI': ['9df4a0'],                       // ZIP code geoIds
    'N2': [],                               // Default neighborhood
    'N4': []                                // Detailed neighborhood
  };
  const patterns = subtypePatterns[preferredSubtype];

  if (patterns?.length) {
    // Find the first geoId that matches any of the patterns for this subtype
    const matchingGeoId = geoIdList.find((id: string) => 
      patterns.some(pattern => id.startsWith(pattern))
    );
    if (matchingGeoId) {
      selectedGeoId = matchingGeoId;
    }
  }
  return selectedGeoId;
}
async function handleAddressToGeoIdFallback(
  endpointKey: string, 
  params: Record<string, any>,
  config: EndpointConfig
): Promise<Record<string, any>> {
  const updatedParams = { ...params };
  const requiredGeoIdParam = config.requiredParams.find(p => p.toLowerCase().includes('geoid'));

  if (!requiredGeoIdParam) return updatedParams;

  if (!updatedParams[requiredGeoIdParam] && params.address1 && params.address2) {
    writeLog(`[QueryManager:handleAddressToGeoIdFallback] Applying ADDRESS_TO_GEOID fallback for ${endpointKey} (seeking ${requiredGeoIdParam}).`);
    const useNormalization = true;
    const cacheKey = `geoid:${params.address1}:${params.address2}`;
    const geoIdSubtype = config.preferredGeoIdSubtype ?? 'N2';
    const foundGeoId = await fallbackGeoIdV4SubtypeCached(
      params.address1,
      params.address2,
      geoIdSubtype,
      cacheKey,
      useNormalization
    );
    if (foundGeoId) {
      const processed = processGeoIdV4(foundGeoId, geoIdSubtype);
      updatedParams[requiredGeoIdParam] = processed;
      writeLog(`[QueryManager:handleAddressToGeoIdFallback] Fallback successful. Using GeoID: ${processed}`);
    } else {
      writeLog(`[applyFallbackStrategy] ADDRESS_TO_GEOID fallback failed to find GeoID. No ID found after all attempts.`);
      if (config.requiredParams.includes(requiredGeoIdParam)) {
        throw new Error(`Required parameter '${requiredGeoIdParam}' could not be derived from address for endpoint ${endpointKey}.`);
      }
    }
  }
  return updatedParams;
}

/**
 * Apply address-to-attomid fallback strategy
 * @param endpointKey Endpoint key
 * @param params Request parameters
 * @param config EndpointConfig
 * @returns Updated parameters with attomid
 */
async function handleAddressToAttomIdFallback(
  endpointKey: string,
  params: Record<string, any>,
  config: EndpointConfig
): Promise<Record<string, any>> {
  const updatedParams = { ...params };
  const attomIdVariants = ['attomid', 'attomId', 'id', 'propid', 'propId'];
  const requiredAttomIdParam = config.requiredParams.find(p =>
    attomIdVariants.includes(p.toLowerCase())
  ) ?? 'attomid'; // Default to 'attomid' if no match found

  if (!updatedParams[requiredAttomIdParam] && updatedParams.address1 && updatedParams.address2) {
    writeLog(`[applyFallbackStrategy] Applying ADDRESS_TO_ATTOMID fallback for ${endpointKey} (seeking ${requiredAttomIdParam}).`);
    const useNormalization = true; // Always use Google normalization for consistency
    const cacheKey = `request:${endpointKey}:${updatedParams.address1}:${updatedParams.address2}`;

    writeLog(`[applyFallbackStrategy] Using fallbackAttomIdFromAddressCached for: ${updatedParams.address1}, ${updatedParams.address2}`);

    const foundAttomId = await fallbackAttomIdFromAddressCached(
      updatedParams.address1,
      updatedParams.address2,
      cacheKey,
      useNormalization
    );

    if (foundAttomId) {
      updatedParams[requiredAttomIdParam] = foundAttomId;
      writeLog(`[applyFallbackStrategy] Fallback successful. Using ATTOM ID: ${foundAttomId}`);
    } else {
      writeLog(`[applyFallbackStrategy] ADDRESS_TO_ATTOMID fallback failed to find ATTOM ID. No ID found after all attempts.`);
      if (config.requiredParams.includes(requiredAttomIdParam)) {
        throw new Error(`Required parameter '${requiredAttomIdParam}' could not be derived from address for endpoint ${endpointKey}.`);
      }
    }
  }
  return updatedParams;
}

/**
 * Apply automatic date parameters based on endpoint
 * @param endpointKey Endpoint key
 * @param params Original parameters
 * @returns Updated parameters with date calculations
 */
function applyDateParameters(
  endpointKey: string,
  params: Record<string, any>
): Record<string, any> {
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
      }
      break;
    case 'transactionSalesTrend':
      // Add interval if not provided (default to yearly) using nullish coalescing operator
      updatedParams.interval ??= 'yearly';
      // If either year is missing, calculate both to ensure consistency
      if (!updatedParams.startyear || !updatedParams.endyear) {
        const { startYear, endYear } = getSalesTrendYearRange();
        updatedParams.startyear = startYear;
        updatedParams.endyear = endYear;
      }
      break;
    case 'assessmentSnapshot':
      // If either calendar date is missing, calculate both
      if (!updatedParams.startcalendardate || !updatedParams.endcalendardate) {
        const { startCalendarDate, endCalendarDate } = getCalendarDateRange();
        updatedParams.startcalendardate = updatedParams.startcalendardate ?? startCalendarDate;
        updatedParams.endcalendardate = updatedParams.endcalendardate ?? endCalendarDate;
        writeLog(`[QueryManager:applyDateParameters] Applying default calendar date range for assessmentSnapshot: ${updatedParams.startcalendardate} - ${updatedParams.endcalendardate}`);
      }
      break;
  }

  return updatedParams;
}

/**
 * Handle the ATTOMID_TO_ID fallback strategy (placeholder)
 */
async function handleAttomIdToIdFallback(
  endpointKey: string,
  params: Record<string, any>,
  config: EndpointConfig
): Promise<Record<string, any>> {
  writeLog(`[applyFallbackStrategy] ATTOMID_TO_ID strategy not fully implemented for ${endpointKey}.`);
  return params;
}

/**
 * Applies the appropriate fallback strategy based on endpoint configuration.
 * Returns updated parameters and potentially pre-fetched data (for AllEvents).
 */
export async function applyFallbackStrategy( // Added export
  endpointKey: string,
  params: Record<string, any>
): Promise<{ updatedParams: Record<string, any>; dataFromAllEvents: Record<string, unknown> | null }> {
  const config = getEndpointConfig(endpointKey);
  let updatedParams = { ...params }; // Clone params to avoid modifying the original object directly

  const effectiveStrategy = config.fallbackStrategy ?? FallbackStrategy.NONE; // Handle undefined strategy

  writeLog(`[applyFallbackStrategy] Applying fallback strategy: ${effectiveStrategy} for ${endpointKey}`);

  switch (effectiveStrategy) {
    case FallbackStrategy.ADDRESS_TO_ATTOMID: {
      updatedParams = await handleAddressToAttomIdFallback(endpointKey, updatedParams, config);
      break;
    }
    
    case FallbackStrategy.ADDRESS_TO_GEOID: {
      updatedParams = await handleAddressToGeoIdFallback(endpointKey, updatedParams, config);
      break;
    }

    case FallbackStrategy.ATTOMID_TO_ID: {
      updatedParams = await handleAttomIdToIdFallback(endpointKey, updatedParams, config);
      break;
    }

    case FallbackStrategy.NONE:
    default: {
      // Should have been caught earlier, but log just in case
      writeLog(`[applyFallbackStrategy] No fallback strategy applied for ${endpointKey}.`);
      break;
    }
  }

  // Default return structure if not TRY_ALLEVENTS_FIRST
  return { updatedParams, dataFromAllEvents: null };
}

// Helper to generate cache key (moved from executeQuery)
function getCacheKey(endpointKey: string, params: Record<string, any>): string {
  // Simple key generation, consider more robust hashing for complex params
  const paramString = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `${endpointKey}:${paramString}`;
}

/**
 * Execute a query to the ATTOM API
 * @param endpointKey Endpoint key from configuration
 * @param params Query parameters (can include address, geoIdV4, attomId, etc.)
 * @returns API response with status and data specific to the endpoint
 */
export async function executeAttomQuery(
  endpointKey: string, 
  params: Record<string, any>
): Promise<any> {
  const config = getEndpointConfig(endpointKey);
  if (!config) {
    throw new AttomApiError(`Configuration not found for endpoint: ${endpointKey}`, 400);
  }

  // Normalize parameters first
  const normalizedParams = normalizeParams(params);

  // Apply automatic date parameters
  const paramsWithDates = applyDateParameters(endpointKey, normalizedParams);

  const enhancedParams = { ...paramsWithDates }; // Start with normalized & date params

  // Generate cache key for deduplication using normalized & dated params
  const cacheKey = getCacheKey(endpointKey, enhancedParams);

  // Check if request is already in flight
  const existingRequest = requestQueue.get(cacheKey);
  if (existingRequest) {
    // Removed verbose logging
    return existingRequest;
  }

  // Create request promise
  const requestPromise = (async () => {
    try {
      let updatedParams = { ...enhancedParams }; // Start with normalized & dated params
      let dataFromAllEvents: Record<string, unknown> | null = null;

      // 1. Handle TRY_ALLEVENTS_FIRST strategy explicitly
      if (config.fallbackStrategy === FallbackStrategy.TRY_ALLEVENTS_FIRST && config.allEventsFields) {
        writeLog(`[executeAttomQuery] Trying AllEvents first for ${endpointKey}`);
        dataFromAllEvents = await tryGetDataFromAllEvents(updatedParams, config.allEventsFields);
        if (dataFromAllEvents) {
          writeLog(`[executeAttomQuery] Data found via AllEvents for ${endpointKey}. Returning early.`);
          return dataFromAllEvents; // Return early if data found
        } else {
          writeLog(`[executeAttomQuery] Data not found via AllEvents for ${endpointKey}. Proceeding with other fallbacks/direct call.`);
        }
      }

      // 2. Apply other fallback strategies if needed (excluding TRY_ALLEVENTS_FIRST)
      if (config.fallbackStrategy && config.fallbackStrategy !== FallbackStrategy.TRY_ALLEVENTS_FIRST) {
         // Note: applyFallbackStrategy now only handles non-AllEvents fallbacks
        const fallbackResult = await applyFallbackStrategy(endpointKey, updatedParams);
        updatedParams = fallbackResult.updatedParams;
        // dataFromAllEvents from applyFallbackStrategy should always be null now
      }
      
      // 3. Filter params before final API call
      const finalParams: Record<string, any> = {};
      const allowedParams = [...config.requiredParams, ...(config.optionalParams || [])];
      for (const key of allowedParams) {
        // Check against the potentially updated params from fallbacks
        if (updatedParams[key] !== undefined) {
          finalParams[key] = updatedParams[key];
        }
      }

      // 4. Check required params *after* fallbacks
      if (!hasRequiredParams(endpointKey, finalParams)) {
         throw new AttomApiError(`Missing required parameters for endpoint ${endpointKey} after applying fallbacks. Required: ${config.requiredParams.join(', ')}. Provided: ${Object.keys(finalParams).join(', ')}`, 400);
      }

      // 5. Execute the final API request
      writeLog(`[executeAttomQuery] Executing final API call for ${endpointKey} with params: ${JSON.stringify(finalParams)}`);
      const response = await fetchAttom(config.path, finalParams);

      return response;
    } finally {
      // Remove from queue when done
      requestQueue.delete(cacheKey);
    }
  })();

  // Add to queue
  requestQueue.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Helper function to normalize parameter types
 */
function normalizeParams(params: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    // Convert boolean strings to actual booleans
    if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
      result[key] = value.toLowerCase() === 'true';
    }
    // Maintain numeric values as numbers
    else if (typeof value === 'number') {
      result[key] = value;
    }
    // Convert numeric strings to numbers if appropriate
    else if (typeof value === 'string' && !isNaN(Number(value)) && !value.includes(' ')) {
      result[key] = Number(value);
    }
    // Otherwise keep as is
    else {
      result[key] = value;
    }
  }
  
  return result;
}
