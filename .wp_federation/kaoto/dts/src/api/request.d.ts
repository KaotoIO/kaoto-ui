export declare type FetchMethod = 'GET' | 'PATCH' | 'PUT' | 'POST' | 'DELETE';
export interface IFetchHeaders {
    [s: string]: string;
}
export interface IFetch {
    endpoint: string;
    method?: FetchMethod;
    headers?: IFetchHeaders;
    body?: any;
    /**
     * Default: 'application/json'
     */
    accept?: string;
    cache?: RequestCache | undefined;
    /**
     * Default: 'application/json'
     */
    contentType?: string;
    queryParams?: {
        [name: string]: string | undefined | null | number | boolean;
    };
    /**
     * Whether to stringify the data to JSON, overrides the content type
     */
    stringifyBody?: boolean;
}
declare const _default: {
    get: (options: IFetch) => Promise<Response>;
    post: (options: IFetch) => Promise<Response>;
    put: (options: IFetch) => Promise<Response>;
    delete: (options: IFetch) => Promise<Response>;
};
export default _default;
