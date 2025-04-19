/**
 * ATTOM API Service
 *
 * This service provides a high-level interface to the ATTOM API,
 * leveraging the endpoint configuration and query manager.
 */
import { EndpointCategory, AllEventsDataField } from '../config/endpointConfig.js';
/**
 * ATTOM API Service class
 */
export declare class AttomService {
    /**
     * Execute a property-related query
     * @param queryType Query type (endpoint key)
     * @param params Query parameters
     * @returns API response
     */
    executeQuery(queryType: string, params: Record<string, any>): Promise<any>;
    /**
     * Get comprehensive property data from AllEvents endpoint
     * @param params Query parameters
     * @returns AllEvents data
     */
    getAllEventsDetail(params: {
        id: string;
    }): Promise<any>;
    /**
     * Get property basic profile
     * @param params Query parameters
     * @returns Property basic profile
     */
    /**
     * Get property basic profile
     * @param params Query parameters
     * @returns Property basic profile
     */
    getPropertyBasicProfile(params: {
        address1: string;
        address2: string;
    }): Promise<any>;
    /**
     * Get property details with owner information
     * @param params Query parameters
     * @returns Property details with owner information
     */
    getPropertyDetailOwner(params: {
        attomid: string;
    }): Promise<any>;
    /**
     * Get property mortgage details
     * @param params Query parameters
     * @returns Property mortgage details
     */
    getPropertyMortgageDetails(params: {
        attomid: string;
    }): Promise<any>;
    /**
     * Get property building permits
     * @param params Query parameters
     * @returns Property building permits
     */
    getPropertyBuildingPermits(params: {
        address1?: string;
        address2?: string;
        attomid?: string;
    }): Promise<any>;
    /**
     * Get property rental AVM
     * @param params Query parameters
     * @returns Property rental AVM
     */
    getPropertyRentalAVM(params: {
        attomid: string;
    }): Promise<any>;
    /**
     * Get property AVM details
     * @param params Query parameters
     * @returns Property AVM details
     */
    getPropertyAVMDetail(params: {
        address1: string;
        address2: string;
    }): Promise<any>;
    /**
     * Get property assessment details
     * @param params Query parameters
     * @returns Property assessment details
     */
    getPropertyAssessmentDetail(params: {
        address1: string;
        address2: string;
    }): Promise<any>;
    /**
     * Get property details with mortgage and owner
     * @param params Query parameters
     * @returns Property details with mortgage and owner
     */
    getPropertyDetailMortgageOwner(params: {
        attomid: string;
    }): Promise<any>;
    /**
     * Get property home equity
     * @param params Query parameters
     * @returns Property home equity
     */
    getPropertyHomeEquity(params: {
        attomid: string;
    }): Promise<any>;
    /**
     * Get AVM snapshot for a property
     * @param params Query parameters
     * @returns AVM snapshot
     */
    getAvmSnapshot(params: {
        attomid: string;
    }): Promise<any>;
    /**
     * Get AVM history detail for a property
     * @param params Query parameters
     * @returns AVM history detail
     */
    getAvmHistoryDetail(params: {
        address1: string;
        address2: string;
    }): Promise<any>;
    /**
     * Get property details with schools
     * @param params Query parameters
     * @returns Property details with schools
     */
    getPropertyDetailsWithSchools(params: {
        attomid: string;
    }): Promise<any>;
    /**
     * Get property sales history snapshot
     * @param params Query parameters
     * @returns Property sales history snapshot
     */
    getSalesHistorySnapshot(params: {
        attomid: string;
    }): Promise<any>;
    /**
     * Get property basic sales history
     * @param params Query parameters
     * @returns Property basic sales history
     */
    getSalesHistoryBasic(params: {
        address1: string;
        address2: string;
    }): Promise<any>;
    /**
     * Get property expanded sales history
     * @param params Query parameters
     * @returns Property expanded sales history
     */
    getSalesHistoryExpanded(params: {
        address1: string;
        address2: string;
    }): Promise<any>;
    /**
     * Get property detailed sales history
     * @param params Query parameters
     * @returns Property detailed sales history
     */
    getSalesHistoryDetail(params: {
        address1: string;
        address2: string;
    }): Promise<any>;
    /**
     * Get property sale detail
     * @param params Query parameters
     * @returns Property sale detail
     */
    getSaleDetail(params: {
        address1: string;
        address2: string;
    }): Promise<any>;
    /**
     * Get property sale snapshot
     * @param params Query parameters including geoIdV4, startsalesearchdate, and endsalesearchdate
     * @returns Property sale snapshot
     */
    getSaleSnapshot(params: {
        geoIdV4: string;
        startsalesearchdate?: string;
        endsalesearchdate?: string;
    }): Promise<any>;
    /**
     * Get all events snapshot
     * @param params Query parameters
     * @returns All events snapshot
     */
    getAllEventsSnapshot(params: {
        id: string;
    }): Promise<any>;
    /**
     * Get sales comparables by address
     * @param params Query parameters
     * @returns Sales comparables
     */
    getSalesComparablesAddress(params: {
        street: string;
        city: string;
        county: string;
        state: string;
        zip: string;
        searchType?: string;
        minComps?: number;
        maxComps?: number;
        miles?: number;
    }): Promise<any>;
    /**
     * Get sales comparables by property ID
     * @param params Query parameters
     * @returns Sales comparables
     */
    getSalesComparablesPropId(params: {
        propId: string;
        searchType?: string;
        minComps?: number;
        maxComps?: number;
        miles?: number;
    }): Promise<any>;
    /**
     * Get geographic boundary
     * @param params Query parameters
     * @returns Geographic boundary
     */
    getGeographicBoundary(params: {
        format: string;
        geoIdV4: string;
    }): Promise<any>;
    /**
     * Get school profile
     * @param params Query parameters
     * @returns School profile
     */
    getSchoolProfile(params: {
        geoIdV4: string;
    }): Promise<any>;
    /**
     * Get school district
     * @param params Query parameters
     * @returns School district
     */
    getSchoolDistrict(params: {
        geoIdV4: string;
    }): Promise<any>;
    /**
     * Get transportation noise
     * @param params Query parameters
     * @returns Transportation noise
     */
    getTransportationNoise(params: {
        address: string;
    }): Promise<any>;
    /**
     * Get property sales history
     * @param params Query parameters
     * @returns Property sales history
     */
    getPropertySalesHistory(params: {
        address1: string;
        address2: string;
    }): Promise<any>;
    /**
     * Get community profile
     * @param params Query parameters
     * @returns Community profile
     */
    getCommunityProfile(params: {
        geoIdV4: string;
    }): Promise<any>;
    /**
     * Search for schools
     * @param params Query parameters
     * @returns School search results
     */
    searchSchools(params: {
        geoIdV4: string;
        radius?: number;
        page?: number;
        pageSize?: number;
    }): Promise<any>;
    /**
     * Search for points of interest
     * @param params Query parameters
     * @returns POI search results
     */
    searchPOI(params: {
        address: string;
        radius?: number;
        categoryName?: string;
        recordLimit?: number;
    }): Promise<any>;
    /**
     * Get all available endpoints by category
     * @param category Endpoint category
     * @returns Array of endpoint keys
     */
    getEndpointsByCategory(category: EndpointCategory): string[];
    /**
     * Check if a specific data field is available in AllEvents response
     * @param allEventsData AllEvents response data
     * @param field Field to check
     * @returns True if field is available
     */
    isFieldAvailableInAllEvents(allEventsData: any, field: AllEventsDataField): boolean;
}
