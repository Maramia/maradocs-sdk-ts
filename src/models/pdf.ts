/**
 * PDF processing and conversion models for the MaraDocs API.
 * @module pdf
 */
import { z } from "zod";
import {
    DiscreteAngleSchema,
    PdfHandleSchema,
    ImgHandleSchema,
    ConfidenceSchema,
    PdfImgColorSchema,
    PdfImgQualitySchema,
    UnvalidatedFileHandleSchema,
} from "./misc";

// ============================================================================
// Common Types
// ============================================================================

/**
 * Zero-indexed page number in a PDF document
 */
export const PageNumberSchema = z.number().int().min(0).describe("Zero-indexed page number");
export type PageNumber = z.infer<typeof PageNumberSchema>;

/**
 * DPI for PDF image operations (30-600)
 */
export const PdfImgDpiSchema = z.number().int().min(30).max(600).describe("DPI for PDF images (30-600)");
export type PdfImgDpi = z.infer<typeof PdfImgDpiSchema>;

// ============================================================================
// PDF Validation
// ============================================================================

/**
 * Request to validate a PDF file
 */
export const PdfValidateRequestSchema = z.object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe("Handle to the unvalidated PDF file"),
    password: z.string().optional().nullable().describe("Password to decrypt the PDF (if encrypted)"),
}).describe("PDF validation request");
export type PdfValidateRequest = z.infer<typeof PdfValidateRequestSchema>;

/**
 * PDF validation successful
 */
export const PdfValidateResponseOkSchema = z.object({
    class_name: z.literal("PdfValidateResponseOk"),
    pdf_handle: PdfHandleSchema.describe("Handle to the validated PDF"),
}).describe("Successful PDF validation");
export type PdfValidateResponseOk = z.infer<typeof PdfValidateResponseOkSchema>;

/**
 * PDF validation failed due to some error (e.g., decoding error)
 */
export const PdfValidateResponseErrorSchema = z.object({
    class_name: z.literal("PdfValidateResponseError"),
    error: z.string().describe("Error message"),
}).describe("PDF validation error");
export type PdfValidateResponseError = z.infer<typeof PdfValidateResponseErrorSchema>;

/**
 * PDF validation failed due to virus detection
 */
export const PdfValidateResponseVirusSchema = z.object({
    class_name: z.literal("PdfValidateResponseVirus"),
    virus: z.string().describe("Virus scan message"),
}).describe("PDF validation - virus detected");
export type PdfValidateResponseVirus = z.infer<typeof PdfValidateResponseVirusSchema>;

/**
 * Response to a PDF validation request (discriminated union)
 */
export const PdfValidateResponseSchema = z.object({
    class_name: z.literal("PdfValidateResponse"),
    response: z.discriminatedUnion("class_name", [
        PdfValidateResponseOkSchema,
        PdfValidateResponseErrorSchema,
        PdfValidateResponseVirusSchema,
    ]).describe("Validation result"),
}).describe("PDF validation response");
export type PdfValidateResponse = z.infer<typeof PdfValidateResponseSchema>;

// ============================================================================
// PDF Composition
// ============================================================================

/**
 * Page specification for PDF composition with optional rotation
 */
export const PdfComposePdfPageSchema = z.object({
    page_number: PageNumberSchema.describe("Zero-indexed page number to include"),
    rotation: DiscreteAngleSchema.default(0).describe("Rotation angle for this page. Default: 0"),
}).describe("Page specification for PDF composition");
export type PdfComposePdfPage = z.input<typeof PdfComposePdfPageSchema>;

/**
 * PDF source for composition with optional page selection
 */
export const PdfComposePdfSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the source PDF"),
    pages: z.array(PdfComposePdfPageSchema).optional().describe(
        "Pages to include. If not provided, all pages are used."
    ),
}).describe("PDF source for composition");
export type PdfComposePdf = z.input<typeof PdfComposePdfSchema>;

/**
 * Request to compose a new PDF from one or more existing PDFs
 */
export const PdfComposeRequestSchema = z.object({
    pdfs: z.array(PdfComposePdfSchema).describe("List of PDFs to compose"),
}).describe("PDF composition request");
export type PdfComposeRequest = z.input<typeof PdfComposeRequestSchema>;

/**
 * Response to a PDF composition request
 */
export const PdfComposeResponseSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the composed PDF"),
}).describe("PDF composition response");
export type PdfComposeResponse = z.infer<typeof PdfComposeResponseSchema>;

// ============================================================================
// PDF Rotation
// ============================================================================

/**
 * Request to rotate specific pages in a PDF
 */
export const PdfRotateRequestSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the PDF to rotate"),
    rotate: z.array(z.tuple([
        PageNumberSchema,
        DiscreteAngleSchema
    ])).describe("List of [page_number, angle] tuples specifying rotations"),
}).describe("PDF rotation request");
export type PdfRotateRequest = z.infer<typeof PdfRotateRequestSchema>;

/**
 * Response to a PDF rotation request
 */
export const PdfRotateResponseSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the rotated PDF"),
}).describe("PDF rotation response");
export type PdfRotateResponse = z.infer<typeof PdfRotateResponseSchema>;

// ============================================================================
// PDF Optimization
// ============================================================================

/**
 * Request to optimize a PDF (reduce file size by compressing images)
 */
export const PdfOptimizeRequestSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the PDF to optimize"),
    image_dpi: PdfImgDpiSchema.default(150).describe("Target DPI for images. Default: 150"),
    image_quality: PdfImgQualitySchema.default(70).describe("Image quality (1-100). Default: 70"),
    image_color: PdfImgColorSchema.default("original").describe("Color mode. Default: original"),
}).describe("PDF optimization request");
export type PdfOptimizeRequest = z.input<typeof PdfOptimizeRequestSchema>;

/**
 * Response to a PDF optimization request
 */
export const PdfOptimizeResponseSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the optimized PDF"),
}).describe("PDF optimization response");
export type PdfOptimizeResponse = z.infer<typeof PdfOptimizeResponseSchema>;

// ============================================================================
// PDF OCR
// ============================================================================

/**
 * Request to perform OCR on a PDF and create a searchable PDF with text layer
 */
export const PdfOcrToPdfRequestSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the PDF for OCR"),
}).describe("PDF OCR request");
export type PdfOcrToPdfRequest = z.infer<typeof PdfOcrToPdfRequestSchema>;

/**
 * Response to a PDF OCR request
 */
export const PdfOcrToPdfResponseSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the OCR-processed PDF"),
}).describe("PDF OCR response");
export type PdfOcrToPdfResponse = z.infer<typeof PdfOcrToPdfResponseSchema>;

// ============================================================================
// PDF Orientation Detection
// ============================================================================

/**
 * Request to determine the orientation of pages in a PDF based on text content
 */
export const PdfOrientationRequestSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the PDF to analyze"),
}).describe("PDF orientation detection request");
export type PdfOrientationRequest = z.infer<typeof PdfOrientationRequestSchema>;

/**
 * Response to a PDF orientation detection request
 */
export const PdfOrientationResponseSchema = z.object({
    orientations: z.array(z.tuple([
        DiscreteAngleSchema,
        ConfidenceSchema
    ])).describe("List of [orientation, confidence] for each page"),
    rotated_pdf_handle: PdfHandleSchema.describe("PDF with pages auto-rotated to correct orientation"),
}).describe("PDF orientation detection response");
export type PdfOrientationResponse = z.infer<typeof PdfOrientationResponseSchema>;

// ============================================================================
// PDF to Image Conversion
// ============================================================================

/**
 * Request to render PDF pages as images
 */
export const PdfToImgRequestSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the PDF to render"),
    pages: z.array(PageNumberSchema).optional().nullable().describe("Pages to render. If not provided, all pages are rendered."),
    dpi: z.number().int().min(72).max(600).default(200).describe("DPI for rendering. Default: 200"),
}).describe("PDF to image conversion request");
export type PdfToImgRequest = z.input<typeof PdfToImgRequestSchema>;

/**
 * Response to a PDF to image conversion request
 */
export const PdfToImgResponseSchema = z.object({
    img_handles: z.array(ImgHandleSchema).describe("List of image handles, one per rendered page"),
}).describe("PDF to image conversion response");
export type PdfToImgResponse = z.infer<typeof PdfToImgResponseSchema>;
