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

  /**
   * Default: 'application/json'
   */
  contentType?: string;

  /**
   * Whether or not to stringify the data to JSON, overrides the content type
   */
  stringifyBody?: boolean;
}

const apiURL = process.env.REACT_APP_API_URL;

const api = ({
               endpoint,
               method,
               headers = {},
               body,
               contentType,
               accept,
               stringifyBody = true,
             }: IFetch) => {
  const data = contentType?.includes('application/json') && stringifyBody ? JSON.stringify(body) : body;

  headers = { ...headers };

  console.log('apiURL: ' + apiURL);
  console.log('apiURL: ' + JSON.stringify(apiURL));

  return fetch(`${apiURL}${endpoint}`, {
    method,
    body: data,
    cache: 'no-cache',
    /**
     * TODO: Omit for now, reassess for prod
     */
    credentials: 'omit',
    headers: {
      'Accept': accept ?? 'application/json,text/plain,text/yaml,*/*',
      'Content-Type': contentType ?? 'application/json',
      ...headers,
    },
    mode: 'cors',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  });
};

export default {
  get: (options: IFetch) => api({method: 'GET', ...options}),
  post: (options: IFetch) => api({method: 'POST', ...options}),
  put: (options: IFetch) => api({method: 'PUT', ...options}),
  patch: (options: IFetch) => api({method: 'PATCH', ...options}),
  delete: (options: IFetch) => api({method: 'DELETE', ...options}),
};
