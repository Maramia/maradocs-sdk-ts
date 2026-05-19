import { PdfHandle, ImgHandle } from "../models/misc";
import { ImgToPdfOptions, okImg } from "../models/img";
import { okPdf } from "../models/pdf";
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
  /**
   * Timeout in milliseconds for each API request in the flow.
   */
  timeout?: number;
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
  /**
   * Timeout in milliseconds for each API request in the flow.
   */
  timeout?: number;
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
   * 5. Orient extracted images (only if documents were found)
   * 6. Enhance image contrast (only if documents were found)
   * 7. Convert images to PDFs
   * 8. Compose and OCR
   *
   * @param input - Image data (File, Blob, ArrayBuffer, or Buffer)
   * @param options - Processing options
   * @returns Handle to the OCR'd PDF
   */
  public async ocrImg(
    input: FlowInput,
    options: OcrImgOptions = {},
  ): Promise<PdfHandle> {
    const { onProgress, timeout } = options;
    const reqOpts = timeout != null ? { timeout } : undefined;

    // 1. Upload
    const file = this.toFile(input, "image.jpg", "image/jpeg");
    const uploaded = await this.data.upload(file, onProgress);

    // 2. Validate
    const validated = await this.img.validate(
      { unvalidated_file_handle: uploaded.unvalidated_file_handle },
      reqOpts,
    );
    let imgHandle: ImgHandle = okImg(validated);

    return this.ocrImgHandle(imgHandle, options);
  }

  /**
   * OCR an image to a searchable PDF.
   *
   * Pipeline:
   * 1. Find documents in image (optional)
   * 2. Extract document with perspective correction (if found)
   * 3. Orient extracted images (only if documents were found)
   * 4. Enhance image contrast (only if documents were found)
   * 5. Convert images to PDFs
   * 6. Compose, OCR, and optimize
   *
   * When no documents are detected (or extraction is disabled), the original
   * image is used as-is without orientation or contrast enhancement.
   *
   * @param imgHandle - Image handle
   * @param options - Processing options
   * @returns Handle to the OCR'd PDF
   */
  public async ocrImgHandle(
    imgHandle: ImgHandle,
    options: OcrImgOptions = {},
  ): Promise<PdfHandle> {
    const { extractDocument = true, pdfOptions, timeout } = options;
    const reqOpts = timeout != null ? { timeout } : undefined;

    let imgHandles: ImgHandle[] = [];

    if (extractDocument) {
      const docs = await this.img.findDocuments(
        { img_handle: imgHandle },
        reqOpts,
      );
      for (const doc of docs.documents) {
        const extracted = await this.img.extractQuadrilateral(
          {
            img_handle: imgHandle,
            quadrilateral: doc.quadrilateral,
          },
          reqOpts,
        );
        imgHandles.push(extracted.img_handle);
      }
    }

    if (imgHandles.length > 0) {
      // Documents extracted — orient and enhance each image
      for (let i = 0; i < imgHandles.length; i++) {
        const oriented = await this.img.orientation({
          img_handle: imgHandles[i]!,
        });
        imgHandles[i] = oriented.rotated_img_handle;

        const enhanced = await this.img.improveContrast({
          img_handle: imgHandles[i]!,
        });
        imgHandles[i] = enhanced.img_handle;
      }
    } else {
      // No documents found or extraction disabled — use original as-is
      imgHandles.push(imgHandle);
    }

    let pdfHandles: PdfHandle[] = [];
    for (const handle of imgHandles) {
      const pdfHandle = await this.img.ocrToPdf({
        img_handle: handle,
        options: pdfOptions,
      });
      pdfHandles.push(pdfHandle.pdf_handle);
    }

    let combinedPdf = await this.pdf.compose({
      pdfs: pdfHandles.map((pdf_handle) => ({ pdf_handle })),
    });

    let ocrPdf = await this.pdf.ocrToPdf({
      pdf_handle: combinedPdf.pdf_handle,
    });
    let optimizedPdf = await this.pdf.optimize({
      pdf_handle: ocrPdf.pdf_handle,
    });

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
   * 5. Optimize to reduce file size
   *
   * @param input - PDF data (File, Blob, ArrayBuffer, or Buffer)
   * @param options - Processing options
   * @returns Handle to the OCR'd and optimized PDF
   */
  public async ocrPdf(
    input: FlowInput,
    options: OcrPdfOptions = {},
  ): Promise<PdfHandle> {
    const { onProgress, password, timeout } = options;
    const reqOpts = timeout != null ? { timeout } : undefined;

    // 1. Upload
    const file = this.toFile(input, "document.pdf", "application/pdf");
    const uploaded = await this.data.upload(file, onProgress);

    // 2. Validate
    const validated = await this.pdf.validate(
      {
        unvalidated_file_handle: uploaded.unvalidated_file_handle,
        password,
      },
      reqOpts,
    );
    let pdfHandle: PdfHandle = okPdf(validated);

    return this.ocrPdfHandle(pdfHandle, options);
  }

  /**
   * OCR a PDF to make it searchable, with orientation correction and optimization.
   *
   * Pipeline:
   * 1. Detect and fix page orientation
   * 2. OCR to searchable PDF
   * 3. Optimize to reduce file size
   *
   * @param pdfHandle - PDF handle
   * @param options - Processing options
   * @returns Handle to the OCR'd and optimized PDF
   */
  public async ocrPdfHandle(
    pdfHandle: PdfHandle,
    options: OcrPdfOptions = {},
  ): Promise<PdfHandle> {
    const { timeout } = options;
    const reqOpts = timeout != null ? { timeout } : undefined;

    // 3. Orientation detection and correction
    const oriented = await this.pdf.orientation(
      { pdf_handle: pdfHandle },
      reqOpts,
    );
    pdfHandle = oriented.rotated_pdf_handle;

    // 4. OCR to searchable PDF
    const ocr = await this.pdf.ocrToPdf({ pdf_handle: pdfHandle }, reqOpts);
    pdfHandle = ocr.pdf_handle;

    // 5. Optimize
    const optimized = await this.pdf.optimize(
      { pdf_handle: pdfHandle },
      reqOpts,
    );
    pdfHandle = optimized.pdf_handle;

    return pdfHandle;
  }
}
