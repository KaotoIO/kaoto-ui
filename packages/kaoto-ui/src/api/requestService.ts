export type FetchMethod = 'GET' | 'PATCH' | 'PUT' | 'POST' | 'DELETE';

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

  cache?: RequestCache;

  /**
   * Default: 'application/json'
   */
  contentType?: string;

  // Object of key/value string for passing query parameters
  queryParams?: {
    [name: string]: string | undefined | null | number | boolean;
  };

  /**
   * Whether to stringify the data to JSON, overrides the content type
   */
  stringifyBody?: boolean;
}

export class RequestService {
  private static apiURL = KAOTO_API;

  static getApiURL(): string | undefined {
    return this.apiURL;
  }

  static setApiURL(apiUrl: string): void {
    this.apiURL = apiUrl;
  }

  static async get(options: IFetch) {
    return this.request({ method: 'GET', ...options });
  }

  static async post(options: IFetch) {
    return this.request({ method: 'POST', ...options });
  }

  static async patch(options: IFetch) {
    return this.request({ method: 'PATCH', ...options });
  }

  static async delete(options: IFetch) {
    return this.request({ method: 'DELETE', ...options });
  }

  private static async request({
    endpoint,
    method,
    headers = {},
    body,
    cache,
    contentType,
    accept,
    queryParams,
    stringifyBody = true,
  }: IFetch): Promise<Response> {
    headers = { ...headers };

    let options: RequestInit = {
      method,
      body:
        contentType?.includes('application/json') && stringifyBody ? JSON.stringify(body) : body,
      cache: cache ?? 'default',
      /**
       * TODO: Omit for now, reassess for prod
       */
      credentials: 'omit',
      headers: {
        Accept: accept ?? 'application/json,text/plain,text/yaml,*/*',
        'Content-Type': contentType ?? 'application/json',
        ...headers,
      },
      mode: 'cors',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    };

    // if params exists and method is GET, add query string to url
    // otherwise, add query params as a "body" property to the options object
    if (queryParams && method === 'GET') {
      endpoint += '?' + this.objectToQueryString(queryParams);
    }

    return fetch(`${this.apiURL}${endpoint}`, options);
  }

  // converts an object into a query string
  // ex: {type : 'Kamelet'} -> &type=Kamelet
  private static objectToQueryString(obj: {
    [x: string]: string | undefined | null | number | boolean;
  }) {
    return Object.keys(obj)
      .map((key) => key + '=' + obj[key])
      .join('&');
  }
}
