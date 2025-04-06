import { BaseApiResponse, ErrorDetail } from '@/common/types/api.types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toast } from 'sonner';

/** Base class for API related errors */
export class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

/** Error during network request (fetch failed) or response parsing */
export class NetworkError extends FetchError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/** Error indicating a non-2xx HTTP status or API status: 'error' */
export class ApiError extends FetchError {
  public status: number;
  public errors: ErrorDetail[] | null;

  public responseJson: BaseApiResponse<unknown> | null;

  constructor(
    message: string,
    status: number,

    responseJson: BaseApiResponse<unknown> | null = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.responseJson = responseJson;

    this.errors = responseJson?.errors ?? null;
  }
}

/** Specific API error for 401 Unauthorized */
export class UnauthorizedError extends ApiError {
  constructor(
    message: string = 'Unauthorized',

    responseJson: BaseApiResponse<unknown> | null = null
  ) {
    super(message, 401, responseJson);
    this.name = 'UnauthorizedError';
  }
}

/** Safely extracts an error message from the API response */
function getErrorMessage(
  json: BaseApiResponse<unknown> | null,
  defaultMessage: string
): string {
  return json?.errors?.[0]?.message || json?.message || defaultMessage;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<BaseApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    const configErrorMsg = 'API configuration error: Base URL is not set.';
    toast.error(configErrorMsg);
    throw new Error(configErrorMsg);
  }

  let requestUrl: URL;
  try {
    requestUrl = new URL(path, baseUrl);
  } catch {
    const invalidUrlMsg = `Invalid URL constructed: ${path}`;
    toast.error(invalidUrlMsg);
    throw new Error(invalidUrlMsg);
  }

  const token = useAuthStore.getState().accessToken;

  const headers = new Headers(options.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const isFormData = options.body instanceof FormData;
  const method = options.method?.toUpperCase() ?? 'GET';
  const methodsNeedingContentType = ['POST', 'PUT', 'PATCH'];

  if (
    !isFormData &&
    options.body != null &&
    methodsNeedingContentType.includes(method) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const finalOptions: RequestInit = { ...options, headers };
  let response: Response;

  try {
    response = await fetch(requestUrl.toString(), finalOptions);
  } catch (error) {
    const networkMsg = `Network error: ${error instanceof Error ? error.message : 'Request failed'}`;
    console.error(`apiFetch Network Error for ${requestUrl.pathname}:`, error);
    toast.error(networkMsg);
    throw new NetworkError(networkMsg);
  }

  let json: BaseApiResponse<T> | null = null;
  const responseContentType = response.headers.get('content-type');

  if (
    response.status !== 204 &&
    responseContentType?.includes('application/json')
  ) {
    try {
      json = await response.json();
    } catch (error) {
      const parseMsg = `API Error: Failed to parse JSON response from ${requestUrl.pathname}`;
      console.error('apiFetch JSON Parsing Error:', error);
      toast.error(parseMsg);

      throw new NetworkError(parseMsg);
    }
  }

  if (!response.ok) {
    const defaultHttpErrorMsg = `API Error: Request failed (${response.status}) for ${requestUrl.pathname}`;
    const errMsg = getErrorMessage(json, defaultHttpErrorMsg);
    console.error(`apiFetch HTTP Error ${response.status}:`, errMsg, json);
    toast.error(errMsg);

    if (response.status === 401) {
      throw new UnauthorizedError(errMsg, json);
    } else {
      throw new ApiError(errMsg, response.status, json);
    }
  }

  if (json && json.status === 'error') {
    const defaultApiErrorMsg = `API Error: Operation failed for ${requestUrl.pathname}`;
    const errMsg = getErrorMessage(json, defaultApiErrorMsg);
    console.error('apiFetch API Error:', errMsg, json);
    toast.error(errMsg);

    throw new ApiError(errMsg, response.status, json);
  }

  if (json === null && response.ok) {
    return {
      status: 'success',
      data: null,
      errors: null,
    } as BaseApiResponse<T>;
  }

  return json as BaseApiResponse<T>;
}
