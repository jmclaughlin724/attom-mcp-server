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
import { getSalesDateRange, getSalesTrendYearRange } from '../utils/dateUtils.js';
import { writeLog } from '../utils/logger.js';
// All caching methods are now imported through fallback utility functions
import { AttomApiError } from '../utils/errors.js'; // Corrected import path

// Load retry constants
const MAX_FALLBACK_ATTEMPTS = parseInt(process.env.MAX_FALLBACK_ATTEMPTS ?? '3');
const FALLBACK_DELAY_MS = parseInt(process.env.FALLBACK_DELAY_MS ?? '500');

// Queue for tracking in-flight requests
const requestQueue: Map<string, Promise<any>> = new Map();

/**
 * Generate a cache key for a request
 * @param endpointKey Endpoint key
 * @param params Request parameters
 * @returns Cache key
 */
function generateCacheKey(endpointKey: string, params: Record<string, any>): string {
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
 * DEPRECATED: This function has been replaced by the fallbackAttomIdFromAddressCached utility
 * in src/utils/fallback.ts, which is now called directly from applyFallbackStrategy.
 * 
 * This change aligns the ATTOM ID retrieval pattern with the successful GeoID pattern,
 * centralizing address normalization, caching, and retry logic in a single utility function.
 * 
 * @see fallbackAttomIdFromAddressCached in src/utils/fallback.ts
 * @see applyFallbackStrategy ADDRESS_TO_ATTOMID case in this file
 */
async function applyAddressToAttomIdFallback(params: Record<string, any>, config: EndpointConfig): Promise<string | null> {
  writeLog('[QueryManager] [WARN] Using deprecated applyAddressToAttomIdFallback function. Use fallbackAttomIdFromAddressCached instead.');
  // Forward to the new implementation to maintain compatibility if called directly
  // Always use Google normalization for ATTOM ID lookup (matching GeoID pattern)
  const useNormalization = true; // Hardcoded to true instead of using config.useGoogleNormalization
  const cacheKey = `attomid:${params.address1}:${params.address2}:${useNormalization ? 'google' : 'default'}`;
  return await fallbackAttomIdFromAddressCached(
    params.address1,
    params.address2,
    cacheKey,
    useNormalization
  ) || null;
}

/**
 * Apply address-to-geoid fallback strategy
 * @param endpointKey Endpoint key to determine preferred geocode subtype
 * @param params Request parameters
 * @returns Updated parameters with geoIdV4
 */
export async function applyAddressToGeoIdFallback(
  endpointKey: string,
  params: Record<string, any>
): Promise<Record<string, any>> {
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
  
  let geoIdV4 = await fallbackGeoIdV4SubtypeCached(
    address1,
    address2,
    preferredSubtype,
    cacheKey,
    true // Enable Google normalization
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
function processGeoIdV4(geoIdV4: string, preferredSubtype: string): string {
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
    const matchingGeoId = geoIdList.find(id => 
      patterns.some(pattern => id.startsWith(pattern))
    );
    
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
function getSubtypePatterns(): Record<string, string[]> {
  return {
    'SB': ['ccd2bc', '786e30', 'a1cc1b'],  // School-related geoIds
    'DB': ['ea629d'],                       // Database geoIds
    'ZI': ['9df4a0'],                       // ZIP code geoIds
    'N2': [],                               // Default neighborhood
    'N4': []                                // Detailed neighborhood
  };
}

/**
 * Apply attomid-to-id fallback strategy
 * @param params Request parameters
 * @returns Updated parameters with id
 */
function applyAttomIdToIdFallback(
  params: Record<string, any>
): Record<string, any> {
  const updatedParams = { ...params };
  
  if (!updatedParams.id && updatedParams.attomid) {
    updatedParams.id = updatedParams.attomid;
  }
  
  return updatedParams;
}

// Implement apply fallback strategy in a single place

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
        // Removed verbose logging
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
export async function executeQuery(
  endpointKey: string, 
  params: Record<string, any>
): Promise<Record<string, unknown>> {
  // *** ADDED LOGGING ***
  writeLog(`[QueryManager:executeQuery] ENTERED. Endpoint: ${endpointKey}, Params: ${JSON.stringify(params)}`);

  // Get endpoint configuration
  const config = getEndpointConfig(endpointKey);
  
  // Apply automatic date parameters
  const paramsWithDates = applyDateParameters(endpointKey, params);
  
  const enhancedParams = { ...paramsWithDates }; // Start with date params
  
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
      // *** ADDED LOGGING ***
      writeLog(`[QueryManager:executeQuery] BEFORE applyFallbackStrategy. Params: ${JSON.stringify(enhancedParams)}`);
      // Apply fallback strategy to get missing parameters
      let dataFromAllEvents = null;
      
      // Use applyFallbackStrategy for all fallback strategies
      const result = await applyFallbackStrategy(endpointKey, enhancedParams);
      const updatedParams = result.updatedParams;
      dataFromAllEvents = result.dataFromAllEvents;
      
      // Filter params before final API call
      const finalParams: Record<string, any> = {};
      const allowedParams = [...config.requiredParams, ...(config.optionalParams || [])];
      for (const key of allowedParams) {
        if (updatedParams[key] !== undefined) {
          finalParams[key] = updatedParams[key];
        }
      }
      
      // *** ADDED LOGGING ***
      writeLog(`[QueryManager:executeQuery] AFTER filtering. Original updatedParams: ${JSON.stringify(updatedParams)}, Filtered finalParams: ${JSON.stringify(finalParams)}`);
      
      // If we got data from AllEvents, return it directly
      if (dataFromAllEvents) {
        return dataFromAllEvents;
      }
      
      // *** ADDED LOGGING ***
      writeLog(`[QueryManager:executeQuery] BEFORE fetchAttom. Final Params: ${JSON.stringify(finalParams)}`);
      
      // Execute the API request with potentially updated params
      const response = await fetchAttom(config.path, finalParams); // <<< Use filtered params
      
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
 * Special validation function for sales comparables endpoints
 * This handles the unique parameter requirements for these endpoints
 */
export function isValidSalesComparablesQuery(endpointKey: string, params: Record<string, any>): boolean {
  console.log(`[isValidSalesComparablesQuery] Checking validation for sales comparables endpoint: ${endpointKey}`);
  console.log(`[isValidSalesComparablesQuery] Parameters received:`, JSON.stringify(params));
  
  // Ensure all parameters are normalized to the expected types
  const normalizedParams = normalizeParams(params);
  
  // Sales comparables address validation
  if (endpointKey === 'salesComparablesAddress') {
    // Required path parameters for address endpoint
    const requiredParams = ['street', 'city', 'state', 'zip'];
    const hasAllRequired = requiredParams.every(param => normalizedParams[param] !== undefined);
    
    if (!hasAllRequired) {
      console.log(`[isValidSalesComparablesQuery] Address endpoint required params check: FAILED - missing required parameters`);
      return false;
    }
    
    // Fill in optional params with default values to ensure they pass validation
    const completeParams = {
      ...normalizedParams,
      county: normalizedParams.county ?? '-',
      searchType: normalizedParams.searchType ?? 'Radius',
      minComps: normalizedParams.minComps ?? 1,
      maxComps: normalizedParams.maxComps ?? 10,
      miles: normalizedParams.miles ?? 5,
      sameCity: normalizedParams.sameCity ?? 'true',
      useSameTargetCode: normalizedParams.useSameTargetCode ?? 'true',
      bedroomsRange: normalizedParams.bedroomsRange ?? 1,
      bathroomRange: normalizedParams.bathroomRange ?? 1,
      sqFeetRange: normalizedParams.sqFeetRange ?? 600,
      lotSizeRange: normalizedParams.lotSizeRange ?? 3000,
      saleDateRange: normalizedParams.saleDateRange ?? 12,
      yearBuiltRange: normalizedParams.yearBuiltRange ?? 20,
      ownerOccupied: normalizedParams.ownerOccupied ?? 'Both',
      distressed: normalizedParams.distressed ?? 'IncludeDistressed'
    };
    
    // Make sure these modified params are available for later steps
    for (const [key, value] of Object.entries(completeParams)) {
      params[key] = value;
    }
    
    console.log(`[isValidSalesComparablesQuery] Address endpoint params check: PASSED with complete params`);
    console.log(`[isValidSalesComparablesQuery] Complete params:`, JSON.stringify(completeParams));
    return true;
  }
  
  // Sales comparables propId validation
  if (endpointKey === 'salesComparablesPropId') {
    // Only propId is required for this endpoint
    const hasPropId = normalizedParams.propId !== undefined;
    
    if (!hasPropId) {
      console.log(`[isValidSalesComparablesQuery] PropId endpoint required params check: FAILED - missing propId`);
      return false;
    }
    
    // Fill in optional params with default values to ensure they pass validation
    const completeParams = {
      ...normalizedParams,
      searchType: normalizedParams.searchType ?? 'Radius',
      minComps: normalizedParams.minComps ?? 1,
      maxComps: normalizedParams.maxComps ?? 10,
      miles: normalizedParams.miles ?? 5,
      sameCity: normalizedParams.sameCity ?? 'true',
      useSameTargetCode: normalizedParams.useSameTargetCode ?? 'true',
      bedroomsRange: normalizedParams.bedroomsRange ?? 1,
      bathroomRange: normalizedParams.bathroomRange ?? 1,
      sqFeetRange: normalizedParams.sqFeetRange ?? 600,
      lotSizeRange: normalizedParams.lotSizeRange ?? 3000,
      saleDateRange: normalizedParams.saleDateRange ?? 12,
      yearBuiltRange: normalizedParams.yearBuiltRange ?? 20,
      ownerOccupied: normalizedParams.ownerOccupied ?? 'Both',
      distressed: normalizedParams.distressed ?? 'IncludeDistressed'
    };
    
    // Make sure these modified params are available for later steps
    for (const [key, value] of Object.entries(completeParams)) {
      params[key] = value;
    }
    
    console.log(`[isValidSalesComparablesQuery] PropId endpoint params check: PASSED with complete params`);
    console.log(`[isValidSalesComparablesQuery] Complete params:`, JSON.stringify(completeParams));
    return true;
  }
  
  // Not a sales comparables endpoint, return false to use default validation
  return false;
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

/**
 * Check if a query is valid based on required parameters
 * @param endpointKey Endpoint key
 * @param params Query parameters
 * @returns True if query is valid
 */
export function isValidQuery(endpointKey: string, params: Record<string, any>): boolean {
  try {
    console.log(`[isValidQuery] Checking validation for endpoint: ${endpointKey}`);
    console.log(`[isValidQuery] Parameters received:`, JSON.stringify(params));
    
    // Special handling for sales comparables endpoints
    if (endpointKey === 'salesComparablesAddress' || endpointKey === 'salesComparablesPropId') {
      return isValidSalesComparablesQuery(endpointKey, params);
    }
    
    const config = getEndpointConfig(endpointKey);
    console.log(`[isValidQuery] Required parameters:`, JSON.stringify(config.requiredParams));
    
    const fallbackStrategy = config.fallbackStrategy;
    console.log(`[isValidQuery] Fallback strategy:`, fallbackStrategy);
    
    // Check each required parameter individually
    console.log(`[isValidQuery] Checking individual parameters:`);
    for (const param of config.requiredParams) {
      console.log(`[isValidQuery] Parameter ${param}: ${params[param] !== undefined ? 'PRESENT' : 'MISSING'}`);
    }
    
    // Check if all required parameters are present
    const hasRequired = hasRequiredParams(endpointKey, params);
    console.log(`[isValidQuery] All required parameters present? ${hasRequired}`);
    
    // If we have required params, query is valid
    if (hasRequired) {
      console.log(`[isValidQuery] Validation PASSED for ${endpointKey}`);
      return true;
    }
    
    console.log(`[isValidQuery] Validation FAILED for ${endpointKey} - missing required parameters`);

    
    // Check if we can use fallback strategies
    if (!fallbackStrategy) {
      return false;
    }
    
    // Check based on fallback strategy type
    const AUTO_FILLED_PARAMS_MAP: Record<string, string[]> = {
      saleSnapshot: ['startsalesearchdate', 'endsalesearchdate'],
      transactionSalesTrend: ['startyear', 'endyear']
    };
    switch (fallbackStrategy) {
      case FallbackStrategy.ADDRESS_TO_ATTOMID: {
        const attomIdVariants = ['attomid', 'attomId', 'id', 'propid', 'propId'];
        const hasAddressForAttomId = !!(params.address1 && params.address2);
        const autoFilled = AUTO_FILLED_PARAMS_MAP[endpointKey] ?? [];
        const otherRequiredAttomId = config.requiredParams.filter(p => !attomIdVariants.includes(p.toLowerCase()) && !autoFilled.includes(p));
        const hasOtherRequiredAttomId = otherRequiredAttomId.every(p => params[p] !== undefined);
        return hasAddressForAttomId && hasOtherRequiredAttomId;
      }
        
      case FallbackStrategy.ADDRESS_TO_GEOID: {
        // Check if address is present AND all other required params (excluding the one fallback provides)
        const hasAddressForGeoId = !!(params.address || (params.address1 && params.address2));
        const autoFilled = AUTO_FILLED_PARAMS_MAP[endpointKey] ?? [];
        const otherRequiredGeoId = config.requiredParams.filter(p => p !== 'geoIdV4' && !autoFilled.includes(p));
        const hasOtherRequiredGeoId = otherRequiredGeoId.every(p => params[p] !== undefined);
        return hasAddressForGeoId && hasOtherRequiredGeoId;
      }
        
      case FallbackStrategy.ATTOMID_TO_ID: {
        // Check if attomid is present AND all other required params (excluding the one fallback provides)
        const hasAttomIdForId = !!params.attomid;
        const otherRequiredId = config.requiredParams.filter(p => p !== 'id');
        const hasOtherRequiredId = otherRequiredId.every(p => params[p] !== undefined);
        return hasAttomIdForId && hasOtherRequiredId;
      }
        
      default:
        return false;
    }
  } catch (error: unknown) {
    console.error('Error validating query:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Get all available query types
 * @returns Array of endpoint keys
 */
export function getAvailableQueryTypes(): string[] {
  return Object.keys(endpoints);
}

/**
 * Handle the ADDRESS_TO_ATTOMID fallback strategy
 */
async function handleAddressToAttomIdFallback(
  endpointKey: string, 
  params: Record<string, any>,
  config: EndpointConfig
): Promise<Record<string, any>> {
  const updatedParams = { ...params };
  // Find the required parameter that needs an ATTOM ID
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
 * Handle the ADDRESS_TO_GEOID fallback strategy
 */
async function handleAddressToGeoIdFallback(
  endpointKey: string, 
  params: Record<string, any>,
  config: EndpointConfig
): Promise<Record<string, any>> {
  const updatedParams = { ...params };
  const requiredGeoIdParam = config.requiredParams.find(p => p.toLowerCase().includes('geoid'));
  
  if (requiredGeoIdParam && !updatedParams[requiredGeoIdParam] && updatedParams.address1 && updatedParams.address2) {
    writeLog(`[applyFallbackStrategy] Applying ADDRESS_TO_GEOID fallback for ${endpointKey} (seeking ${requiredGeoIdParam}).`);
    
    const useNormalization = true; // Always use Google normalization
    const cacheKey = `request:${endpointKey}:${updatedParams.address1}:${updatedParams.address2}`;
    const geoIdSubtype = config.preferredGeoIdSubtype ?? 'N2'; // Default to 'N2' if not specified
    
    const foundGeoId = await fallbackGeoIdV4SubtypeCached(
      updatedParams.address1,
      updatedParams.address2,
      geoIdSubtype,
      cacheKey,
      useNormalization
    );

    if (foundGeoId) {
      const processed = processGeoIdV4(foundGeoId, geoIdSubtype);
      updatedParams[requiredGeoIdParam] = processed;
      writeLog(`[applyFallbackStrategy] Fallback successful. Using GeoID: ${processed}`);
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
async function applyFallbackStrategy(
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

    // TRY_ALLEVENTS_FIRST is handled before this function now in executeAttomQuery
    
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

/**
 * This function has been moved to the fallbackAttomIdFromAddressCached utility in fallback.ts
 * @see fallbackAttomIdFromAddressCached in src/utils/fallback.ts
 */

/**
 * NOTE: The TRY_ALLEVENTS_FIRST logic is now implemented directly in the executeAttomQuery function
 * rather than as a fallback strategy. This function remains as a placeholder for backwards compatibility
 * but should not be called directly.
 * @see executeAttomQuery for the actual implementation of the TRY_ALLEVENTS_FIRST logic
 */
async function applyTryAllEventsFirstFallback(
  params: Record<string, any>,
  config: EndpointConfig
): Promise<{ updatedParams: Record<string, any>; dataFromAllEvents: Record<string, unknown> | null }> {
  writeLog('[applyTryAllEventsFirstFallback] Placeholder function called.');
  // Example implementation detail: This function might modify 'params' if it finds an ID
  // and might return actual data in 'dataFromAllEvents' if found in cache/AllEvents call.
  
  // Correct return structure:
  return { updatedParams: params, dataFromAllEvents: null }; 
}


// Implementation of applyAddressToGeoIdFallback is already defined as an exported function above

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

  // Apply automatic date parameters
  const paramsWithDates = applyDateParameters(endpointKey, params);

  const enhancedParams = { ...paramsWithDates }; // Start with date params

  // Generate cache key for deduplication
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
      // Apply fallback strategy to get missing parameters
      let dataFromAllEvents = null;

      // Use applyFallbackStrategy for all fallback strategies
      const result = await applyFallbackStrategy(endpointKey, enhancedParams);
      const updatedParams = result.updatedParams;
      dataFromAllEvents = result.dataFromAllEvents;

      // Filter params before final API call
      const finalParams: Record<string, any> = {};
      const allowedParams = [...config.requiredParams, ...(config.optionalParams || [])];
      for (const key of allowedParams) {
        if (updatedParams[key] !== undefined) {
          finalParams[key] = updatedParams[key];
        }
      }

      // If we got data from AllEvents, return it directly
      if (dataFromAllEvents) {
        return dataFromAllEvents;
      }

      // Execute the API request with potentially updated params
      const response = await fetchAttom(config.path, finalParams); // <<< Use filtered params

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
