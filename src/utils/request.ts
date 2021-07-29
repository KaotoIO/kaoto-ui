const apiURL = process.env.REACT_APP_API_URL;
export type FetchMethod = 'GET' | 'PATCH' | 'PUT' | 'POST' | 'DELETE';

export interface IFetchHeaders {
  [s: string]: string;
}

export interface IFetch {
  endpoint: string;
  method: FetchMethod;
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

  return fetch(`${apiURL}${endpoint}`, {
    method,
    body: data,
    cache: 'no-cache',
    credentials: 'include',
    //credentials: 'same-origin',
    headers: {
      'Accept': accept ?? 'application/json,text/plain,text/yaml,*/*',
      'Content-Type': contentType ?? 'application/json',
      ...headers,
    },
    mode: 'no-cors',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  });
};

export default {
  get: (options) => api({method: 'GET', ...options}),
  post: (options) => api({method: 'POST', ...options}),
  put: (options) => api({method: 'PUT', ...options}),
  patch: (options) => api({method: 'PATCH', ...options}),
  delete: (options) => api({method: 'DELETE', ...options}),
};
