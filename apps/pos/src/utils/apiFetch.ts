import { ApiResponse } from '@/common/types/api.types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toast } from 'sonner';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  // 1) Get token from Zustand store
  const token = useAuthStore.getState().accessToken;

  // 2) Build full URL from ENV
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const url = baseUrl + path;

  // 3) Merge default & custom headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  // 4) Attach token if present
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  // 5) Perform the fetch
  const finalOptions: RequestInit = { ...options, headers };
  const response = await fetch(url, finalOptions);

  // 6) Parse JSON
  let json: ApiResponse<T>;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    // Show toast if JSON parse fails
    toast.error(`Network/Parsing Error: Failed to parse JSON from ${url}`);
    throw new Error(`Failed to parse JSON from ${url}`);
  }

  // 7) Check response status
  if (!response.ok) {
    // If 401, token might be invalid or expired -> logout
    if (response.status === 401) {
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
    }

    // Show a toast for any error
    const errMsg =
      json.error?.message || json.message || `Request failed: ${url}`;
    toast.error(`Error: ${errMsg}`);

    throw new Error(errMsg);
  }

  if (json.status === 'error') {
    // Show a toast for any error
    const errMsg =
      json.error?.message || json.message || `Request failed: ${url}`;
    toast.error(`Error: ${errMsg}`);

    throw new Error(errMsg);
  }

  // 8) If all good, return the typed ApiResponse<T>
  return json;
}
