import { z } from "zod/v4";
import { HttpErrorResponseSchema, ApiErrorException } from "../models/errors";

const MAX_RETRIES = 120; // The backend waits 10 seconds per GET request. We will retry for up to one hour.

export class FetchWrapper {
  private jwt: string;
  public apiUrlWithVersion: string;
  private defaultTimeoutMs: number | undefined;

  /**
   * @param jwt The JWT token to use for authentication.
   * @param apiUrlWithVersion The base URL of the API.
   * @param timeoutMs Optional default timeout in milliseconds for each request.
   */
  constructor({
    jwt,
    apiUrlWithVersion,
    timeoutMs,
  }: {
    jwt: string;
    apiUrlWithVersion: string;
    timeoutMs?: number;
  }) {
    this.jwt = jwt;
    this.apiUrlWithVersion = apiUrlWithVersion.replace(/\/$/, ""); // make sure the base url does not end with a slash
    this.defaultTimeoutMs = timeoutMs;
  }

  public async get<Out>(
    path: string,
    schema: z.ZodType<Out>,
    requestTimeoutMs?: number,
  ): Promise<Out> {
    return this.request<Out>("GET", path, null, schema, requestTimeoutMs);
  }

  public async post<Out>(
    path: string,
    request: any,
    schema: z.ZodType<Out>,
    requestTimeoutMs?: number,
  ): Promise<Out> {
    return this.request<Out>("POST", path, request, schema, requestTimeoutMs);
  }

  public async put<Out>(
    path: string,
    body: any,
    schema: z.ZodType<Out>,
    requestTimeoutMs?: number,
  ): Promise<Out> {
    return this.request<Out>("PUT", path, body, schema, requestTimeoutMs);
  }

  public async patch<Out>(
    path: string,
    body: any,
    schema: z.ZodType<Out>,
    requestTimeoutMs?: number,
  ): Promise<Out> {
    return this.request<Out>("PATCH", path, body, schema, requestTimeoutMs);
  }

  public async delete<Out>(
    path: string,
    body: any,
    schema: z.ZodSchema<Out>,
    requestTimeoutMs?: number,
  ): Promise<Out> {
    return this.request<Out>("DELETE", path, body, schema, requestTimeoutMs);
  }

  /**
   * Wrapper around fetch() that handles authentication and response parsing.
   */
  private async request<Out>(
    method: string,
    path: string,
    body: any,
    schema: z.ZodType<Out>,
    requestTimeoutMs?: number,
  ): Promise<Out> {
    const effectiveTimeout = requestTimeoutMs ?? this.defaultTimeoutMs;

    const requestInit: RequestInit = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.jwt}`,
      },
    };
    if (body) {
      requestInit.body = JSON.stringify(body);
    }

    if (effectiveTimeout != null) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), effectiveTimeout);
      requestInit.signal = controller.signal;
      try {
        const res = await fetch(this.apiUrlWithVersion + path, requestInit);
        clearTimeout(timer);
        return this.handleResponse(res, body, schema);
      } catch (err) {
        console.error("Fetching URL:", this.apiUrlWithVersion + path);
        clearTimeout(timer);
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error(`Request timeout after ${effectiveTimeout}ms`);
        }
        throw err;
      }
    }

    const res = await fetch(this.apiUrlWithVersion + path, requestInit);
    return this.handleResponse(res, body, schema);
  }

  private async handleResponse<Out>(
    res: Response,
    body: any,
    schema: z.ZodType<Out>,
  ): Promise<Out> {
    if (res.status === 200 || res.status === 201) {
      let data = await res.json();
      try {
        return schema.parse(data);
      } catch (error) {
        console.error(body);
        console.error(data);
        throw error;
      }
    }
    try {
      let data = await res.json();
      let error = HttpErrorResponseSchema.parse(data);
      throw ApiErrorException.fromHttpResponse(error);
    } catch (err) {
      if (err instanceof ApiErrorException) {
        throw err;
      }
      throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
    }
  }

  /**
   * Polls a GET endpoint until the result is ready (status 200) or max retries reached.
   * Each request waits up to 10 seconds on the server side (202 = still processing).
   */
  public async pollResult<Out>(
    path: string,
    schema: z.ZodType<Out>,
    requestTimeoutMs?: number,
  ): Promise<Out> {
    const effectiveTimeout = requestTimeoutMs ?? this.defaultTimeoutMs;

    let retryCount = 0;
    while (true) {
      const requestInit: RequestInit = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.jwt}`,
        },
      };

      if (effectiveTimeout != null) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), effectiveTimeout);
        requestInit.signal = controller.signal;
        try {
          const res = await fetch(this.apiUrlWithVersion + path, requestInit);
          clearTimeout(timer);
          if (res.status === 200) {
            let data = await res.json();
            try {
              return schema.parse(data);
            } catch (error) {
              console.error(data);
              throw error;
            }
          } else if (res.status === 202) {
            retryCount++;
            if (retryCount > MAX_RETRIES) {
              throw new Error(
                "Failed processing the request in a reasonable time",
              );
            }
            continue;
          }
          throw await this.parseErrorResponse(res);
        } catch (err) {
          clearTimeout(timer);
          if (err instanceof Error && err.name === "AbortError") {
            throw new Error(`Request timeout after ${effectiveTimeout}ms`);
          }
          throw err;
        }
      }

      const res = await fetch(this.apiUrlWithVersion + path, requestInit);

      if (res.status === 200) {
        let data = await res.json();
        try {
          return schema.parse(data);
        } catch (error) {
          console.error(data);
          throw error;
        }
      } else if (res.status === 202) {
        retryCount++;
        if (retryCount > MAX_RETRIES) {
          throw new Error(
            "Failed processing the request in a reasonable time",
          );
        }
        continue;
      }

      throw await this.parseErrorResponse(res);
    }
  }

  private async parseErrorResponse(res: Response): Promise<never> {
    try {
      const data = await res.json();
      const error = HttpErrorResponseSchema.parse(data);
      throw ApiErrorException.fromHttpResponse(error);
    } catch (err) {
      if (err instanceof ApiErrorException) {
        throw err;
      }
      throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
    }
  }
  public url(path: string): string {
    return this.apiUrlWithVersion + path;
  }
}
