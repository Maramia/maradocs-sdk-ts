import * as data from "../models/data";
import { HttpErrorResponseSchema, ApiErrorException } from "../models/errors";
import { TaskCreatedResponseSchema } from "../models/misc";
import { FetchWrapper } from "../shared/fetchWrapper";
import { md5 } from "js-md5";

/**
 * Compute SSE-C headers for S3 requests.
 */
function computeSseCHeaders(
  encryption_key: Uint8Array,
): Record<string, string> {
  const keyB64 = btoa(String.fromCharCode(...encryption_key));
  const keyMd5 = md5.arrayBuffer(encryption_key);
  const md5B64 = btoa(String.fromCharCode(...new Uint8Array(keyMd5)));

  return {
    "x-amz-server-side-encryption-customer-algorithm": "AES256",
    "x-amz-server-side-encryption-customer-key": keyB64,
    "x-amz-server-side-encryption-customer-key-md5": md5B64,
  };
}

export class DataEp {
  private wrap: FetchWrapper;
  private sseHeaders: Record<string, string>;

  constructor(wrap: FetchWrapper, encryption_key: Uint8Array) {
    this.wrap = wrap;
    this.sseHeaders = computeSseCHeaders(encryption_key);
  }

  /**
   * Uploads a file to the server.
   * @param file The file to upload.
   * @param on_progress A callback that is called with the upload progress. `percent` is a float between 0 and 100.
   * @returns The response from the server.
   */
  public async upload(
    file: File,
    on_progress: (percent: number) => void = () => {},
  ): Promise<data.DataUploadResponse> {
    const request = data.DataUploadRequestSchema.parse({
      size: file.size,
    });
    const response = await this.wrap.post(
      "/data/upload",
      request,
      data.DataUploadResponseSchema,
    );

    if (typeof XMLHttpRequest !== "undefined") {
      return this.uploadWithXHR(file, response, on_progress);
    } else {
      // Fallback for Node.js environments
      let res = this.uploadWithFetch(file, response);
      on_progress(100);
      return res;
    }
  }

  /**
   * Upload using XMLHttpRequest (browser environments) - S3 direct upload
   * SSE-C fields are included in post_header (form data) which satisfies policy AND triggers encryption
   */
  private async uploadWithXHR(
    file: File,
    response: data.DataUploadResponse,
    on_progress: (percent: number) => void,
  ): Promise<data.DataUploadResponse> {
    return new Promise<data.DataUploadResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", response.post_url);

      const formData = new FormData();
      for (const [key, value] of Object.entries(response.post_header)) {
        formData.append(key, value);
      }
      formData.append("file", file, file.name);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          if (percent < 100) {
            on_progress(percent);
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(
            new Error(
              `S3 upload failed! status: ${xhr.status} ${xhr.statusText}`,
            ),
          );
        }
      };
      xhr.onerror = () =>
        reject(
          new Error(
            `S3 upload failed! status: ${xhr.status} ${xhr.statusText}`,
          ),
        );
      xhr.send(formData);
      xhr.onloadend = () => on_progress(100);
    });
  }

  private async uploadWithFetch(
    file: File,
    response: data.DataUploadResponse,
  ): Promise<data.DataUploadResponse> {
    const formData = new FormData();
    for (const [key, value] of Object.entries(response.post_header)) {
      formData.append(key, value);
    }
    formData.append("file", file, file.name);

    const uploadResponse = await fetch(response.post_url, {
      method: "POST",
      body: formData,
    });
    if (uploadResponse.ok) {
      return response;
    } else {
      try {
        const errorData = await uploadResponse.json();
        let error = HttpErrorResponseSchema.parse(errorData);
        throw ApiErrorException.fromHttpResponse(error);
      } catch (err) {
        if (err instanceof ApiErrorException) {
          throw err;
        }
        throw new Error(
          `S3 upload failed! status: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
      }
    }
  }

  /**
   * Determines the MIME type of an unvalidated file.
   * Creates task and polls for result automatically.
   */
  public async mimeType(
    req: data.DataMediaTypeRequest,
  ): Promise<data.DataMediaTypeResponse> {
    const task = await this.wrap.post(
      "/data/mime_type",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/data/mime_type/${task.job_id}`,
      data.DataMediaTypeResponseSchema,
    );
  }

  public async downloadPdf(req: data.DataDownloadPdfRequest): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/pdf",
      req,
      data.DataDownloadPdfResponseSchema,
    );
    const bytes = await this.downloadBinary(response.url);
    return new Blob([bytes], { type: "application/pdf" });
  }

  public async downloadJpeg(req: data.DataDownloadJpegRequest): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/jpeg",
      req,
      data.DataDownloadJpegResponseSchema,
    );
    const bytes = await this.downloadBinary(response.url);
    return new Blob([bytes], { type: "image/jpeg" });
  }

  public async downloadPng(req: data.DataDownloadPngRequest): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/png",
      req,
      data.DataDownloadPngResponseSchema,
    );
    const bytes = await this.downloadBinary(response.url);
    return new Blob([bytes], { type: "image/png" });
  }

  public async downloadOdt(req: data.DataDownloadOdtRequest): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/odt",
      req,
      data.DataDownloadOdtResponseSchema,
    );
    const bytes = await this.downloadBinary(response.url);
    return new Blob([bytes], {
      type: "application/vnd.oasis.opendocument.text",
    });
  }

  private async downloadBinary(url: string): Promise<ArrayBuffer> {
    let res = await fetch(url, {
      method: "GET",
      headers: this.sseHeaders,
    });
    if (res.status === 200) {
      return await res.arrayBuffer();
    } else {
      throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
    }
  }
}
