import { z } from "zod/v4";

/**
 * Error codes for API errors - extensible without breaking downstream clients
 * Matches ApiErrorType from Python backend
 */
export enum ApiErrorType {
  // Internal errors (0-99)
  INTERNAL_ERROR = 0,

  // Generic errors (100-199)
  FAILED_VERIFICATION = 100, // forged signing
  FILE_HANDLE_EXPIRED = 101,
  UPLOADED_DATA_IS_NOT_ENCRYPTED = 102,

  // Account errors (200-299)
  INVALID_SECRET_KEY = 200,
  TOO_MANY_SECRETS = 201,
  SUBACCOUNT_CLOSED = 202,
  WORKSPACE_CLOSED = 203,

  // PDF errors (300-399)
  PDF_PAGE_OUT_OF_RANGE = 300,
  PDF_TOO_LARGE = 301,
}

/**
 * API Error structure returned by the backend
 */
export const ApiErrorSchema = z.object({
  code: z.number().int().describe("Error code from ApiErrorType"),
  name: z.string().describe("Error name/identifier"),
  message: z.string().describe("Human-readable error message"),
}).describe("API error details");

export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * HTTP Error response from API - wraps ApiError with HTTP status code
 */
export const HttpErrorResponseSchema = z.object({
  status_code: z.number().int().describe("HTTP status code"),
  api_error: ApiErrorSchema,
}).describe("HTTP error response");

export type HttpErrorResponse = z.infer<typeof HttpErrorResponseSchema>;

/**
 * API Error class for throwing errors
 */
export class ApiErrorException extends Error {
  constructor(
    public status_code: number,
    public api_error: ApiError,
  ) {
    const message = `[${api_error.code}] ${api_error.name}: ${api_error.message}`;
    super(message);
    this.name = "ApiErrorException";
    Object.setPrototypeOf(this, ApiErrorException.prototype);
  }

  /**
   * Create from HTTP error response
   */
  static fromHttpResponse(response: HttpErrorResponse): ApiErrorException {
    return new ApiErrorException(response.status_code, response.api_error);
  }
}
