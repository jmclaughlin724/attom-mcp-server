// src/attomApiFramework.ts

import { fetchAttom } from './utils/fetcher.js';
import { fallbackAttomIdFromAddressCached, fallbackGeoIdV4SubtypeCached } from './utils/fallback.js';
import { preloadAddressMetadata } from './utils/caching.js';

export class AttomApiFramework {
  constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
  }

  public async prefetchAddressData(address1: string, address2: string) {
    const cacheKey = `${address1}|${address2}`;
    await preloadAddressMetadata(address1, address2, cacheKey);
  }

  public property = {
    // basicprofile
    basicprofile: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      else if (params.address1 && params.address2) {
        query.address1 = params.address1;
        query.address2 = params.address2;
      }
      return fetchAttom('/propertyapi/v1.0.0/property/basicprofile', query);
    },

    // buildingpermits
    buildingpermits: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      else if (params.address1 && params.address2) {
        query.address1 = params.address1;
        query.address2 = params.address2;
      }
      return fetchAttom('/propertyapi/v1.0.0/property/buildingpermits', query);
    },

    // detailowner
    detailowner: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      else if (params.address1 && params.address2) {
        query.address1 = params.address1;
        query.address2 = params.address2;
      }
      return fetchAttom('/propertyapi/v1.0.0/property/detailowner', query);
    },

    // detailmortgage
    detailmortgage: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      else if (params.address1 && params.address2) {
        query.address1 = params.address1;
        query.address2 = params.address2;
      }
      return fetchAttom('/propertyapi/v1.0.0/property/detailmortgage', query);
    },

    // detailmortgageowner
    detailmortgageowner: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      else if (params.address1 && params.address2) {
        query.address1 = params.address1;
        query.address2 = params.address2;
      }
      return fetchAttom('/propertyapi/v1.0.0/property/detailmortgageowner', query);
    },

    // attomavmDetail => /attomavm/detail
    attomavmDetail: async (params: { address1: string; address2: string }) => {
      const query: Record<string, string> = {
        address1: params.address1,
        address2: params.address2
      };
      return fetchAttom('/propertyapi/v1.0.0/attomavm/detail', query);
    },

    // homeequity => /valuation/homeequity
    homeequity: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      return fetchAttom('/propertyapi/v1.0.0/valuation/homeequity', query);
    },

    // rentalavm => /valuation/rentalavm
    rentalavm: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      return fetchAttom('/propertyapi/v1.0.0/valuation/rentalavm', query);
    },

    // avmSnapshot => /avm/snapshot
    avmSnapshot: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      return fetchAttom('/propertyapi/v1.0.0/avm/snapshot', query);
    },

    // avmHistoryDetail => /avmhistory/detail
    avmHistoryDetail: async (params: { address1: string; address2: string }) => {
      const query: Record<string, string> = {
        address1: params.address1,
        address2: params.address2
      };
      return fetchAttom('/propertyapi/v1.0.0/avmhistory/detail', query);
    },

    // assessment => detail, snapshot
    assessment: {
      detail: async (params: { address1?: string; address2?: string; attomid?: string }) => {
        const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
        if (!params.attomid && params.address1 && params.address2) {
          params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
        }
        const query: Record<string, string> = {};
        if (params.attomid) query.attomid = params.attomid;
        else if (params.address1 && params.address2) {
          query.address1 = params.address1;
          query.address2 = params.address2;
        }
        return fetchAttom('/propertyapi/v1.0.0/assessment/detail', query);
      },
      snapshot: async (params: { address1?: string; address2?: string; attomid?: string }) => {
        const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
        if (!params.attomid && params.address1 && params.address2) {
          params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
        }
        const query: Record<string, string> = {};
        if (params.attomid) query.attomid = params.attomid;
        else if (params.address1 && params.address2) {
          query.address1 = params.address1;
          query.address2 = params.address2;
        }
        return fetchAttom('/propertyapi/v1.0.0/assessment/snapshot', query);
      }
    },

    // assessmenthistory => detail
    assessmenthistory: {
      detail: async (params: { address1?: string; address2?: string; attomid?: string }) => {
        const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
        if (!params.attomid && params.address1 && params.address2) {
          params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
        }
        const query: Record<string, string> = {};
        if (params.attomid) query.attomid = params.attomid;
        else if (params.address1 && params.address2) {
          query.address1 = params.address1;
          query.address2 = params.address2;
        }
        return fetchAttom('/propertyapi/v1.0.0/assessmenthistory/detail', query);
      }
    },

    // saleshistory => detail, snapshot
    saleshistory: {
      detail: async (params: { address1?: string; address2?: string; attomid?: string }) => {
        const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
        if (!params.attomid && params.address1 && params.address2) {
          params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
        }
        const query: Record<string, string> = {};
        if (params.attomid) query.attomid = params.attomid;
        else if (params.address1 && params.address2) {
          query.address1 = params.address1;
          query.address2 = params.address2;
        }
        return fetchAttom('/propertyapi/v1.0.0/saleshistory/detail', query);
      },
      snapshot: async (params: { 
        geoIdV4?: string; 
        address1?: string; 
        address2?: string; 
        startsalesearchdate: string; 
        endsalesearchdate: string 
      }) => {
        const query: Record<string, string> = {
          startsalesearchdate: params.startsalesearchdate,
          endsalesearchdate: params.endsalesearchdate
        };
        
        if (params.geoIdV4) {
          query.geoIdV4 = params.geoIdV4;
        } else if (params.address1 && params.address2) {
          const cacheKey = `${params.address1}|${params.address2}`;
          const geoIdV4 = await fallbackGeoIdV4SubtypeCached(
            params.address1, 
            params.address2, 
            'N2', 
            cacheKey
          );
          if (geoIdV4) query.geoIdV4 = geoIdV4;
        }
        
        return fetchAttom('/propertyapi/v1.0.0/saleshistory/snapshot', query);
      }
    },

    // allevents => detail, snapshot
    allevents: {
      detail: async (params: { id?: string; address1?: string; address2?: string }) => {
        if (!params.id && params.address1 && params.address2) {
          const cacheKey = `${params.address1}|${params.address2}`;
          const attomId = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
          params.id = attomId;
        }
        const query: Record<string, string> = {};
        if (params.id) query.id = params.id;
        return fetchAttom('/propertyapi/v1.0.0/allevents/detail', query);
      },
      snapshot: async (params: { id?: string; address1?: string; address2?: string }) => {
        if (!params.id && params.address1 && params.address2) {
          const cacheKey = `${params.address1}|${params.address2}`;
          const attomId = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
          params.id = attomId;
        }
        const query: Record<string, string> = {};
        if (params.id) query.id = params.id;
        return fetchAttom('/propertyapi/v1.0.0/allevents/snapshot', query);
      }
    },

    // salescomparables => address, propid
    salescomparables: {
      address: async (params: {
        street: string;
        city: string;
        county: string;
        state: string;
        zip: string;
        [key: string]: any;
      }) => {
        const { street, city, county, state, zip, ...rest } = params;
        const encStreet = encodeURIComponent(street);
        const encCity = encodeURIComponent(city);
        const encCounty = encodeURIComponent(county);
        const encState = encodeURIComponent(state);
        const encZip = encodeURIComponent(zip);
        const path = `/property/v2/salescomparables/address/${encStreet}/${encCity}/${encCounty}/${encState}/${encZip}`;
        return fetchAttom(path, rest);
      },
      propid: async (params: {
        propId?: string;
        address1?: string;
        address2?: string;
        [key: string]: any;
      }) => {
        if (!params.propId && params.address1 && params.address2) {
          const cacheKey = `${params.address1}|${params.address2}`;
          const attomId = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
          params.propId = attomId;
        }
        if (!params.propId) {
          throw new Error('Need propId or fallback from address => attomId');
        }
        const encoded = encodeURIComponent(params.propId);
        const { propId, address1, address2, ...rest } = params;
        const path = `/property/v2/salescomparables/propid/${encoded}`;
        return fetchAttom(path, rest);
      },
    },
  };

  public assessment = {
    detail: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      else if (params.address1 && params.address2) {
        query.address1 = params.address1;
        query.address2 = params.address2;
      }
      return fetchAttom('/propertyapi/v1.0.0/assessment/detail', query);
    },
    snapshot: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      else if (params.address1 && params.address2) {
        query.address1 = params.address1;
        query.address2 = params.address2;
      }
      return fetchAttom('/propertyapi/v1.0.0/assessment/snapshot', query);
    }
  };

  public assessmenthistory = {
    detail: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      else if (params.address1 && params.address2) {
        query.address1 = params.address1;
        query.address2 = params.address2;
      }
      return fetchAttom('/propertyapi/v1.0.0/assessmenthistory/detail', query);
    }
  };

  public saleshistory = {
    detail: async (params: { address1?: string; address2?: string; attomid?: string }) => {
      const cacheKey = `${params.address1 ?? ''}|${params.address2 ?? ''}`;
      if (!params.attomid && params.address1 && params.address2) {
        params.attomid = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
      }
      const query: Record<string, string> = {};
      if (params.attomid) query.attomid = params.attomid;
      else if (params.address1 && params.address2) {
        query.address1 = params.address1;
        query.address2 = params.address2;
      }
      return fetchAttom('/propertyapi/v1.0.0/saleshistory/detail', query);
    },
    snapshot: async (params: { 
      geoIdV4?: string; 
      address1?: string; 
      address2?: string; 
      startsalesearchdate: string; 
      endsalesearchdate: string 
    }) => {
      const query: Record<string, string> = {
        startsalesearchdate: params.startsalesearchdate,
        endsalesearchdate: params.endsalesearchdate
      };
      
      if (params.geoIdV4) {
        query.geoIdV4 = params.geoIdV4;
      } else if (params.address1 && params.address2) {
        const cacheKey = `${params.address1}|${params.address2}`;
        const geoIdV4 = await fallbackGeoIdV4SubtypeCached(
          params.address1, 
          params.address2, 
          'N2', 
          cacheKey
        );
        if (geoIdV4) query.geoIdV4 = geoIdV4;
      }
      
      return fetchAttom('/propertyapi/v1.0.0/saleshistory/snapshot', query);
    }
  };

  public allevents = {
    detail: async (params: { id?: string; address1?: string; address2?: string }) => {
      if (!params.id && params.address1 && params.address2) {
        const cacheKey = `${params.address1}|${params.address2}`;
        const attomId = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
        params.id = attomId;
      }
      const query: Record<string, string> = {};
      if (params.id) query.id = params.id;
      return fetchAttom('/propertyapi/v1.0.0/allevents/detail', query);
    },
    snapshot: async (params: { id?: string; address1?: string; address2?: string }) => {
      if (!params.id && params.address1 && params.address2) {
        const cacheKey = `${params.address1}|${params.address2}`;
        const attomId = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
        params.id = attomId;
      }
      const query: Record<string, string> = {};
      if (params.id) query.id = params.id;
      return fetchAttom('/propertyapi/v1.0.0/allevents/snapshot', query);
    }
  };

  public salescomparables = {
    address: async (params: {
      street: string;
      city: string;
      county: string;
      state: string;
      zip: string;
      [key: string]: any;
    }) => {
      const { street, city, county, state, zip, ...rest } = params;
      const encStreet = encodeURIComponent(street);
      const encCity = encodeURIComponent(city);
      const encCounty = encodeURIComponent(county);
      const encState = encodeURIComponent(state);
      const encZip = encodeURIComponent(zip);
      const path = `/property/v2/salescomparables/address/${encStreet}/${encCity}/${encCounty}/${encState}/${encZip}`;
      return fetchAttom(path, rest);
    },
    propid: async (params: {
      propId?: string;
      address1?: string;
      address2?: string;
      [key: string]: any;
    }) => {
      if (!params.propId && params.address1 && params.address2) {
        const cacheKey = `${params.address1}|${params.address2}`;
        const attomId = await fallbackAttomIdFromAddressCached(params.address1, params.address2, cacheKey);
        params.propId = attomId;
      }
      if (!params.propId) {
        throw new Error('Need propId or fallback from address => attomId');
      }
      const encoded = encodeURIComponent(params.propId);
      const { propId, address1, address2, ...rest } = params;
      const path = `/property/v2/salescomparables/propid/${encoded}`;
      return fetchAttom(path, rest);
    },
  };

  // area
  public area = {
    boundaryDetail: async (params: { geoIdV4?: string; address1?: string; address2?: string; format?: string }) => {
      return fetchAttom('/v4/area/boundary/detail', params);
    },
    // More e.g. area/hierarchy/lookup, area/cbsa/lookup, area/county/lookup, area/state/lookup ...
  };

  // poi
  public poi = {
    search: async (params: {
      address?: string;
      zipcode?: string;
      point?: string;
      radius?: number;
      categoryName?: string;
      recordLimit?: number;
    }) => {
      return fetchAttom('/v4/neighborhood/poi', params);
    },
  };

  // community
  public community = {
    profile: async (params: { geoIdV4?: string; address1?: string; address2?: string }) => {
      return fetchAttom('/v4/neighborhood/community', params);
    },
  };

  // school
  public school = {
    profile: async (params: { geoIdV4?: string; address1?: string; address2?: string }) => {
      return fetchAttom('/v4/school/profile', params);
    },
    district: async (params: { geoIdV4?: string; address1?: string; address2?: string }) => {
      return fetchAttom('/v4/school/district', params);
    },
    search: async (params: {
      geoIdV4?: string;
      address1?: string;
      address2?: string;
      radius?: number;
      page?: number;
      pageSize?: number;
    }) => {
      return fetchAttom('/v4/school/search', params);
    },
  };
}
