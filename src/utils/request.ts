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

export function request({
                            endpoint,
                            method,
                            headers = {},
                            body,
                            contentType = 'application/json',
                            accept = 'application/json,text/plain,text/yaml,*/*',
                            stringifyBody = true,
                          }: IFetch) {
  const contentTypeId = 'Content-Type';
  const data = headers[contentTypeId]?.includes('application/json') && stringifyBody ? JSON.stringify(body) : body;

  headers = { ...headers };

  return fetch(`${apiURL}/${endpoint}`, {
    method,
    body: data,
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': contentType,
      ...headers,
      accept,
    },
    mode: 'cors',
    redirect: 'follow',
  });
}
