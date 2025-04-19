// src/mcp_tools.ts
import { z } from 'zod';
import { normalizeAddressStringForAttom } from './utils/googlePlaces.js';
import { fetchAttom } from './utils/fetcher.js';

/**
 * MCP tool for Google Places address normalization and ATTOM API integration
 * 
 * This tool normalizes addresses using Google Places API before querying the ATTOM API.
 * It ensures that addresses are properly formatted and validated, improving the accuracy
 * of property data retrieval.
 */

// Schema for address normalization
const addressNormalizationSchema = z.object({
  address: z.string().describe('Full address to normalize (e.g., "123 Main St, Anytown, CA 12345")'),
});

// Schema for property search
const propertySearchSchema = z.object({
  address1: z.string().describe('Street address (e.g., "123 Main St")'),
  address2: z.string().describe('City, state, ZIP (e.g., "Anytown, CA 12345")'),
  useGoogleNormalization: z.boolean().optional().default(true).describe('Whether to use Google Places for address normalization'),
});

/**
 * Normalize an address using Google Places API
 * @param params Address to normalize
 * @returns Normalized address in ATTOM API format (address1 and address2)
 */
export async function normalizeAddress(params: z.infer<typeof addressNormalizationSchema>) {
  try {
    const normalized = await normalizeAddressStringForAttom(params.address);
    
    if (!normalized) {
      return {
        success: false,
        error: 'Failed to normalize address',
        original: params.address,
      };
    }
    
    return {
      success: true,
      normalized: {
        address1: normalized.address1,
        address2: normalized.address2,
        formattedAddress: normalized.formattedAddress,
        latitude: normalized.latitude,
        longitude: normalized.longitude,
      },
      original: params.address,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? 'Unknown error during address normalization',
      original: params.address,
    };
  }
}

/**
 * Search for property data using ATTOM API with optional Google Places normalization
 * @param params Search parameters
 * @returns Property data from ATTOM API
 */
export async function searchProperty(params: z.infer<typeof propertySearchSchema>) {
  try {
    let { address1, address2, useGoogleNormalization } = params;
    
    // Normalize address using Google Places if enabled
    if (useGoogleNormalization) {
      try {
        const normalized = await normalizeAddressStringForAttom(`${address1}, ${address2}`);
        if (normalized) {
          address1 = normalized.address1;
          address2 = normalized.address2;
          console.log(`[Google Places] Normalized address: ${normalized.formattedAddress}`);
          console.log(`[Google Places] address1: ${address1}, address2: ${address2}`);
        }
      } catch (error: unknown) {
        console.warn('[Google Places] Address normalization failed, using original address', 
          error instanceof Error ? error.message : String(error));
      }
    }
    
    // Fetch property data from ATTOM API
    console.log(`[ATTOM API] Fetching property data for: ${address1}, ${address2}`);
    const propertyData = await fetchAttom('/propertyapi/v1.0.0/property/detail', {
      address1,
      address2
    });
    
    return {
      success: true,
      property: propertyData.property,
      normalizedAddress: {
        address1,
        address2
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? 'Unknown error during property search',
      params
    };
  }
}

// Export schemas for MCP registration
export const schemas = {
  normalizeAddress: {
    description: 'Normalize an address using Google Places API',
    parameters: addressNormalizationSchema,
  },
  searchProperty: {
    description: 'Search for property data using ATTOM API with optional Google Places normalization',
    parameters: propertySearchSchema,
  },
};
