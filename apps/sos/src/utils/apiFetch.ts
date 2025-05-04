import qs from 'qs';

import type {
  ErrorDetail,
  StandardApiResponse,
} from '@/common/types/api.types';

import { toast } from 'sonner';

export class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchError';
  }
}
export class NetworkError extends FetchError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
export class ApiError extends FetchError {
  public status: number;
  public errors: ErrorDetail[] | null;
  public responseJson: StandardApiResponse<unknown> | null;

  constructor(
    message: string,
    status: number,
    responseJson: StandardApiResponse<unknown> | null = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.responseJson = responseJson;
    this.errors = responseJson?.errors ?? null;
  }
}
export class UnauthorizedError extends ApiError {
  constructor(
    message: string = 'Unauthorized',
    responseJson: StandardApiResponse<unknown> | null = null
  ) {
    super(message, 401, responseJson);
    this.name = 'UnauthorizedError';
  }
}

function getErrorMessage(
  json: StandardApiResponse<unknown> | null,
  defaultMessage: string
): string {
  const apiMessage = typeof json?.message === 'string' ? json.message : null;
  return json?.errors?.[0]?.message || apiMessage || defaultMessage;
}

type ApiPath =
  | string
  | {
      path: string;
      query?: Record<string, unknown>;
    };

export async function apiFetch<T>(
  pathInput: ApiPath,
  options: RequestInit = {}
): Promise<StandardApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    const configErrorMsg = 'API configuration error: Base URL is not set.';
    console.error(configErrorMsg);

    throw new Error(configErrorMsg);
  }

  let fullPath: string;
  try {
    if (typeof pathInput === 'string') {
      fullPath = pathInput;
    } else if (typeof pathInput === 'object' && pathInput.path) {
      const { path, query } = pathInput;

      if (query && Object.keys(query).length > 0) {
        const queryString = qs.stringify(query, {
          addQueryPrefix: true,
          arrayFormat: 'brackets',
          encodeValuesOnly: true,
          skipNulls: true,
          allowDots: true,
        });
        fullPath = path + queryString;
      } else {
        fullPath = path;
      }
    } else {
      throw new Error('Invalid path input provided.');
    }
  } catch (error) {
    const pathErrorMsg = `Failed to process path/query: ${error instanceof Error ? error.message : 'Unknown error'}`;

    throw new Error(pathErrorMsg);
  }

  let requestUrl: URL;
  try {
    requestUrl = new URL(fullPath, baseUrl);
  } catch {
    const invalidUrlMsg = `Invalid URL: ${fullPath} (relative to ${baseUrl})`;

    throw new Error(invalidUrlMsg);
  }

  const headers = new Headers(options.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  const isFormData = options.body instanceof FormData;
  const method = options.method?.toUpperCase() ?? 'GET';
  if (
    !isFormData &&
    options.body != null &&
    ['POST', 'PUT', 'PATCH'].includes(method) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const finalOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };
  let response: Response;
  try {
    response = await fetch(requestUrl.toString(), finalOptions);
  } catch (error) {
    const networkMsg = `Network error: ${error instanceof Error ? error.message : 'Request failed'}`;

    throw new NetworkError(networkMsg);
  }

  let json: StandardApiResponse<T> | null = null;
  const responseContentType = response.headers.get('content-type');
  const canParseJson =
    response.status !== 204 &&
    responseContentType?.includes('application/json');

  if (canParseJson) {
    try {
      json = await response.json();
    } catch (error) {
      const parseMsg = `API Error: Failed to parse JSON response from ${requestUrl.pathname}`;
      console.error('apiFetch JSON Parsing Error:', error);

      throw new NetworkError(parseMsg);
    }
  }

  if (!response.ok || (json && json.status === 'error')) {
    const status = response.status;
    const defaultMessage =
      json?.status === 'error'
        ? `API Error: Operation failed for ${requestUrl.pathname}`
        : `API Error: Request failed (${status}) for ${requestUrl.pathname}`;
    const errMsg = getErrorMessage(json, defaultMessage);

    toast.error(errMsg, {
      description: `Status: ${status} - ${requestUrl.pathname}`,
    });

    if (status === 401) {
      throw new UnauthorizedError(errMsg, json);
    } else if (status === 403) {
      throw new ApiError(errMsg, status, json);
    } else {
      throw new ApiError(errMsg, status, json);
    }
  }

  if (response.ok && json === null && response.status !== 204) {
    const nullErrorMsg = `API Error: Received successful status ${response.status} but invalid/null JSON body from ${requestUrl.pathname}`;
    throw new ApiError(nullErrorMsg, response.status, null);
  }

  return json as StandardApiResponse<T>;
}
