import * as data from "../models/data";
import { HttpErrorResponseSchema, ApiErrorException } from "../models/errors";
import { TaskCreatedResponseSchema } from "../models/misc";
import { FetchWrapper } from "../shared/fetchWrapper";

export class DataEp {
  private wrap: FetchWrapper;

  constructor(wrap: FetchWrapper) {
    this.wrap = wrap;
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

  public async downloadPdf(
    req: data.DataDownloadPdfRequest,
    on_progress: (percent: number) => void = () => {},
  ): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/pdf",
      req,
      data.DataDownloadPdfResponseSchema,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      on_progress,
    );
    return new Blob([bytes], { type: "application/pdf" });
  }

  public async downloadJpeg(
    req: data.DataDownloadJpegRequest,
    on_progress: (percent: number) => void = () => {},
  ): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/jpeg",
      req,
      data.DataDownloadJpegResponseSchema,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      on_progress,
    );
    return new Blob([bytes], { type: "image/jpeg" });
  }

  public async downloadPng(
    req: data.DataDownloadPngRequest,
    on_progress: (percent: number) => void = () => {},
  ): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/png",
      req,
      data.DataDownloadPngResponseSchema,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      on_progress,
    );
    return new Blob([bytes], { type: "image/png" });
  }

  public async downloadOdt(
    req: data.DataDownloadOdtRequest,
    on_progress: (percent: number) => void = () => {},
  ): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/odt",
      req,
      data.DataDownloadOdtResponseSchema,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      on_progress,
    );
    return new Blob([bytes], {
      type: "application/vnd.oasis.opendocument.text",
    });
  }

  /**
   * Downloads an unvalidated file.
   * Useful for downloading email body content (text_body, html_body).
   */
  public async downloadUnvalidated(
    req: data.DataDownloadUnvalidatedRequest,
    on_progress: (percent: number) => void = () => {},
  ): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/unvalidated",
      req,
      data.DataDownloadUnvalidatedResponseSchema,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      on_progress,
    );
    return new Blob([bytes]);
  }

  private async downloadBinary(
    url: string,
    headers: Record<string, string>,
    on_progress: (percent: number) => void,
  ): Promise<ArrayBuffer> {
    const response = await fetch(url, { method: "GET", headers });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    // Get total size from Content-Length header
    const contentLength = response.headers.get("Content-Length");
    const total = contentLength ? parseInt(contentLength, 10) : null;

    if (!total || !response.body) {
      // Fallback: can't track progress, just download
      return response.arrayBuffer();
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loaded += value.length;
      on_progress((loaded / total) * 100);
    }

    // Combine chunks into single ArrayBuffer
    const result = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result.buffer;
  }
}
