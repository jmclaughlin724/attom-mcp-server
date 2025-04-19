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
export declare enum EndpointCategory {
    PROPERTY = "property",
    ASSESSMENT = "assessment",
    SALE = "sale",
    MORTGAGE = "mortgage",
    PERMIT = "permit",
    RENTAL = "rental",
    SCHOOL = "school",
    COMMUNITY = "community",
    POI = "poi",
    ALLEVENTS = "allevents",
    AVM = "avm",
    TRANSPORTATION = "transportation"
}
/**
 * Fallback strategy types
 */
export declare enum FallbackStrategy {
    ADDRESS_TO_ATTOMID = "address-to-attomid",
    ADDRESS_TO_GEOID = "address-to-geoid",
    ATTOMID_TO_ID = "attomid-to-id",
    TRY_ALLEVENTS_FIRST = "try-allevents-first",
    NONE = "none"
}
/**
 * Data fields available in allevents/detail response
 */
export declare enum AllEventsDataField {
    PROPERTY = "property",
    AVM = "avm",
    ASSESSMENT = "assessment",
    SALE = "sale",
    BUILDING = "building",
    DEED = "deed",
    MORTGAGE = "mortgage",
    TAX = "tax"
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
    preferredGeoIdSubtype?: string;
    allEventsFields?: AllEventsDataField[];
    rateLimit: RateLimitConfig;
    cache: CacheConfig;
    responseSchema?: z.ZodType<any>;
}
/**
 * Endpoint configurations
 */
export declare const endpoints: Record<string, EndpointConfig>;
/**
 * Get endpoint configuration by key
 * @param key Endpoint key
 * @returns Endpoint configuration
 */
export declare function getEndpointConfig(key: string): EndpointConfig;
/**
 * Get all endpoints in a specific category
 * @param category Endpoint category
 * @returns Array of endpoint configurations
 */
export declare function getEndpointsByCategory(category: EndpointCategory): EndpointConfig[];
/**
 * Check if a request has all required parameters
 * @param endpointKey Endpoint key
 * @param params Request parameters
 * @returns True if all required parameters are present
 */
export declare function hasRequiredParams(endpointKey: string, params: Record<string, any>): boolean;
/**
 * Get fallback strategy for an endpoint
 * @param endpointKey Endpoint key
 * @returns Fallback strategy or undefined if none
 */
export declare function getFallbackStrategy(endpointKey: string): FallbackStrategy | undefined;
/**
 * Get AllEvents fields for an endpoint
 * @param endpointKey Endpoint key
 * @returns Array of AllEvents fields or undefined if none
 */
export declare function getAllEventsFields(endpointKey: string): AllEventsDataField[] | undefined;
/**
 * Check if an endpoint can use AllEvents data
 * @param endpointKey Endpoint key
 * @returns True if endpoint can use AllEvents data
 */
export declare function canUseAllEventsData(endpointKey: string): boolean;
