import { PdfHandle, ImgHandle } from "../models/misc";
import { ImgToPdfOptions } from "../models/img";
import { DataEp } from "./dataEp";
import { ImgEp } from "./imgEp";
import { PdfEp } from "./pdfEp";

/**
 * Input types accepted by flow methods.
 * Supports File, Blob, ArrayBuffer, and Node.js Buffer.
 */
export type FlowInput = File | Blob | ArrayBuffer | Buffer;

/**
 * Options for the ocrImg flow.
 */
export interface OcrImgOptions {
  /**
   * Whether to detect and extract documents from the image.
   * If true and a document is found, it will be extracted and perspective-corrected.
   * Default: true
   */
  extractDocument?: boolean;
  /**
   * Callback for upload progress (0-100).
   */
  onProgress?: (percent: number) => void;
  /**
   * Options for the final PDF conversion.
   */
  pdfOptions?: Partial<ImgToPdfOptions>;
}

/**
 * Options for the ocrPdf flow.
 */
export interface OcrPdfOptions {
  /**
   * Callback for upload progress (0-100).
   */
  onProgress?: (percent: number) => void;
  /**
   * Password for encrypted PDFs.
   */
  password?: string;
}

/**
 * High-level document processing flows that combine multiple operations.
 */
export class Flow {
  private data: DataEp;
  private img: ImgEp;
  private pdf: PdfEp;

  constructor(data: DataEp, img: ImgEp, pdf: PdfEp) {
    this.data = data;
    this.img = img;
    this.pdf = pdf;
  }

  /**
   * Converts input to a File object for upload.
   */
  private toFile(input: FlowInput, filename: string, mimeType: string): File {
    if (input instanceof File) {
      return input;
    }
    if (input instanceof Blob) {
      return new File([input], filename, { type: mimeType });
    }
    // ArrayBuffer or Buffer
    return new File([input as ArrayBuffer], filename, { type: mimeType });
  }

  /**
   * OCR an image to a searchable PDF.
   *
   * Pipeline:
   * 1. Upload image
   * 2. Validate image
   * 3. Find documents in image (optional)
   * 4. Extract document with perspective correction (if found)
   * 5. Convert images to PDFs
   * 6. Detect and fix orientation
   * 7. OCR to searchable PDF
   * 8. Optimize to reduce file size
   *
   * @param input - Image data (File, Blob, ArrayBuffer, or Buffer)
   * @param options - Processing options
   * @returns Handle to the OCR'd PDF
   */
  public async ocrImg(
    input: FlowInput,
    options: OcrImgOptions = {},
  ): Promise<PdfHandle> {
    const { extractDocument = true, onProgress, pdfOptions } = options;

    // 1. Upload
    const file = this.toFile(input, "image.jpg", "image/jpeg");
    const uploaded = await this.data.upload(file, onProgress);

    // 2. Validate
    const validated = await this.img.validate({
      unvalidated_file_handle: uploaded.unvalidated_file_handle,
    });
    if (validated.response.class_name !== "ImgValidateResponseOk") {
      throw new Error(
        `Image validation failed: ${validated.response.class_name === "ImgValidateResponseError" ? validated.response.error : "virus detected"}`,
      );
    }
    let imgHandle: ImgHandle = validated.response.img_handle;

    let imgHandles: ImgHandle[] = [];
    
    // 3. & 4. Find and extract documents (optional)
    if (extractDocument) {
      const docs = await this.img.findDocuments({ img_handle: imgHandle });
        for (const doc of docs.documents) {
          const extracted = await this.img.extractQuadrilateral({
            img_handle: imgHandle,
            quadrilateral: doc.quadrilateral,
          });
          imgHandles.push(extracted.img_handle);
        }
    }
    
    // No documents found or extraction disabled: process original image
    if (imgHandles.length == 0) {
      imgHandles.push(imgHandle);
    }

    // Convert images to PDFs
    let pdfHandles: PdfHandle[] = [];
    for (const imgHandle of imgHandles) {
      const pdfHandle = await this.img.toPdf({ img_handle: imgHandle , options: pdfOptions});
      pdfHandles.push(pdfHandle.pdf_handle);
    }
    let combinedPdf = await this.pdf.compose({
      pdfs: pdfHandles.map(pdf_handle => ({ pdf_handle })),
    });
    
    // 5. Detect and fix orientation
    let orientedPdf = (await this.pdf.orientation({ pdf_handle: combinedPdf.pdf_handle })).rotated_pdf_handle;

    // 6. OCR to PDF
    let ocrPdf = await this.pdf.ocrToPdf({ pdf_handle: orientedPdf });
    let optimizedPdf = await this.pdf.optimize({ pdf_handle: ocrPdf.pdf_handle });

    return optimizedPdf.pdf_handle;

  }

  /**
   * OCR a PDF to make it searchable, with orientation correction and optimization.
   *
   * Pipeline:
   * 1. Upload PDF
   * 2. Validate PDF
   * 3. Detect and fix page orientation
   * 4. OCR to searchable PDF
   * 5. Optimize to reduce file size (optional)
   *
   * @param input - PDF data (File, Blob, ArrayBuffer, or Buffer)
   * @param options - Processing options
   * @returns Handle to the OCR'd and optimized PDF
   */
  public async ocrPdf(
    input: FlowInput,
    options: OcrPdfOptions = {},
  ): Promise<PdfHandle> {
    const { onProgress, password } = options;

    // 1. Upload
    const file = this.toFile(input, "document.pdf", "application/pdf");
    const uploaded = await this.data.upload(file, onProgress);

    // 2. Validate
    const validated = await this.pdf.validate({
      unvalidated_file_handle: uploaded.unvalidated_file_handle,
      password,
    });
    if (validated.response.class_name !== "PdfValidateResponseOk") {
      throw new Error(
        `PDF validation failed: ${validated.response.class_name === "PdfValidateResponseError" ? validated.response.error : "virus detected"}`,
      );
    }
    let pdfHandle: PdfHandle = validated.response.pdf_handle;

    // 3. Orientation detection and correction
    const oriented = await this.pdf.orientation({ pdf_handle: pdfHandle });
    pdfHandle = oriented.rotated_pdf_handle;

    // 4. OCR to searchable PDF
    const ocr = await this.pdf.ocrToPdf({ pdf_handle: pdfHandle });
    pdfHandle = ocr.pdf_handle;

    // 5. Optimize
    const optimized = await this.pdf.optimize({ pdf_handle: pdfHandle });
    pdfHandle = optimized.pdf_handle;

    return pdfHandle;
  }
}
