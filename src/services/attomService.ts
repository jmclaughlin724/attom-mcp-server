/**
 * ATTOM API Service
 * 
 * This service provides a high-level interface to the ATTOM API,
 * leveraging the endpoint configuration and query manager.
 */

import { executeQuery, isValidQuery } from './queryManager.js';
import { EndpointCategory, getEndpointsByCategory, AllEventsDataField, endpoints } from '../config/endpointConfig.js';

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
  }): Promise<any> {
    return this.executeQuery('salesComparablesAddress', params);
  }
  
  /**
   * Get sales comparables by property ID
   * @param params Query parameters
   * @returns Sales comparables
   */
  public async getSalesComparablesPropId(params: {
    propId: string;
    searchType?: string;
    minComps?: number;
    maxComps?: number;
    miles?: number;
  }): Promise<any> {
    return this.executeQuery('salesComparablesPropId', params);
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
    recordLimit?: number;
  }): Promise<any> {
    return this.executeQuery('poiSearch', params);
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
}
