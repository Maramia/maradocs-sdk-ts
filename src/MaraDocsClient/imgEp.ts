import * as img from "../models/img";
import { TaskCreatedResponseSchema } from "../models/misc";
import { FetchWrapper } from "../shared/fetchWrapper";

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
  ): Promise<img.ImgValidateResponse> {
    const task = await this.wrap.post(
      "/img/validate",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/img/validate/${task.job_id}`,
      img.ImgValidateResponseSchema,
    );
  }

  /**
   * Creates a thumbnail with lower resolution but same aspect ratio.
   * Creates task and polls for result automatically.
   */
  public async thumbnail(
    req: img.ImgThumbnailRequest,
  ): Promise<img.ImgThumbnailResponse> {
    const task = await this.wrap.post(
      "/img/thumbnail",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/img/thumbnail/${task.job_id}`,
      img.ImgThumbnailResponseSchema,
    );
  }

  /**
   * Finds zero, one or more documents in an image.
   * Returns quadrilaterals with confidence scores for each detected document.
   * Creates task and polls for result automatically.
   */
  public async findDocuments(
    req: img.ImgFindDocumentsRequest,
  ): Promise<img.ImgFindDocumentsResponse> {
    const task = await this.wrap.post(
      "/img/find/documents",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/img/find/documents/${task.job_id}`,
      img.ImgFindDocumentsResponseSchema,
    );
  }

  /**
   * Determines image orientation based on depicted text.
   * Returns rotated image and orientation angle with confidence.
   * Creates task and polls for result automatically.
   */
  public async orientation(
    req: img.ImgOrientationRequest,
  ): Promise<img.ImgOrientationResponse> {
    const task = await this.wrap.post(
      "/img/orientation",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/img/orientation/${task.job_id}`,
      img.ImgOrientationResponseSchema,
    );
  }

  /**
   * Extracts a quadrilateral section and corrects perspective.
   * Useful for document scanning and perspective correction.
   * Creates task and polls for result automatically.
   */
  public async extractQuadrilateral(
    req: img.ImgExtractQuadrilateralRequest,
  ): Promise<img.ImgExtractQuadrilateralResponse> {
    const task = await this.wrap.post(
      "/img/extract/quadrilateral",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/img/extract/quadrilateral/${task.job_id}`,
      img.ImgExtractQuadrilateralResponseSchema,
    );
  }

  /**
   * Rotates an image counter-clockwise by a discrete angle (0°, 90°, 180°, 270°).
   * Creates task and polls for result automatically.
   */
  public async rotate(
    req: img.ImgRotateRequest,
  ): Promise<img.ImgRotateResponse> {
    const task = await this.wrap.post(
      "/img/rotate",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/img/rotate/${task.job_id}`,
      img.ImgRotateResponseSchema,
    );
  }

  /**
   * Converts an image to JPEG format with configurable quality.
   * Creates task and polls for result automatically.
   */
  public async toJpeg(
    req: img.ImgToJpegRequest,
  ): Promise<img.ImgToJpegResponse> {
    const task = await this.wrap.post(
      "/img/to/jpeg",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/img/to/jpeg/${task.job_id}`,
      img.ImgToJpegResponseSchema,
    );
  }

  /**
   * Converts an image to PNG format (lossless).
   * Creates task and polls for result automatically.
   */
  public async toPng(req: img.ImgToPngRequest): Promise<img.ImgToPngResponse> {
    const task = await this.wrap.post(
      "/img/to/png",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/img/to/png/${task.job_id}`,
      img.ImgToPngResponseSchema,
    );
  }

  /**
   * Converts an image to PDF format with configurable options.
   * Use ocrToPdf() if you need searchable text in the PDF.
   * Creates task and polls for result automatically.
   */
  public async toPdf(req: img.ImgToPdfRequest): Promise<img.ImgToPdfResponse> {
    const task = await this.wrap.post(
      "/img/to/pdf",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/img/to/pdf/${task.job_id}`,
      img.ImgToPdfResponseSchema,
    );
  }

  /**
   * Performs OCR on an image and creates a searchable PDF with overlaid text.
   * Creates task and polls for result automatically.
   */
  public async ocrToPdf(
    req: img.ImgOcrToPdfRequest,
  ): Promise<img.ImgOcrToPdfResponse> {
    const task = await this.wrap.post(
      "/img/ocr/pdf",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/img/ocr/pdf/${task.job_id}`,
      img.ImgOcrToPdfResponseSchema,
    );
  }
}
