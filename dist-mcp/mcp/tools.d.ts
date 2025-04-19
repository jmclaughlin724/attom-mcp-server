/**
 * MCP Tools Registration
 *
 * This file registers the ATTOM API tools with the MCP framework.
 */
interface AddressParams {
    address1: string;
    address2: string;
}
interface AttomIdParams {
    attomid: string;
}
interface AttomIdParams {
    attomid: string;
}
interface AddressParams {
    address1: string;
    address2: string;
}
interface TransportationNoiseParams {
    address: string;
}
interface GeographicBoundaryParams {
    format: string;
    geoIdV4: string;
}
interface SalesComparablesAddressParams {
    street: string;
    city: string;
    county: string;
    state: string;
    zip: string;
    searchType?: string;
    minComps?: number;
    maxComps?: number;
    miles?: number;
}
interface SalesComparablesPropIdParams {
    propId: string;
    searchType?: string;
    minComps?: number;
    maxComps?: number;
    miles?: number;
}
interface CommunityParams {
    geoIdV4: string;
}
interface SchoolSearchParams {
    geoIdV4: string;
    radius?: number | string;
    page?: number;
    pageSize?: number;
}
interface POIParams {
    address: string;
    radius?: string | number;
    categoryName?: string;
    recordLimit?: number;
}
interface AllEventsParams {
    id: string;
}
interface ExecuteQueryParams {
    endpointKey: string;
    params: Record<string, any>;
}
export declare const mcpTools: ({
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            address1: {
                type: string;
                description: string;
            };
            address2: {
                type: string;
                description: string;
            };
            attomid?: undefined;
            geoIdV4?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required: string[];
    };
    handler: (params: AddressParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            attomid: {
                type: string;
                description: string;
            };
            address1?: undefined;
            address2?: undefined;
            geoIdV4?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required: string[];
    };
    handler: (params: AttomIdParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            address1: {
                type: string;
                description: string;
            };
            address2: {
                type: string;
                description: string;
            };
            attomid?: undefined;
            geoIdV4?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required?: undefined;
    };
    handler: (params: AddressParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        required: string[];
        properties: {
            geoIdV4: {
                type: string;
                description: string;
            };
            startsalesearchdate: {
                type: string;
                description: string;
            };
            endsalesearchdate: {
                type: string;
                description: string;
            };
            address1?: undefined;
            address2?: undefined;
            attomid?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
    };
    handler: (params: {
        geoIdV4: string;
        startsalesearchdate?: string;
        endsalesearchdate?: string;
    }) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            geoIdV4: {
                type: string;
                description: string;
            };
            address1?: undefined;
            address2?: undefined;
            attomid?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required: string[];
    };
    handler: (params: CommunityParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            geoIdV4: {
                type: string;
                description: string;
            };
            radius: {
                type: string;
                description: string;
            };
            page: {
                type: string;
                description: string;
            };
            pageSize: {
                type: string;
                description: string;
            };
            address1?: undefined;
            address2?: undefined;
            attomid?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required: string[];
    };
    handler: (params: SchoolSearchParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            address: {
                type: string;
                description: string;
            };
            radius: {
                type: string;
                description: string;
            };
            categoryName: {
                type: string;
                description: string;
            };
            recordLimit: {
                type: string;
                description: string;
            };
            address1?: undefined;
            address2?: undefined;
            attomid?: undefined;
            geoIdV4?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            page?: undefined;
            pageSize?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required: string[];
    };
    handler: (params: POIParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            id: {
                type: string;
                description: string;
            };
            address1?: undefined;
            address2?: undefined;
            attomid?: undefined;
            geoIdV4?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required: string[];
    };
    handler: (params: AllEventsParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            street: {
                type: string;
                description: string;
            };
            city: {
                type: string;
                description: string;
            };
            county: {
                type: string;
                description: string;
            };
            state: {
                type: string;
                description: string;
            };
            zip: {
                type: string;
                description: string;
            };
            searchType: {
                type: string;
                description: string;
            };
            minComps: {
                type: string;
                description: string;
            };
            maxComps: {
                type: string;
                description: string;
            };
            miles: {
                type: string;
                description: string;
            };
            address1?: undefined;
            address2?: undefined;
            attomid?: undefined;
            geoIdV4?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            propId?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required: string[];
    };
    handler: (params: SalesComparablesAddressParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            propId: {
                type: string;
                description: string;
            };
            searchType: {
                type: string;
                description: string;
            };
            minComps: {
                type: string;
                description: string;
            };
            maxComps: {
                type: string;
                description: string;
            };
            miles: {
                type: string;
                description: string;
            };
            address1?: undefined;
            address2?: undefined;
            attomid?: undefined;
            geoIdV4?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required: string[];
    };
    handler: (params: SalesComparablesPropIdParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            format: {
                type: string;
                description: string;
            };
            geoIdV4: {
                type: string;
                description: string;
            };
            address1?: undefined;
            address2?: undefined;
            attomid?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required: string[];
    };
    handler: (params: GeographicBoundaryParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            address: {
                type: string;
                description: string;
            };
            address1?: undefined;
            address2?: undefined;
            attomid?: undefined;
            geoIdV4?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            format?: undefined;
            endpointKey?: undefined;
            params?: undefined;
        };
        required: string[];
    };
    handler: (params: TransportationNoiseParams) => Promise<any>;
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            endpointKey: {
                type: string;
                description: string;
            };
            params: {
                type: string;
                description: string;
                additionalProperties: boolean;
            };
            address1?: undefined;
            address2?: undefined;
            attomid?: undefined;
            geoIdV4?: undefined;
            startsalesearchdate?: undefined;
            endsalesearchdate?: undefined;
            radius?: undefined;
            page?: undefined;
            pageSize?: undefined;
            address?: undefined;
            categoryName?: undefined;
            recordLimit?: undefined;
            id?: undefined;
            street?: undefined;
            city?: undefined;
            county?: undefined;
            state?: undefined;
            zip?: undefined;
            searchType?: undefined;
            minComps?: undefined;
            maxComps?: undefined;
            miles?: undefined;
            propId?: undefined;
            format?: undefined;
        };
        required: string[];
    };
    handler: (params: ExecuteQueryParams) => Promise<Record<string, unknown>>;
})[];
export {};
