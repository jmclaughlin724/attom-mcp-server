import { writeLog } from './logger.js';
import { getPlaceDetails, getPlaceSuggestions } from './googlePlaces.js';

/**
 * Normalizes an address string for use with ATTOM API
 * @param address The full address to normalize
 * @returns A promise with the normalized address components or null if normalization fails
 */
export async function normalizeAddressStringForAttom(address: string): Promise<{
  address1: string;
  address2: string;
  formattedAddress: string;
} | null> {
  try {
    // Use Google Places API to search for the address
    const searchResults = await getPlaceSuggestions(address);
    
    if (!searchResults || searchResults.length === 0) {
      writeLog(`[Address Normalization] No results found for address: ${address}`);
      return null;
    }
    
    // Get the first result's place ID
    const placeId = searchResults[0].place_id;
    
    // Fetch detailed information using the place ID
    const placeDetails = await getPlaceDetails(placeId);
    
    if (!placeDetails) {
      writeLog(`[Address Normalization] Could not fetch details for place ID: ${placeId}`);
      return null;
    }
    
    // Extract address components
    let streetNumber = '';
    let streetName = '';
    let city = '';
    let state = '';
    let postalCode = '';
    
    for (const component of placeDetails.result.address_components) {
      if (component.types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (component.types.includes('route')) {
        streetName = component.long_name;
      } else if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (component.types.includes('postal_code')) {
        postalCode = component.long_name;
      }
    }
    
    // Construct normalized address components
    const address1 = `${streetNumber} ${streetName}`.trim();
    const address2 = `${city}, ${state} ${postalCode}`.trim();
    const formattedAddress = placeDetails.result.formatted_address || `${address1}, ${address2}`;
    
    return {
      address1,
      address2,
      formattedAddress
    };
  } catch (error: unknown) {
    writeLog(`[Address Normalization] Error normalizing address "${address}": ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Precisely normalize only address fields in a parameter object
 * @param params The complete parameter object (may contain nested structures)
 * @returns A new parameter object with only address fields normalized
 */
export async function normalizeAddressInParams(
  params: Record<string, any>
): Promise<Record<string, any>> {
  // Create a deep copy of the params to avoid modifying the original
  const normalizedParams = JSON.parse(JSON.stringify(params));
  
  // Case 1: Direct address parameters at the top level
  if (normalizedParams.address1 && normalizedParams.address2) {
    await normalizeAddressPair(normalizedParams, 'address1', 'address2');
  }
  
  // Case 2: Nested address parameters in a 'params' property (common in grouped tools)
  if (normalizedParams.params && 
      normalizedParams.params.address1 && 
      normalizedParams.params.address2) {
    await normalizeAddressPair(normalizedParams.params, 'address1', 'address2');
  }
  
  // Case 3: Address as a single field (used in some endpoints)
  if (normalizedParams.address && typeof normalizedParams.address === 'string') {
    await normalizeFullAddress(normalizedParams, 'address');
  }
  
  // Case 4: Nested address as a single field
  if (normalizedParams.params && 
      normalizedParams.params.address && 
      typeof normalizedParams.params.address === 'string') {
    await normalizeFullAddress(normalizedParams.params, 'address');
  }
  
  // Return the params with only address fields normalized
  return normalizedParams;
}

/**
 * Helper function to normalize an address1/address2 pair
 */
async function normalizeAddressPair(
  obj: Record<string, any>,
  address1Field: string,
  address2Field: string
): Promise<void> {
  try {
    const normalized = await normalizeAddressStringForAttom(
      `${obj[address1Field]}, ${obj[address2Field]}`
    );
    
    if (normalized) {
      // Only update the address fields, nothing else
      obj[address1Field] = normalized.address1;
      obj[address2Field] = normalized.address2;
      writeLog(`[Address Normalization] Normalized: ${normalized.formattedAddress}`);
    }
  } catch (error: unknown) {
    writeLog(`[Address Normalization] Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper function to normalize a full address in a single field
 */
async function normalizeFullAddress(
  obj: Record<string, any>,
  addressField: string
): Promise<void> {
  try {
    const normalized = await normalizeAddressStringForAttom(obj[addressField]);
    
    if (normalized) {
      // For single address fields, we update with the formatted address
      obj[addressField] = normalized.formattedAddress;
      writeLog(`[Address Normalization] Normalized: ${normalized.formattedAddress}`);
    }
  } catch (error: unknown) {
    writeLog(`[Address Normalization] Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}