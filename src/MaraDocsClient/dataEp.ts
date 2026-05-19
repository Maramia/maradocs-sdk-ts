import * as data from "../models/data";
import { HttpErrorResponseSchema, ApiErrorException } from "../models/errors";
import { TaskCreatedResponseSchema } from "../models/misc";
import { FetchWrapper } from "../shared/fetchWrapper";
import type { RequestOptions } from "../shared/requestOptions";

export class DataEp {
  private wrap: FetchWrapper;

  constructor(wrap: FetchWrapper) {
    this.wrap = wrap;
  }

  /**
   * Uploads a file to the server.
   * @param file The file to upload.
   * @param onProgress A callback that is called with the upload progress. `percent` is a float between 0 and 100.
   * @returns The response from the server.
   */
  public async upload(
    file: File,
    onProgress: (percent: number) => void = () => {},
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
      return this.uploadWithXHR(file, response, onProgress);
    } else {
      // Fallback for Node.js environments
      let res = this.uploadWithFetch(file, response);
      onProgress(100);
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
    onProgress: (percent: number) => void,
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
            onProgress(percent);
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
      xhr.onloadend = () => onProgress(100);
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
   * Scans an unvalidated file for viruses.
   * Creates task and polls for result automatically.
   * @experimental
   */
  public async virusScan(
    req: data.VirusScanRequest,
    options?: RequestOptions,
  ): Promise<data.VirusScanResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/data/virus_scan",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/data/virus_scan/${task.job_id}`,
      data.VirusScanResponseSchema,
      timeout,
    );
  }

  /**
   * Determines the MIME type of an unvalidated file.
   * Creates task and polls for result automatically.
   */
  public async mimeType(
    req: data.DataMediaTypeRequest,
    options?: RequestOptions,
  ): Promise<data.DataMediaTypeResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/data/mime_type",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/data/mime_type/${task.job_id}`,
      data.DataMediaTypeResponseSchema,
      timeout,
    );
  }

  public async downloadPdf(
    req: data.DataDownloadPdfRequest,
    onProgress: (percent: number) => void = () => {},
  ): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/pdf",
      req,
      data.DataDownloadPdfResponseSchema,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      onProgress,
    );
    return new Blob([bytes], { type: "application/pdf" });
  }

  public async downloadMp4(
    req: data.DataDownloadMp4Request,
    onProgress: (percent: number) => void = () => {},
    options?: RequestOptions,
  ): Promise<Blob> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/data/download/mp4",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    const response = await this.wrap.pollResult(
      `/data/download/mp4/${task.job_id}`,
      data.DataDownloadMp4ResponseSchema,
      timeout,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      onProgress,
    );
    return new Blob([bytes], { type: "video/mp4" });
  }

  public async downloadMp3(
    req: data.DataDownloadMp3Request,
    onProgress: (percent: number) => void = () => {},
    options?: RequestOptions,
  ): Promise<Blob> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/data/download/mp3",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    const response = await this.wrap.pollResult(
      `/data/download/mp3/${task.job_id}`,
      data.DataDownloadMp3ResponseSchema,
      timeout,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      onProgress,
    );
    return new Blob([bytes], { type: "audio/mpeg" });
  }

  public async downloadWav(
    req: data.DataDownloadWavRequest,
    onProgress: (percent: number) => void = () => {},
    options?: RequestOptions,
  ): Promise<Blob> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/data/download/wav",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    const response = await this.wrap.pollResult(
      `/data/download/wav/${task.job_id}`,
      data.DataDownloadWavResponseSchema,
      timeout,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      onProgress,
    );
    return new Blob([bytes], { type: "audio/wav" });
  }

  public async downloadFlac(
    req: data.DataDownloadFlacRequest,
    onProgress: (percent: number) => void = () => {},
    options?: RequestOptions,
  ): Promise<Blob> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/data/download/flac",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    const response = await this.wrap.pollResult(
      `/data/download/flac/${task.job_id}`,
      data.DataDownloadFlacResponseSchema,
      timeout,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      onProgress,
    );
    return new Blob([bytes], { type: "audio/flac" });
  }

  public async downloadJpeg(
    req: data.DataDownloadJpegRequest,
    onProgress: (percent: number) => void = () => {},
  ): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/jpeg",
      req,
      data.DataDownloadJpegResponseSchema,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      onProgress,
    );
    return new Blob([bytes], { type: "image/jpeg" });
  }

  public async downloadPng(
    req: data.DataDownloadPngRequest,
    onProgress: (percent: number) => void = () => {},
  ): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/png",
      req,
      data.DataDownloadPngResponseSchema,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      onProgress,
    );
    return new Blob([bytes], { type: "image/png" });
  }

  public async downloadOdt(
    req: data.DataDownloadOdtRequest,
    onProgress: (percent: number) => void = () => {},
  ): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/odt",
      req,
      data.DataDownloadOdtResponseSchema,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      onProgress,
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
    onProgress: (percent: number) => void = () => {},
  ): Promise<Blob> {
    const response = await this.wrap.post(
      "/data/download/unvalidated",
      req,
      data.DataDownloadUnvalidatedResponseSchema,
    );
    const bytes = await this.downloadBinary(
      response.url,
      response.headers,
      onProgress,
    );
    return new Blob([bytes]);
  }

  private async downloadBinary(
    url: string,
    headers: Record<string, string>,
    onProgress: (percent: number) => void,
  ): Promise<ArrayBuffer> {
    const requestInit: RequestInit = { method: "GET", headers };
    const response = await fetch(url, requestInit);
    return this.readResponseToArrayBuffer(response, onProgress);
  }

  private async readResponseToArrayBuffer(
    response: Response,
    onProgress: (percent: number) => void,
  ): Promise<ArrayBuffer> {

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
      onProgress((loaded / total) * 100);
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
