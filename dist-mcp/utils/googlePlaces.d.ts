/**
 * Interface for Google Places Autocomplete prediction
 */
export interface PlacePrediction {
    description: string;
    place_id: string;
    structured_formatting: {
        main_text: string;
        secondary_text: string;
    };
    terms: Array<{
        offset: number;
        value: string;
    }>;
}
/**
 * Interface for Google Places Autocomplete response
 */
export interface AutocompleteResponse {
    predictions: PlacePrediction[];
    status: string;
}
/**
 * Interface for Google Places Details response
 */
export interface PlaceDetailsResponse {
    result: {
        address_components: Array<{
            long_name: string;
            short_name: string;
            types: string[];
        }>;
        formatted_address: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
        place_id: string;
    };
    status: string;
}
/**
 * Interface for normalized address for ATTOM API
 */
export interface NormalizedAddress {
    address1: string;
    address2: string;
    latitude?: number;
    longitude?: number;
    formattedAddress?: string;
}
/**
 * Get autocomplete suggestions from Google Places API
 * @param input User input for address search
 * @returns Array of place predictions
 */
export declare function getPlaceSuggestions(input: string): Promise<PlacePrediction[]>;
/**
 * Get place details from Google Places API
 * @param placeId Google Place ID
 * @returns Place details
 */
export declare function getPlaceDetails(placeId: string): Promise<PlaceDetailsResponse | null>;
/**
 * Normalize address from Google Places for ATTOM API
 * @param placeId Google Place ID
 * @returns Normalized address for ATTOM API
 */
export declare function normalizeAddressForAttom(placeId: string): Promise<NormalizedAddress | null>;
/**
 * Normalize address from string for ATTOM API
 * @param address Full address string
 * @returns Normalized address for ATTOM API
 */
export declare function normalizeAddressStringForAttom(address: string): Promise<NormalizedAddress | null>;
