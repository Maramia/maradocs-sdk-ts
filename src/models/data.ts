/**
 * Data upload and download models for file handling in the MaraDocs API.
 * @module data
 */
import { z } from "zod";
import { PdfHandleSchema, JpegHandleSchema, PngHandleSchema, ConfidenceSchema, UnvalidatedFileHandleSchema, OdtHandleSchema } from "./misc";

// ============================================================================
// Upload
// ============================================================================

/**
 * Request to upload a file to the workspace
 */
export const DataUploadRequestSchema = z.object({
    size: z.number().int().positive().describe("Size of the file in bytes"),
}).describe("File upload request");
export type DataUploadRequest = z.infer<typeof DataUploadRequestSchema>;

/**
 * Response to a file upload request containing presigned URL and headers
 */
export const DataUploadResponseSchema = z.object({
    post_url: z.string().describe("Presigned POST URL for file upload"),
    post_header: z.record(z.string(), z.string()).describe("Headers to include in the POST request"),
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe("Handle to the uploaded file"),
}).describe("File upload response");
export type DataUploadResponse = z.infer<typeof DataUploadResponseSchema>;

// ============================================================================
// Download - PDF
// ============================================================================

/**
 * Request to download a PDF file from the workspace
 */
export const DataDownloadPdfRequestSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the PDF file to download"),
}).describe("PDF download request");
export type DataDownloadPdfRequest = z.infer<typeof DataDownloadPdfRequestSchema>;

/**
 * Response to a PDF download request
 */
export const DataDownloadPdfResponseSchema = z.object({
    url: z.url().describe("Presigned GET URL to download the PDF"),
}).describe("PDF download response");
export type DataDownloadPdfResponse = z.infer<typeof DataDownloadPdfResponseSchema>;

// ============================================================================
// Download - JPEG
// ============================================================================

/**
 * Request to download a JPEG file from the workspace
 */
export const DataDownloadJpegRequestSchema = z.object({
    jpeg_handle: JpegHandleSchema.describe("Handle to the JPEG file to download"),
}).describe("JPEG download request");
export type DataDownloadJpegRequest = z.infer<typeof DataDownloadJpegRequestSchema>;

/**
 * Response to a JPEG download request
 */
export const DataDownloadJpegResponseSchema = z.object({
    url: z.url().describe("Presigned GET URL to download the JPEG"),
}).describe("JPEG download response");
export type DataDownloadJpegResponse = z.infer<typeof DataDownloadJpegResponseSchema>;

// ============================================================================
// Download - PNG
// ============================================================================

/**
 * Request to download a PNG file from the workspace
 */
export const DataDownloadPngRequestSchema = z.object({
    png_handle: PngHandleSchema.describe("Handle to the PNG file to download"),
}).describe("PNG download request");
export type DataDownloadPngRequest = z.infer<typeof DataDownloadPngRequestSchema>;

/**
 * Response to a PNG download request
 */
export const DataDownloadPngResponseSchema = z.object({
    url: z.url().describe("Presigned GET URL to download the PNG"),
}).describe("PNG download response");
export type DataDownloadPngResponse = z.infer<typeof DataDownloadPngResponseSchema>;

// ============================================================================
// Download - ODT
// ============================================================================

/**
 * Request to download an ODT file from the workspace
 */
export const DataDownloadOdtRequestSchema = z.object({
    odt_handle: OdtHandleSchema.describe("Handle to the ODT file to download"),
}).describe("ODT download request");
export type DataDownloadOdtRequest = z.infer<typeof DataDownloadOdtRequestSchema>;

/**
 * Response to an ODT download request
 */
export const DataDownloadOdtResponseSchema = z.object({
    url: z.url().describe("Presigned GET URL to download the ODT"),
}).describe("ODT download response");
export type DataDownloadOdtResponse = z.infer<typeof DataDownloadOdtResponseSchema>;

// ============================================================================
// Download - Unvalidated
// ============================================================================

/**
 * Request to download a binary file that has not been validated yet
 */
export const DataDownloadUnvalidatedRequestSchema = z.object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe("Handle to the unvalidated file"),
}).describe("Unvalidated file download request");
export type DataDownloadUnvalidatedRequest = z.infer<typeof DataDownloadUnvalidatedRequestSchema>;

/**
 * Response to an unvalidated file download request
 */
export const DataDownloadUnvalidatedResponseSchema = z.object({
    url: z.url().describe("Presigned GET URL to download the file"),
}).describe("Unvalidated file download response");
export type DataDownloadUnvalidatedResponse = z.infer<typeof DataDownloadUnvalidatedResponseSchema>;

// ============================================================================
// Media Type Detection
// ============================================================================

/**
 * Request to determine the media type (MIME) of a file
 */
export const DataMediaTypeRequestSchema = z.object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema,
}).describe("Media type detection request");
export type DataMediaTypeRequest = z.infer<typeof DataMediaTypeRequestSchema>;

/**
 * Response containing the detected media type and confidence
 */
export const DataMediaTypeResponseSchema = z.object({
    media_type: z.string().describe("Detected media type (MIME) of the file"),
    confidence: ConfidenceSchema.describe("Confidence in the detected media type"),
}).describe("Media type detection response");
export type DataMediaTypeResponse = z.infer<typeof DataMediaTypeResponseSchema>;
