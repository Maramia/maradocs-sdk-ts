import * as pdf from "../models/pdf";
import { TaskCreatedResponseSchema } from "../models/misc";
import { FetchWrapper } from "../shared/fetchWrapper";

export class PdfEp {
  private wrap: FetchWrapper;

  constructor(wrap: FetchWrapper) {
    this.wrap = wrap;
  }

  /**
   * Validates an uploaded PDF file for viruses and encoding errors.
   * Must be called before using the PDF in any other operation.
   * Creates task and polls for result automatically.
   */
  public async validate(
    req: pdf.PdfValidateRequest,
  ): Promise<pdf.PdfValidateResponse> {
    const task = await this.wrap.post(
      "/pdf/validate",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/pdf/validate/${task.job_id}`,
      pdf.PdfValidateResponseSchema,
    );
  }

  /**
   * Composes a new PDF from one or more existing PDFs.
   * This allows merging/splitting PDFs by selecting specific pages.
   * Creates task and polls for result automatically.
   */
  public async compose(
    req: pdf.PdfComposeRequest,
  ): Promise<pdf.PdfComposeResponse> {
    const task = await this.wrap.post(
      "/pdf/compose",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/pdf/compose/${task.job_id}`,
      pdf.PdfComposeResponseSchema,
    );
  }

  /**
   * Optimizes a PDF to reduce file size and improve loading speed.
   * Creates task and polls for result automatically.
   */
  public async optimize(
    req: pdf.PdfOptimizeRequest,
  ): Promise<pdf.PdfOptimizeResponse> {
    const task = await this.wrap.post(
      "/pdf/optimize",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/pdf/optimize/${task.job_id}`,
      pdf.PdfOptimizeResponseSchema,
    );
  }

  /**
   * Rotates specific pages of a PDF by a given angle.
   * The angle must be one of: 0°, 90°, 180°, or 270°.
   * Creates task and polls for result automatically.
   */
  public async rotate(
    req: pdf.PdfRotateRequest,
  ): Promise<pdf.PdfRotateResponse> {
    const task = await this.wrap.post(
      "/pdf/rotate",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/pdf/rotate/${task.job_id}`,
      pdf.PdfRotateResponseSchema,
    );
  }

  /**
   * Renders one or more pages of a PDF to images.
   * To create thumbnails of PDFs use:  toImg -> thumbnail -> toJpeg.
   * Creates task and polls for result automatically.
   */
  public async toImg(req: pdf.PdfToImgRequest): Promise<pdf.PdfToImgResponse> {
    const task = await this.wrap.post(
      "/pdf/to/img",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/pdf/to/img/${task.job_id}`,
      pdf.PdfToImgResponseSchema,
    );
  }

  /**
   * Determines PDF orientation based on depicted text.
   * Returns rotated PDF and orientation angles with confidence for each page.
   * Creates task and polls for result automatically.
   */
  public async orientation(
    req: pdf.PdfOrientationRequest,
  ): Promise<pdf.PdfOrientationResponse> {
    const task = await this.wrap.post(
      "/pdf/orientation",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/pdf/orientation/${task.job_id}`,
      pdf.PdfOrientationResponseSchema,
    );
  }

  /**
   * Performs OCR on a PDF and creates a searchable PDF with text layer.
   * Creates task and polls for result automatically.
   */
  public async ocrToPdf(
    req: pdf.PdfOcrToPdfRequest,
  ): Promise<pdf.PdfOcrToPdfResponse> {
    const task = await this.wrap.post(
      "/pdf/ocr/pdf",
      req,
      TaskCreatedResponseSchema,
    );
    return this.wrap.pollResult(
      `/pdf/ocr/pdf/${task.job_id}`,
      pdf.PdfOcrToPdfResponseSchema,
    );
  }
}
