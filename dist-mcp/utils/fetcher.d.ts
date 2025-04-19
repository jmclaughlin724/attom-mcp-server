export declare function fetchAttom(path: string, query?: Record<string, any>, overrides?: {
    method?: string;
    headers?: Record<string, string>;
    retries?: number;
}): Promise<Record<string, any>>;
