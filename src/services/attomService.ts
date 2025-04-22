/**
 * ATTOM API Service
 * 
 * This service provides a high-level interface to the ATTOM API,
 * leveraging the endpoint configuration and query manager.
 */

import { executeQuery, isValidQuery } from './queryManager.js';
import { EndpointCategory, getEndpointsByCategory, AllEventsDataField, endpoints } from '../config/endpointConfig.js';
import { fetchAttom } from '../utils/fetcher.js';

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
  public async executeQuery(queryType: string, params: Record<string, any>): Promise<any> {
    // Special direct execution path for sales comparables endpoints
    if (queryType === 'salesComparablesAddress' || queryType === 'salesComparablesPropId') {
      console.log(`[AttomService:executeQuery] Special handling for ${queryType} endpoint`);
      console.log(`[AttomService:executeQuery] Received params:`, JSON.stringify(params));
      
      // Ensure we have the essential parameters based on endpoint type
      if (queryType === 'salesComparablesAddress' && (!params.street || !params.city || !params.state || !params.zip)) {
        throw new Error(`Missing required parameters for ${queryType}`);
      } else if (queryType === 'salesComparablesPropId' && !params.propId) {
        throw new Error(`Missing required propId parameter for ${queryType}`);
      }
      
      // Use the API framework directly
      if (queryType === 'salesComparablesAddress') {
        // Create a copy of the params that we can modify
        const queryParams: Record<string, any> = {};
        
        // Extract path parameters
        const street = params.street as string;
        const city = params.city as string;
        const county = (params.county as string) ?? '-';
        const state = params.state as string;
        const zip = params.zip as string;
        
        // Add all the optional parameters with defaults
        queryParams.searchType = params.searchType ?? 'Radius';
        queryParams.minComps = params.minComps ?? 1;
        queryParams.maxComps = params.maxComps ?? 10;
        queryParams.miles = params.miles ?? 5;
        queryParams.sameCity = params.sameCity ?? true;
        queryParams.useSameTargetCode = params.useSameTargetCode ?? true;
        queryParams.bedroomsRange = params.bedroomsRange ?? 1;
        queryParams.bathroomRange = params.bathroomRange ?? 1;
        queryParams.sqFeetRange = params.sqFeetRange ?? 600;
        queryParams.lotSizeRange = params.lotSizeRange ?? 3000;
        queryParams.saleDateRange = params.saleDateRange ?? 12;
        queryParams.yearBuiltRange = params.yearBuiltRange ?? 20;
        queryParams.ownerOccupied = params.ownerOccupied ?? 'Both';
        queryParams.distressed = params.distressed ?? 'IncludeDistressed';
        
        console.log(`[AttomService:executeQuery] Enhanced sales comparables address params:`, JSON.stringify(queryParams));
        
        // Construct the URL with path parameters
        const path = `/property/v2/salescomparables/address/${encodeURIComponent(street)}/${encodeURIComponent(city)}/${encodeURIComponent(county)}/${encodeURIComponent(state)}/${encodeURIComponent(zip)}`;
        
        // Make direct API call
        return await fetchAttom(path, queryParams);
      } else if (queryType === 'salesComparablesPropId') {
        // Create a copy of the params that we can modify
        const queryParams: Record<string, any> = {};
        
        // Extract the propId parameter
        const propId = params.propId as string;
        
        // Add all the optional parameters with defaults
        queryParams.searchType = params.searchType ?? 'Radius';
        queryParams.minComps = params.minComps ?? 1;
        queryParams.maxComps = params.maxComps ?? 10;
        queryParams.miles = params.miles ?? 5;
        queryParams.sameCity = params.sameCity ?? true;
        queryParams.useSameTargetCode = params.useSameTargetCode ?? true;
        queryParams.bedroomsRange = params.bedroomsRange ?? 1;
        queryParams.bathroomRange = params.bathroomRange ?? 1;
        queryParams.sqFeetRange = params.sqFeetRange ?? 600;
        queryParams.lotSizeRange = params.lotSizeRange ?? 3000;
        queryParams.saleDateRange = params.saleDateRange ?? 12;
        queryParams.yearBuiltRange = params.yearBuiltRange ?? 20;
        queryParams.ownerOccupied = params.ownerOccupied ?? 'Both';
        queryParams.distressed = params.distressed ?? 'IncludeDistressed';
        
        console.log(`[AttomService:executeQuery] Enhanced sales comparables propId params:`, JSON.stringify(queryParams));
        
        // Construct the URL with the propId parameter
        const path = `/property/v2/salescomparables/propid/${encodeURIComponent(propId)}`;
        
        // Make direct API call
        return await fetchAttom(path, queryParams);
      }
    }
    
    // Standard validation and execution for other endpoints
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
  public async getAllEventsDetail(params: {
    id: string;
  }): Promise<any> {
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
  public async getPropertyBasicProfile(params: {
    address1: string;
    address2: string;
  }): Promise<any> {
    return this.executeQuery('propertyBasicProfile', params);
  }
  
  /**
   * Get property details with owner information
   * @param params Query parameters
   * @returns Property details with owner information
   */
  public async getPropertyDetailOwner(params: {
    attomid: string;
  }): Promise<any> {
    return this.executeQuery('propertyDetailOwner', params);
  }
  
  /**
   * Get property mortgage details
   * @param params Query parameters
   * @returns Property mortgage details
   */
  public async getPropertyMortgageDetails(params: {
    attomid: string;
  }): Promise<any> {
    return this.executeQuery('propertyDetailMortgage', params);
  }
  
  /**
   * Get property building permits
   * @param params Query parameters
   * @returns Property building permits
   */
  public async getPropertyBuildingPermits(params: {
    address1?: string;
    address2?: string;
    attomid?: string;
  }): Promise<any> {
    return this.executeQuery('propertyBuildingPermits', params);
  }
  
  /**
   * Get property rental AVM
   * @param params Query parameters
   * @returns Property rental AVM
   */
  public async getPropertyRentalAVM(params: {
    attomid: string;
  }): Promise<any> {
    return this.executeQuery('propertyRentalAVM', params);
  }
  
  /**
   * Get property AVM details
   * @param params Query parameters
   * @returns Property AVM details
   */
  public async getPropertyAVMDetail(params: {
    address1: string;
    address2: string;
  }): Promise<any> {
    return this.executeQuery('propertyAVMDetail', params);
  }
  
  /**
   * Get property assessment details
   * @param params Query parameters
   * @returns Property assessment details
   */
  public async getPropertyAssessmentDetail(params: {
    address1: string;
    address2: string;
  }): Promise<any> {
    return this.executeQuery('propertyAssessmentDetail', params);
  }
  
  /**
   * Get property details with mortgage and owner
   * @param params Query parameters
   * @returns Property details with mortgage and owner
   */
  public async getPropertyDetailMortgageOwner(params: {
    attomid: string;
  }): Promise<any> {
    return this.executeQuery('propertyDetailMortgageOwner', params);
  }
  
  /**
   * Get property home equity
   * @param params Query parameters
   * @returns Property home equity
   */
  public async getPropertyHomeEquity(params: {
    attomid: string;
  }): Promise<any> {
    return this.executeQuery('homeEquity', params);
  }
  
  /**
   * Get AVM snapshot for a property
   * @param params Query parameters
   * @returns AVM snapshot
   */
  public async getAvmSnapshot(params: {
    attomid: string;
  }): Promise<any> {
    return this.executeQuery('avmSnapshot', params);
  }
  
  /**
   * Get AVM history detail for a property
   * @param params Query parameters
   * @returns AVM history detail
   */
  public async getAvmHistoryDetail(params: {
    address1: string;
    address2: string;
  }): Promise<any> {
    return this.executeQuery('avmHistoryDetail', params);
  }
  
  /**
   * Get property details with schools
   * @param params Query parameters
   * @returns Property details with schools
   */
  public async getPropertyDetailsWithSchools(params: {
    attomid: string;
  }): Promise<any> {
    return this.executeQuery('propertyDetailsWithSchools', params);
  }
  
  /**
   * Get property sales history snapshot
   * @param params Query parameters
   * @returns Property sales history snapshot
   */
  public async getSalesHistorySnapshot(params: {
    attomid: string;
  }): Promise<any> {
    return this.executeQuery('salesHistorySnapshot', params);
  }
  
  /**
   * Get property basic sales history
   * @param params Query parameters
   * @returns Property basic sales history
   */
  public async getSalesHistoryBasic(params: {
    address1: string;
    address2: string;
  }): Promise<any> {
    return this.executeQuery('salesHistoryBasic', params);
  }
  
  /**
   * Get property expanded sales history
   * @param params Query parameters
   * @returns Property expanded sales history
   */
  public async getSalesHistoryExpanded(params: {
    address1: string;
    address2: string;
  }): Promise<any> {
    return this.executeQuery('salesHistoryExpanded', params);
  }
  
  /**
   * Get property detailed sales history
   * @param params Query parameters
   * @returns Property detailed sales history
   */
  public async getSalesHistoryDetail(params: {
    address1: string;
    address2: string;
  }): Promise<any> {
    return this.executeQuery('salesHistoryDetail', params);
  }
  
  /**
   * Get property sale detail
   * @param params Query parameters
   * @returns Property sale detail
   */
  public async getSaleDetail(params: {
    address1: string;
    address2: string;
  }): Promise<any> {
    return this.executeQuery('saleDetail', params);
  }
  
  /**
   * Get property sale snapshot
   * @param params Query parameters including geoIdV4, startsalesearchdate, and endsalesearchdate
   * @returns Property sale snapshot
   */
  public async getSaleSnapshot(params: {
    geoIdV4: string;
    startsalesearchdate?: string;
    endsalesearchdate?: string;
  }): Promise<any> {
    return this.executeQuery('saleSnapshot', params);
  }
  
  /**
   * Get all events snapshot
   * @param params Query parameters
   * @returns All events snapshot
   */
  public async getAllEventsSnapshot(params: {
    id: string;
  }): Promise<any> {
    return this.executeQuery('allEventsSnapshot', params);
  }
  
  /**
   * Get sales comparables by address
   * @param params Query parameters
   * @returns Sales comparables
   */
  public async getSalesComparablesAddress(params: {
    street: string;
    city: string;
    county: string;
    state: string;
    zip: string;
    searchType?: string;
    minComps?: number;
    maxComps?: number;
    miles?: number;
    sameCity?: boolean | string;
    useSameTargetCode?: boolean | string;
    useCode?: string;
    bedroomsRange?: number;
    bathroomRange?: number;
    sqFeetRange?: number;
    lotSizeRange?: number;
    onlyPropertiesWithPool?: boolean | string;
    saleDateRange?: number;
    saleAmountRangeFrom?: number;
    saleAmountRangeTo?: number;
    unitNumberRange?: number;
    yearBuiltRange?: number;
    storiesRange?: number;
    include0SalesAmounts?: boolean | string;
    includeFullSalesOnly?: boolean | string;
    ownerOccupied?: string;
    distressed?: string;
  }): Promise<any> {
    console.log('[attomService:getSalesComparablesAddress] Received params:', JSON.stringify(params));
    
    // Use specialized execution path for sales comparables address
    return this.executeSalesComparablesAddressQuery(params);
  }
  
  /**
   * Specialized method for executing sales comparables by address query
   * This bypasses standard validation and uses a direct path to the API
   */
  private async executeSalesComparablesAddressQuery(params: any): Promise<any> {
    console.log('[executeSalesComparablesAddressQuery] Executing with params:', JSON.stringify(params));
    
    const { street, city, county = '-', state, zip } = params;
    const queryParams = this.buildComparablesQueryParams(params);
    
    console.log('[executeSalesComparablesAddressQuery] Enhanced params:', JSON.stringify(queryParams));
    
    // Construct the URL with path parameters
    const path = `/property/v2/salescomparables/address/${encodeURIComponent(street)}/${encodeURIComponent(city)}/${encodeURIComponent(county)}/${encodeURIComponent(state)}/${encodeURIComponent(zip)}`;
    
    console.log('[executeSalesComparablesAddressQuery] Making API request to path:', path);
    
    try {
      const result = await fetchAttom(path, queryParams);
      console.log('[executeSalesComparablesAddressQuery] API call successful');
      return result;
    } catch (error: any) {
      const msg = error?.details?.body ?? error?.message ?? '';
      const alreadyRetried = params.__retried === true;
      if (!alreadyRetried && msg.includes('Unable to locate a property record')) {
        console.warn('[executeSalesComparablesAddressQuery] No comps found – expanding ranges and retrying');
        // Obtain livingSize via propertyBuildingPermits
        let livingSize: number | undefined;
        try {
          const basic = await this.getPropertyBuildingPermits({ attomid: params.propId });
          livingSize = basic?.property?.[0]?.building?.size?.universalsize ?? basic?.property?.[0]?.building?.area?.livingSize;
        } catch (e) {
          // Non‑critical: if size lookup fails we proceed with default.
          console.warn('[executeSalesComparablesAddressQuery] Unable to fetch livingSize, using default', (e as Error).message);
        }
        const expandedSqFt = Math.round((livingSize ?? 2000) * 0.3);
        const retryParams = {
          ...params,
          __retried: true,
          sqFeetRange: expandedSqFt,
          yearBuiltRange: 40,
        };
        return this.executeSalesComparablesAddressQuery(retryParams);
      }
      console.error('[executeSalesComparablesAddressQuery] API call failed:', error);
      throw error;
    }
  }
  
  /**
   * Get sales comparables by propId
   * @param params Query parameters
   * @returns Sales comparables
   */
  public async getSalesComparablesPropId(params: {
    propId: string;
    searchType?: string;
    minComps?: number;
    maxComps?: number;
    miles?: number;
    sameCity?: boolean | string;
    useSameTargetCode?: boolean | string;
    useCode?: string;
    bedroomsRange?: number;
    bathroomRange?: number;
    sqFeetRange?: number;
    sqFeetRangeTo?: number;
    lotSizeRange?: number;
    lotSizeRangeTo?: number;
    saleDateRange?: number;
    saleAmountRangeFrom?: number;
    saleAmountRangeTo?: number;
    unitNumberRange?: number;
    yearBuiltRange?: number;
    storiesRange?: number;
    include0SalesAmounts?: boolean | string;
    includeFullSalesOnly?: boolean | string;
    ownerOccupied?: string;
    distressed?: string;
  }): Promise<any> {
    console.log('[attomService:getSalesComparablesPropId] Received params:', JSON.stringify(params));
    
    // Use specialized execution path for sales comparables propId
    return this.executeSalesComparablesPropIdQuery(params);
  }
  
  /**
   * Specialized execution method for sales comparables by address
   * @param params Query parameters
   * @returns API response
   */
  private async executeSalesComparablesPropIdQuery(params: any): Promise<any> {
    console.log('[executeSalesComparablesPropIdQuery] Executing with params:', JSON.stringify(params));
    
    const propId = params.propId as string;
    const queryParams = this.buildComparablesQueryParams(params);
    
    console.log('[executeSalesComparablesPropIdQuery] Enhanced params:', JSON.stringify(queryParams));
    
    // Construct the URL with the propId parameter
    const path = `/property/v2/salescomparables/propid/${encodeURIComponent(propId)}`;
    
    console.log('[executeSalesComparablesPropIdQuery] Making API request to path:', path);
    
    try {
      const result = await fetchAttom(path, queryParams);
      console.log('[executeSalesComparablesPropIdQuery] API call successful');
      return result;
    } catch (error: any) {
      const msg = error?.details?.body ?? error?.message ?? '';
      const alreadyRetried = params.__retried === true;
      if (!alreadyRetried && msg.includes('Unable to locate a property record')) {
        console.warn('[executeSalesComparablesPropIdQuery] No comps found – expanding ranges and retrying');
        // fetch livingSize via propertyBuildingPermits
        let livingSize: number | undefined;
        try {
          const basic = await this.getPropertyBuildingPermits({ attomid: params.propId });
          livingSize = basic?.property?.[0]?.building?.size?.universalsize ?? basic?.property?.[0]?.building?.area?.livingSize;
        } catch (e) {
          console.warn('[executeSalesComparablesPropIdQuery] Unable to fetch livingSize, using default', (e as Error).message);
        }
        const expandedSqFt = Math.round((livingSize ?? 2000) * 0.3);
        const retryParams = {
          ...params,
          __retried: true,
          sqFeetRange: expandedSqFt,
          yearBuiltRange: 40,
        };
        return this.executeSalesComparablesPropIdQuery(retryParams);
      }
      console.error('[executeSalesComparablesPropIdQuery] API call failed:', error);
      throw error;
    }
  }
  
  /**
   * Get geographic boundary
   * @param params Query parameters
   * @returns Geographic boundary
   */
  public async getGeographicBoundary(params: {
    format: string;
    geoIdV4: string;
  }): Promise<any> {
    return this.executeQuery('geographicBoundary', params);
  }
  
  /**
   * Get school profile
   * @param params Query parameters
   * @returns School profile
   */
  public async getSchoolProfile(params: {
    geoIdV4: string;
  }): Promise<any> {
    return this.executeQuery('schoolProfile', params);
  }
  
  /**
   * Get school district
   * @param params Query parameters
   * @returns School district
   */
  public async getSchoolDistrict(params: {
    geoIdV4: string;
  }): Promise<any> {
    return this.executeQuery('schoolDistrict', params);
  }
  
  /**
   * Get transportation noise
   * @param params Query parameters
   * @returns Transportation noise
   */
  public async getTransportationNoise(params: {
    address: string;
  }): Promise<any> {
    return this.executeQuery('transportationNoise', params);
  }
  
  /**
   * Get property sales history
   * @param params Query parameters
   * @returns Property sales history
   */
  public async getPropertySalesHistory(params: {
    address1: string;
    address2: string;
  }): Promise<any> {
    return this.executeQuery('salesHistoryDetail', params);
  }
  
  /**
   * Get community profile
   * @param params Query parameters
   * @returns Community profile
   */
  public async getCommunityProfile(params: {
    geoIdV4: string;
  }): Promise<any> {
    return this.executeQuery('communityProfile', params);
  }
  
  /**
   * Search for schools
   * @param params Query parameters
   * @returns School search results
   */
  public async searchSchools(params: {
    geoIdV4: string;
    radius?: number;
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    return this.executeQuery('schoolSearch', params);
  }
  
  /**
   * Search for points of interest
   * @param params Query parameters
   * @returns POI search results
   */
  public async searchPOI(params: {
    address: string;
    radius?: number;
    categoryName?: string;
    zipcode?: string;
    point?: string;
  }): Promise<any> {
    // Import the fetcher directly to use the correct path
    const { fetchAttom } = await import('../utils/fetcher.js');
    return fetchAttom('/v4/neighborhood/poi', params);
  }
  
  /**
   * Get all available endpoints by category
   * @param category Endpoint category
   * @returns Array of endpoint keys
   */
  public getEndpointsByCategory(category: EndpointCategory): string[] {
    const endpoints = getEndpointsByCategory(category);
    return endpoints.map(endpoint => endpoint.path);
  }
  
  /**
   * Check if a specific data field is available in AllEvents response
   * @param allEventsData AllEvents response data
   * @param field Field to check
   * @returns True if field is available
   */
  public isFieldAvailableInAllEvents(allEventsData: any, field: AllEventsDataField): boolean {
    if (!allEventsData?.property || !Array.isArray(allEventsData.property) || allEventsData.property.length === 0) {
      return false;
    }
    
    const property = allEventsData.property[0];
    return !!property[field];
  }
  
  /**
   * Build comparables query parameters applying defaults and filtering undefined.
   */
  private buildComparablesQueryParams(params: Record<string, any>): Record<string, any> {
    const defaults = {
      searchType: 'Radius',
      minComps: 1,
      maxComps: 10,
      miles: 5,
      sameCity: true,
      useSameTargetCode: true,
      bedroomsRange: 1,
      bathroomRange: 1,
      sqFeetRange: 600,
      lotSizeRange: 3000,
      saleDateRange: 12,
      yearBuiltRange: 20,
      ownerOccupied: 'Both',
      distressed: 'IncludeDistressed',
    };
    
    const queryParams: Record<string, any> = { ...defaults, ...params };
    
    // Remove non‑API params
    delete queryParams.street;
    delete queryParams.city;
    delete queryParams.county;
    delete queryParams.state;
    delete queryParams.zip;
    delete queryParams.propId;
    delete queryParams.__retried;
    
    // Strip undefined to avoid sending "undefined"
    Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);
    return queryParams;
  }
}
