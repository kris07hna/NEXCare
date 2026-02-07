/**
 * API Client Utility
 * Centralized API calls with error handling, retry logic, and toast notifications
 */

import { toast } from 'sonner';

export interface ApiOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch wrapper with retry logic and error handling
 */
export async function apiCall<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `Request failed with status ${response.status}`;

        throw new ApiError(errorMessage, response.status, errorData.details);
      }

      const data = await response.json();

      // Show success toast if requested
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      return data as T;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        break;
      }

      // If not the last attempt, wait before retrying
      if (attempt < retries) {
        await sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        console.log(`[API] Retrying ${url} (attempt ${attempt + 2}/${retries + 1})...`);
      }
    }
  }

  // All retries failed
  if (showErrorToast && lastError) {
    if (lastError instanceof ApiError) {
      toast.error(`Error: ${lastError.message}`);
    } else {
      toast.error('Network error. Please check your connection.');
    }
  }

  throw lastError || new Error('Request failed');
}

/**
 * GET request helper
 */
export async function get<T = any>(url: string, options?: ApiOptions): Promise<T> {
  return apiCall<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function post<T = any>(url: string, data?: any, options?: ApiOptions): Promise<T> {
  return apiCall<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function put<T = any>(url: string, data?: any, options?: ApiOptions): Promise<T> {
  return apiCall<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH request helper
 */
export async function patch<T = any>(url: string, data?: any, options?: ApiOptions): Promise<T> {
  return apiCall<T>(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function del<T = any>(url: string, options?: ApiOptions): Promise<T> {
  return apiCall<T>(url, { ...options, method: 'DELETE' });
}

/**
 * Batch API calls with error handling
 */
export async function batchCall<T = any>(
  calls: Array<() => Promise<T>>
): Promise<Array<T | Error>> {
  const results = await Promise.allSettled(calls.map((call) => call()));

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error('[API Batch] Call failed:', result.reason);
      return result.reason;
    }
  });
}
