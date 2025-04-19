/**
 * Query Manager Service
 *
 * This service manages API queries using the endpoint configuration.
 * It ensures proper endpoint routing, prevents duplicate calls,
 * and implements rate limiting and caching strategies.
 */
/**
 * Apply address-to-geoid fallback strategy
 * @param endpointKey Endpoint key to determine preferred geocode subtype
 * @param params Request parameters
 * @returns Updated parameters with geoIdV4
 */
export declare function applyAddressToGeoIdFallback(endpointKey: string, params: Record<string, any>): Promise<Record<string, any>>;
/**
 * Execute a query to the ATTOM API
 * @param endpointKey Endpoint key from configuration
 * @param params Query parameters (can include address, geoIdV4, attomId, etc.)
 * @returns API response with status and data specific to the endpoint
 */
export declare function executeQuery(endpointKey: string, params: Record<string, any>): Promise<Record<string, unknown>>;
/**
 * Check if a query is valid based on required parameters
 * @param endpointKey Endpoint key
 * @param params Query parameters
 * @returns True if query is valid
 */
export declare function isValidQuery(endpointKey: string, params: Record<string, any>): boolean;
/**
 * Get all available query types
 * @returns Array of endpoint keys
 */
export declare function getAvailableQueryTypes(): string[];
