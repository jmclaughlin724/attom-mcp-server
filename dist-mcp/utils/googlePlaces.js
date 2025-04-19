// src/utils/googlePlaces.ts
import fetch from 'node-fetch';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';
/**
 * Get autocomplete suggestions from Google Places API
 * @param input User input for address search
 * @returns Array of place predictions
 */
export async function getPlaceSuggestions(input) {
    if (!GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API key is not configured');
    }
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&key=${GOOGLE_MAPS_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status !== 'OK') {
            console.error(`Google Places API error: ${data.status}`);
            return [];
        }
        return data.predictions;
    }
    catch (error) {
        console.error('Error fetching place suggestions:', error);
        return [];
    }
}
/**
 * Get place details from Google Places API
 * @param placeId Google Place ID
 * @returns Place details
 */
export async function getPlaceDetails(placeId) {
    if (!GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API key is not configured');
    }
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_component,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status !== 'OK') {
            console.error(`Google Places API error: ${data.status}`);
            return null;
        }
        return data;
    }
    catch (error) {
        console.error('Error fetching place details:', error);
        return null;
    }
}
/**
 * Normalize address from Google Places for ATTOM API
 * @param placeId Google Place ID
 * @returns Normalized address for ATTOM API
 */
export async function normalizeAddressForAttom(placeId) {
    const placeDetails = await getPlaceDetails(placeId);
    if (!placeDetails?.result) {
        return null;
    }
    const { result } = placeDetails;
    // Extract street number and street name
    const streetNumber = result.address_components.find(component => component.types.includes('street_number'))?.long_name ?? '';
    const streetName = result.address_components.find(component => component.types.includes('route'))?.long_name ?? '';
    // Extract city, state, and zip
    const city = result.address_components.find(component => component.types.includes('locality'))?.long_name ?? '';
    const state = result.address_components.find(component => component.types.includes('administrative_area_level_1'))?.short_name ?? '';
    const zip = result.address_components.find(component => component.types.includes('postal_code'))?.long_name ?? '';
    // Format address1 and address2 for ATTOM API
    const address1 = `${streetNumber} ${streetName}`.trim();
    const address2 = `${city}, ${state} ${zip}`.trim();
    return {
        address1,
        address2,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address
    };
}
/**
 * Normalize address from string for ATTOM API
 * @param address Full address string
 * @returns Normalized address for ATTOM API
 */
export async function normalizeAddressStringForAttom(address) {
    // First get suggestions
    const suggestions = await getPlaceSuggestions(address);
    if (!suggestions || suggestions.length === 0) {
        // Fallback to simple splitting if no suggestions
        const parts = address.split(',');
        if (parts.length >= 2) {
            return {
                address1: parts[0].trim(),
                address2: parts.slice(1).join(',').trim()
            };
        }
        return null;
    }
    // Use the first suggestion
    return normalizeAddressForAttom(suggestions[0].place_id);
}
//# sourceMappingURL=googlePlaces.js.map