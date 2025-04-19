/**
 * ATTOM API Service
 *
 * This service provides a high-level interface to the ATTOM API,
 * leveraging the endpoint configuration and query manager.
 */
import { executeQuery, isValidQuery } from './queryManager.js';
import { getEndpointsByCategory } from '../config/endpointConfig.js';
/**
 * ATTOM API Service class
 */
export class AttomService {
    /**
     * Execute a property-related query
     * @param queryType Query type (endpoint key)
     * @param params Query parameters
     * @returns API response
     */
    async executeQuery(queryType, params) {
        if (!isValidQuery(queryType, params)) {
            throw new Error(`Invalid query parameters for ${queryType}`);
        }
        return executeQuery(queryType, params);
    }
    /**
     * Get comprehensive property data from AllEvents endpoint
     * @param params Query parameters
     * @returns AllEvents data
     */
    async getAllEventsDetail(params) {
        return this.executeQuery('allEventsDetail', params);
    }
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
    async getPropertyBasicProfile(params) {
        return this.executeQuery('propertyBasicProfile', params);
    }
    /**
     * Get property details with owner information
     * @param params Query parameters
     * @returns Property details with owner information
     */
    async getPropertyDetailOwner(params) {
        return this.executeQuery('propertyDetailOwner', params);
    }
    /**
     * Get property mortgage details
     * @param params Query parameters
     * @returns Property mortgage details
     */
    async getPropertyMortgageDetails(params) {
        return this.executeQuery('propertyDetailMortgage', params);
    }
    /**
     * Get property building permits
     * @param params Query parameters
     * @returns Property building permits
     */
    async getPropertyBuildingPermits(params) {
        return this.executeQuery('propertyBuildingPermits', params);
    }
    /**
     * Get property rental AVM
     * @param params Query parameters
     * @returns Property rental AVM
     */
    async getPropertyRentalAVM(params) {
        return this.executeQuery('propertyRentalAVM', params);
    }
    /**
     * Get property AVM details
     * @param params Query parameters
     * @returns Property AVM details
     */
    async getPropertyAVMDetail(params) {
        return this.executeQuery('propertyAVMDetail', params);
    }
    /**
     * Get property assessment details
     * @param params Query parameters
     * @returns Property assessment details
     */
    async getPropertyAssessmentDetail(params) {
        return this.executeQuery('propertyAssessmentDetail', params);
    }
    /**
     * Get property details with mortgage and owner
     * @param params Query parameters
     * @returns Property details with mortgage and owner
     */
    async getPropertyDetailMortgageOwner(params) {
        return this.executeQuery('propertyDetailMortgageOwner', params);
    }
    /**
     * Get property home equity
     * @param params Query parameters
     * @returns Property home equity
     */
    async getPropertyHomeEquity(params) {
        return this.executeQuery('homeEquity', params);
    }
    /**
     * Get AVM snapshot for a property
     * @param params Query parameters
     * @returns AVM snapshot
     */
    async getAvmSnapshot(params) {
        return this.executeQuery('avmSnapshot', params);
    }
    /**
     * Get AVM history detail for a property
     * @param params Query parameters
     * @returns AVM history detail
     */
    async getAvmHistoryDetail(params) {
        return this.executeQuery('avmHistoryDetail', params);
    }
    /**
     * Get property details with schools
     * @param params Query parameters
     * @returns Property details with schools
     */
    async getPropertyDetailsWithSchools(params) {
        return this.executeQuery('propertyDetailsWithSchools', params);
    }
    /**
     * Get property sales history snapshot
     * @param params Query parameters
     * @returns Property sales history snapshot
     */
    async getSalesHistorySnapshot(params) {
        return this.executeQuery('salesHistorySnapshot', params);
    }
    /**
     * Get property basic sales history
     * @param params Query parameters
     * @returns Property basic sales history
     */
    async getSalesHistoryBasic(params) {
        return this.executeQuery('salesHistoryBasic', params);
    }
    /**
     * Get property expanded sales history
     * @param params Query parameters
     * @returns Property expanded sales history
     */
    async getSalesHistoryExpanded(params) {
        return this.executeQuery('salesHistoryExpanded', params);
    }
    /**
     * Get property detailed sales history
     * @param params Query parameters
     * @returns Property detailed sales history
     */
    async getSalesHistoryDetail(params) {
        return this.executeQuery('salesHistoryDetail', params);
    }
    /**
     * Get property sale detail
     * @param params Query parameters
     * @returns Property sale detail
     */
    async getSaleDetail(params) {
        return this.executeQuery('saleDetail', params);
    }
    /**
     * Get property sale snapshot
     * @param params Query parameters including geoIdV4, startsalesearchdate, and endsalesearchdate
     * @returns Property sale snapshot
     */
    async getSaleSnapshot(params) {
        return this.executeQuery('saleSnapshot', params);
    }
    /**
     * Get all events snapshot
     * @param params Query parameters
     * @returns All events snapshot
     */
    async getAllEventsSnapshot(params) {
        return this.executeQuery('allEventsSnapshot', params);
    }
    /**
     * Get sales comparables by address
     * @param params Query parameters
     * @returns Sales comparables
     */
    async getSalesComparablesAddress(params) {
        return this.executeQuery('salesComparablesAddress', params);
    }
    /**
     * Get sales comparables by property ID
     * @param params Query parameters
     * @returns Sales comparables
     */
    async getSalesComparablesPropId(params) {
        return this.executeQuery('salesComparablesPropId', params);
    }
    /**
     * Get geographic boundary
     * @param params Query parameters
     * @returns Geographic boundary
     */
    async getGeographicBoundary(params) {
        return this.executeQuery('geographicBoundary', params);
    }
    /**
     * Get school profile
     * @param params Query parameters
     * @returns School profile
     */
    async getSchoolProfile(params) {
        return this.executeQuery('schoolProfile', params);
    }
    /**
     * Get school district
     * @param params Query parameters
     * @returns School district
     */
    async getSchoolDistrict(params) {
        return this.executeQuery('schoolDistrict', params);
    }
    /**
     * Get transportation noise
     * @param params Query parameters
     * @returns Transportation noise
     */
    async getTransportationNoise(params) {
        return this.executeQuery('transportationNoise', params);
    }
    /**
     * Get property sales history
     * @param params Query parameters
     * @returns Property sales history
     */
    async getPropertySalesHistory(params) {
        return this.executeQuery('salesHistoryDetail', params);
    }
    /**
     * Get community profile
     * @param params Query parameters
     * @returns Community profile
     */
    async getCommunityProfile(params) {
        return this.executeQuery('communityProfile', params);
    }
    /**
     * Search for schools
     * @param params Query parameters
     * @returns School search results
     */
    async searchSchools(params) {
        return this.executeQuery('schoolSearch', params);
    }
    /**
     * Search for points of interest
     * @param params Query parameters
     * @returns POI search results
     */
    async searchPOI(params) {
        return this.executeQuery('poiSearch', params);
    }
    /**
     * Get all available endpoints by category
     * @param category Endpoint category
     * @returns Array of endpoint keys
     */
    getEndpointsByCategory(category) {
        const endpoints = getEndpointsByCategory(category);
        return endpoints.map(endpoint => endpoint.path);
    }
    /**
     * Check if a specific data field is available in AllEvents response
     * @param allEventsData AllEvents response data
     * @param field Field to check
     * @returns True if field is available
     */
    isFieldAvailableInAllEvents(allEventsData, field) {
        if (!allEventsData?.property || !Array.isArray(allEventsData.property) || allEventsData.property.length === 0) {
            return false;
        }
        const property = allEventsData.property[0];
        return !!property[field];
    }
}
//# sourceMappingURL=attomService.js.map