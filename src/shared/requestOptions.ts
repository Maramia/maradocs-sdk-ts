/**
 * Options for individual API requests.
 * Can override client-level defaults.
 */
export interface RequestOptions {
  /**
   * Timeout in milliseconds for this request.
   * Overrides the client's default timeout when set.
   */
  timeout?: number;
}
