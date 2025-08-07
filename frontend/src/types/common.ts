// HTTP Error Types - Specific typing for API request errors

import type { AxiosError } from 'axios';

export interface BaseHttpError extends Error {
  name: string;
  message: string;
  stack?: string;
}

export interface NetworkError extends BaseHttpError {
  name: 'NetworkError';
  code: 'ECONNREFUSED' | 'TIMEOUT' | 'NETWORK_ERROR';
  message: string;
}

export interface HttpStatusError extends BaseHttpError {
  name: 'HttpStatusError';
  status: number;
  statusText: string;
  data?: {
    message?: string | string[];
    error?: string;
    details?: unknown;
  };
}

export interface ValidationError extends BaseHttpError {
  name: 'ValidationError';
  status: 400;
  message: string;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface AuthenticationError extends BaseHttpError {
  name: 'AuthenticationError';
  status: 401;
  message: string;
}

export interface AuthorizationError extends BaseHttpError {
  name: 'AuthorizationError';
  status: 403;
  message: string;
}

export interface NotFoundError extends BaseHttpError {
  name: 'NotFoundError';
  status: 404;
  resource: string;
}

export interface ServerError extends BaseHttpError {
  name: 'ServerError';
  status: number; // 500-599
  message: string;
  details?: unknown;
}

// Union type for all possible HTTP errors
export type HttpError =
  | NetworkError
  | HttpStatusError
  | ValidationError
  | AuthenticationError
  | AuthorizationError
  | NotFoundError
  | ServerError;

// Legacy types for backward compatibility (can be removed later)
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  data?: unknown;
}

export interface ApiErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string | string[];
      error?: string;
    };
  };
  code?: string;
  message?: string;
}

export interface FormError {
  field?: string;
  message: string;
}

// Legacy ValidationError interface (will be removed)
export interface LegacyValidationError {
  message: string[];
  error: string;
  statusCode: number;
}

// Utility type for async operation states
export interface AsyncState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Form submission states
export type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

// Common event handler types
export type FormSubmitHandler = (
  e: React.FormEvent<HTMLFormElement>,
) => void | Promise<void>;
export type InputChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
) => void;
export type ButtonClickHandler = (
  e: React.MouseEvent<HTMLButtonElement>,
) => void | Promise<void>;

// Async operation handler types
export type AsyncHandler<T = void> = (...args: unknown[]) => Promise<T>;
export type AsyncVoidHandler = () => Promise<void>;

// Type guard functions for HTTP errors
export const isHttpError = (error: unknown): error is HttpError => {
  return (
    error instanceof Error &&
    'name' in error &&
    [
      'NetworkError',
      'HttpStatusError',
      'ValidationError',
      'AuthenticationError',
      'AuthorizationError',
      'NotFoundError',
      'ServerError',
    ].includes(error.name)
  );
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return (
    error instanceof Error && (error as NetworkError).name === 'NetworkError'
  );
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as ValidationError).name === 'ValidationError'
  );
};

export const isAuthenticationError = (
  error: unknown,
): error is AuthenticationError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as AuthenticationError).name === 'AuthenticationError'
  );
};

export const isServerError = (error: unknown): error is ServerError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as ServerError).name === 'ServerError'
  );
};

// Legacy type guard for backward compatibility
export const isApiErrorResponse = (
  error: unknown,
): error is ApiErrorResponse => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

// Enhanced error message extraction with proper HTTP error handling
export const extractErrorMessage = (error: HttpError | unknown): string => {
  // Handle typed HTTP errors
  if (isHttpError(error)) {
    switch (error.name) {
      case 'NetworkError':
        return 'Unable to connect to server. Please check your connection and ensure the backend is running.';

      case 'AuthenticationError':
        return 'Invalid credentials. Please check your login information.';

      case 'AuthorizationError':
        return 'You do not have permission to perform this action.';

      case 'ValidationError':
        return error.errors.map((e) => `${e.field}: ${e.message}`).join(', ');

      case 'NotFoundError':
        return `${error.resource} not found.`;

      case 'ServerError':
        return 'Server error occurred. Please try again later.';

      case 'HttpStatusError':
        if (error.data?.message) {
          return Array.isArray(error.data.message)
            ? error.data.message.join(', ')
            : error.data.message;
        }
        return `Request failed with status ${error.status}: ${error.statusText}`;

      default:
        return 'An error occurred during the request.';
    }
  }

  // Handle legacy API error responses (for backward compatibility)
  if (isApiErrorResponse(error)) {
    if (
      error.code === 'ECONNREFUSED' ||
      error.message?.includes('Network Error')
    ) {
      return 'Unable to connect to server. Please make sure the backend is running.';
    }

    if (error.response?.status === 401) {
      return 'Invalid credentials. Please check your login information.';
    }

    if (error.response?.status === 400) {
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      return message || 'Invalid input data';
    }

    if (error.response?.data?.message) {
      return Array.isArray(error.response.data.message)
        ? error.response.data.message.join(', ')
        : error.response.data.message;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
};

// API Error type - for errors that come from HTTP requests (Axios errors)
export type ApiRequestError = AxiosError;
export type ApiResponseError = {
  errors: { field: string; message: string }[];
  message?: string;
  resource?: string;
};

// Utility function to create HTTP errors from API responses
export const createHttpError = <T>(
  axiosError: AxiosError<T | ApiResponseError>,
): HttpError => {
  const { response, code } = axiosError;

  let error: HttpError | undefined = undefined;

  // Network errors (no response)
  if (!response) {
    error = {
      name: 'NetworkError',
      message: 'Network error occurred',
      code: code === 'ECONNREFUSED' ? 'ECONNREFUSED' : 'NETWORK_ERROR',
    };

    return error;
  }

  const { status, statusText, data } = response;

  // Specific error types based on status code
  switch (status) {
    case 400:
      if (
        (data as ApiResponseError)?.errors &&
        Array.isArray((data as ApiResponseError).errors)
      ) {
        error = {
          name: 'ValidationError',
          message: 'Validation failed',
          status: 400,
          errors: (data as ApiResponseError).errors,
        };
      }
      break;

    case 401:
      error = {
        name: 'AuthenticationError',
        message: (data as ApiResponseError)?.message || 'Authentication failed',
        status: 401,
      };
      break;

    case 403:
      error = {
        name: 'AuthorizationError',
        message: (data as ApiResponseError)?.message || 'Access forbidden',
        status: 403,
      };
      break;

    case 404:
      error = {
        name: 'NotFoundError',
        message: (data as ApiResponseError)?.message || 'Resource not found',
        status: 404,
        resource: (data as ApiResponseError)?.resource || 'Resource',
      };
      break;
  }

  // Server errors (5xx)
  if (status >= 500) {
    error = {
      name: 'ServerError',
      message: (data as ApiResponseError)?.message || 'Internal server error',
      status,
      details: data,
    };
  }

  // Generic HTTP status error
  if (!error) {
    error = {
      name: 'HttpStatusError',
      message: (data as ApiResponseError)?.message || `HTTP ${status} error`,
      status,
      statusText,
      data: data as ApiResponseError,
    };
  }

  return error;
};
