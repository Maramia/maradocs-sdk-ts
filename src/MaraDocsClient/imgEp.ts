import * as img from "../models/img";
import { TaskCreatedResponseSchema } from "../models/misc";
import { FetchWrapper } from "../shared/fetchWrapper";
import type { RequestOptions } from "../shared/requestOptions";

export class ImgEp {
  private wrap: FetchWrapper;

  constructor(wrap: FetchWrapper) {
    this.wrap = wrap;
  }

  /**
   * Validates an uploaded image file for viruses and encoding errors.
   * Must be called before using the image in any other operation.
   * Creates task and polls for result automatically.
   */
  public async validate(
    req: img.ImgValidateRequest,
    options?: RequestOptions,
  ): Promise<img.ImgValidateResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/validate",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/validate/${task.job_id}`,
      img.ImgValidateResponseSchema,
      timeout,
    );
  }

  /**
   * Creates a thumbnail with lower resolution but same aspect ratio.
   * Creates task and polls for result automatically.
   */
  public async thumbnail(
    req: img.ImgThumbnailRequest,
    options?: RequestOptions,
  ): Promise<img.ImgThumbnailResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/thumbnail",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/thumbnail/${task.job_id}`,
      img.ImgThumbnailResponseSchema,
      timeout,
    );
  }

  /**
   * Finds zero, one or more documents in an image.
   * Returns quadrilaterals with confidence scores for each detected document.
   * Creates task and polls for result automatically.
   */
  public async findDocuments(
    req: img.ImgFindDocumentsRequest,
    options?: RequestOptions,
  ): Promise<img.ImgFindDocumentsResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/find/documents",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/find/documents/${task.job_id}`,
      img.ImgFindDocumentsResponseSchema,
      timeout,
    );
  }

  /**
   * Determines image orientation based on depicted text.
   * Returns rotated image and orientation angle with confidence.
   * Creates task and polls for result automatically.
   */
  public async orientation(
    req: img.ImgOrientationRequest,
    options?: RequestOptions,
  ): Promise<img.ImgOrientationResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/orientation",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/orientation/${task.job_id}`,
      img.ImgOrientationResponseSchema,
      timeout,
    );
  }

  /**
   * Extracts a quadrilateral section and corrects perspective.
   * Useful for document scanning and perspective correction.
   * Creates task and polls for result automatically.
   */
  public async extractQuadrilateral(
    req: img.ImgExtractQuadrilateralRequest,
    options?: RequestOptions,
  ): Promise<img.ImgExtractQuadrilateralResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/extract/quadrilateral",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/extract/quadrilateral/${task.job_id}`,
      img.ImgExtractQuadrilateralResponseSchema,
      timeout,
    );
  }

  /**
   * Rotates an image counter-clockwise by a discrete angle (0°, 90°, 180°, 270°).
   * Creates task and polls for result automatically.
   */
  public async rotate(
    req: img.ImgRotateRequest,
    options?: RequestOptions,
  ): Promise<img.ImgRotateResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/rotate",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/rotate/${task.job_id}`,
      img.ImgRotateResponseSchema,
      timeout,
    );
  }

  /**
   * Enhances document images by removing shadows and correcting uneven lighting.
   * Creates task and polls for result automatically.
   *
   * @experimental This API is experimental and may change in future versions without notice
   */
  public async improveContrast(
    req: img.ImgImproveContrastRequest,
    options?: RequestOptions,
  ): Promise<img.ImgImproveContrastResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/improve-contrast",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/improve-contrast/${task.job_id}`,
      img.ImgImproveContrastResponseSchema,
      timeout,
    );
  }

  /**
   * Converts an image to JPEG format with configurable quality.
   * Creates task and polls for result automatically.
   */
  public async toJpeg(
    req: img.ImgToJpegRequest,
    options?: RequestOptions,
  ): Promise<img.ImgToJpegResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/to/jpeg",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/to/jpeg/${task.job_id}`,
      img.ImgToJpegResponseSchema,
      timeout,
    );
  }

  /**
   * Converts an image to PNG format (lossless).
   * Creates task and polls for result automatically.
   */
  public async toPng(
    req: img.ImgToPngRequest,
    options?: RequestOptions,
  ): Promise<img.ImgToPngResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/to/png",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/to/png/${task.job_id}`,
      img.ImgToPngResponseSchema,
      timeout,
    );
  }

  /**
   * Converts an image to PDF format with configurable options.
   * Use ocrToPdf() if you need searchable text in the PDF.
   * Creates task and polls for result automatically.
   */
  public async toPdf(
    req: img.ImgToPdfRequest,
    options?: RequestOptions,
  ): Promise<img.ImgToPdfResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/to/pdf",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/to/pdf/${task.job_id}`,
      img.ImgToPdfResponseSchema,
      timeout,
    );
  }

  /**
   * Performs OCR on an image and creates a searchable PDF with overlaid text.
   * Creates task and polls for result automatically.
   */
  public async ocrToPdf(
    req: img.ImgOcrToPdfRequest,
    options?: RequestOptions,
  ): Promise<img.ImgOcrToPdfResponse> {
    const timeout = options?.timeout;
    const task = await this.wrap.post(
      "/img/ocr/to/pdf",
      req,
      TaskCreatedResponseSchema,
      timeout,
    );
    return this.wrap.pollResult(
      `/img/ocr/to/pdf/${task.job_id}`,
      img.ImgOcrToPdfResponseSchema,
      timeout,
    );
  }
}
