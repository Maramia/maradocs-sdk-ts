import { z } from "zod";
import { HttpErrorResponseSchema, ApiErrorException } from "../models/errors";

const MAX_RETRIES = 120; // The backend waits 10 seconds per GET request. We will retry for up to one hour.

export class FetchWrapper {
  private jwt: string;
  public apiUrlWithVersion: string;

  /**
   * @param jwt The JWT token to use for authentication.
   * @param apiUrlWithVersion The base URL of the API.
   */
  constructor({
    jwt,
    apiUrlWithVersion,
  }: {
    jwt: string;
    apiUrlWithVersion: string;
  }) {
    this.jwt = jwt;
    this.apiUrlWithVersion = apiUrlWithVersion.replace(/\/$/, ""); // make sure the base url does not end with a slash
  }

  public async get<Out>(path: string, schema: z.ZodType<Out>): Promise<Out> {
    return this.request<Out>("GET", path, null, schema);
  }

  public async post<Out>(
    path: string,
    request: any,
    schema: z.ZodType<Out>,
  ): Promise<Out> {
    return this.request<Out>("POST", path, request, schema);
  }

  public async put<Out>(
    path: string,
    body: any,
    schema: z.ZodType<Out>,
  ): Promise<Out> {
    return this.request<Out>("PUT", path, body, schema);
  }

  public async patch<Out>(
    path: string,
    body: any,
    schema: z.ZodType<Out>,
  ): Promise<Out> {
    return this.request<Out>("PATCH", path, body, schema);
  }

  public async delete<Out>(
    path: string,
    body: any,
    schema: z.ZodSchema<Out>,
  ): Promise<Out> {
    return this.request<Out>("DELETE", path, body, schema);
  }

  /**
   * Wrapper around fetch() that handles authentication and response parsing.
   */
  private async request<Out>(
    method: string,
    path: string,
    body: any,
    schema: z.ZodType<Out>,
  ): Promise<Out> {
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
    let res = await fetch(this.apiUrlWithVersion + path, requestInit);
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
  ): Promise<Out> {
    let retry_count = 0;
    while (true) {
      const requestInit: RequestInit = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.jwt}`,
        },
      };
      let res = await fetch(this.apiUrlWithVersion + path, requestInit);

      if (res.status === 200) {
        let data = await res.json();
        try {
          return schema.parse(data);
        } catch (error) {
          console.error(data);
          throw error;
        }
      } else if (res.status === 202) {
        // 202 means the task is still processing (waited 10s on server)
        // Retry immediately - the server already waited
        retry_count++;
        if (retry_count > MAX_RETRIES) {
          throw new Error("Failed processing the request in a reasonable time");
        }
        continue;
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
  }
  public url(path: string): string {
    return this.apiUrlWithVersion + path;
  }
}
