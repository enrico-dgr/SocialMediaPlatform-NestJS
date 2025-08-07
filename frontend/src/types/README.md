# TypeScript Types Documentation

This directory contains shared TypeScript types and utilities used throughout the frontend application.

## Files

### `common.ts`
Contains common types and utilities for error handling, form events, and API responses.

#### Key Types

**HTTP Error Handling Types:**
- `BaseHttpError` - Base interface for all HTTP errors
- `NetworkError` - Network connection errors (ECONNREFUSED, TIMEOUT)
- `HttpStatusError` - Generic HTTP status errors
- `ValidationError` - Form/input validation errors (400)
- `AuthenticationError` - Authentication failed (401)
- `AuthorizationError` - Access forbidden (403)
- `NotFoundError` - Resource not found (404)
- `ServerError` - Server errors (5xx)
- `HttpError` - Union of all HTTP error types
- `ApiRequestError` - Raw API request error structure (from Axios)

**Event Handler Types:**
- `FormSubmitHandler` - Form submission event handler
- `InputChangeHandler` - Input/textarea change event handler
- `ButtonClickHandler` - Button click event handler
- `AsyncHandler<T>` - Generic async operation handler
- `AsyncVoidHandler` - Async operation with no return value

**State Management Types:**
- `AsyncState<T>` - Standard async operation state (data, loading, error)
- `ApiResponse<T>` - Generic API response wrapper
- `SubmissionState` - Form submission state enum

#### Utility Functions

**HTTP Error Type Guards:**
- `isHttpError(error)` - Type guard for any HTTP error
- `isNetworkError(error)` - Type guard for network errors
- `isValidationError(error)` - Type guard for validation errors
- `isAuthenticationError(error)` - Type guard for auth errors
- `isServerError(error)` - Type guard for server errors

**Error Processing:**
- `extractErrorMessage(error)` - Extract user-friendly error message from any error type
- `createHttpError(apiError)` - Convert raw API errors to typed HTTP errors

## Usage Examples

### HTTP Error Handling

```typescript
try {
  await apiCall();
} catch (error: unknown) {
  // Convert raw API errors to typed HTTP errors
  const typedError = (typeof error === 'object' && error !== null && ('response' in error || 'code' in error)) 
    ? createHttpError(error as ApiRequestError) 
    : error;
  setError(extractErrorMessage(typedError));
}
```

### Event Handlers
```typescript
const handleSubmit: FormSubmitHandler = useCallback(async (e) => {
  e.preventDefault();
  // Handle form submission
}, [dependencies]);

const handleChange: InputChangeHandler = useCallback((e) => {
  setValue(e.target.value);
}, []);
```

### Async State Management
```typescript
const [state, setState] = useState<AsyncState<User>>({
  data: null,
  isLoading: false,
  error: null
});
```

## Type Safety Improvements

The introduction of these types eliminated all `any` types from the codebase and provided:

1. **Consistent Error Handling** - All error catching now uses `unknown` type with proper type guards
2. **Performance Optimization** - All event handlers use `useCallback` for better re-render performance
3. **Better Developer Experience** - Autocomplete and type checking for all event handlers
4. **Maintainability** - Centralized type definitions reduce duplication and improve consistency

## Migration from `any` Types

All components were updated to replace:
- `catch (err: any)` → `catch (error: unknown)` + `extractErrorMessage(error)`
- Direct event handler functions → Typed handlers with `useCallback`
- Manual error message extraction → Centralized `extractErrorMessage` utility
