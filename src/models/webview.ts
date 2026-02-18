/**
 * Webview models for interactive file viewing in the web app.
 * @module webview
 */
import { z } from "zod/v4";
import { FileHandleSchema, ImgHandleSchema, PdfHandleSchema } from "./misc";

// ============================================================================
// Webview Open
// ============================================================================

/**
 * Request to open a webview for interactive file processing
 */
export const WebviewOpenRequestSchema = z.object({
    language: z.literal("de").default("de").describe("Language of the webview. Default: 'de'"),
    allow_user_upload: z.boolean().default(true).describe("Allow user to upload files. Default: true"),
    allow_user_download: z.boolean().default(true).describe("Allow user to download files. Default: true"),
    with_files: z.array(FileHandleSchema).optional().describe(
        "Files to pre-load in the workspace. Default (null) loads all files."
    ),
}).describe("Webview open request");
export type WebviewOpenRequest = z.input<typeof WebviewOpenRequestSchema>;

/**
 * Response to a webview open request
 */
export const WebviewOpenResponseSchema = z.object({
    url: z.url().describe("URL of the webview to open in browser"),
}).describe("Webview open response");
export type WebviewOpenResponse = z.infer<typeof WebviewOpenResponseSchema>;

// ============================================================================
// Webview File Management
// ============================================================================

/**
 * Request to add a file to an open webview
 */
export const WebviewAddFileRequestSchema = z.object({
    file_handle: FileHandleSchema.describe("File to add to the webview"),
}).describe("Webview add file request");
export type WebviewAddFileRequest = z.infer<typeof WebviewAddFileRequestSchema>;

/**
 * Response to a file add request (empty for backwards compatibility)
 */
export const WebviewAddFileResponseSchema = z.object({}).describe("Webview add file response");
export type WebviewAddFileResponse = z.infer<typeof WebviewAddFileResponseSchema>;

// ============================================================================
// Webview Status
// ============================================================================

/**
 * Response to a webview status request
 */
export const WebviewStatusResponseSchema = z.object({
    status: z.enum(["open", "closed"]).describe("Current status of the webview"),
}).describe("Webview status response");
export type WebviewStatusResponse = z.infer<typeof WebviewStatusResponseSchema>;

// ============================================================================
// Webview Results
// ============================================================================

/**
 * Response containing the results of the webview session
 */
export const WebviewResultsResponseSchema = z.object({
    uploaded_pdfs: z.array(PdfHandleSchema).describe("List of PDF files uploaded by the user"),
    uploaded_imgs: z.array(ImgHandleSchema).describe("List of image files uploaded by the user"),
    processed_pdfs: z.array(PdfHandleSchema).describe("List of processed PDF files"),
}).describe("Webview results response");
export type WebviewResultsResponse = z.infer<typeof WebviewResultsResponseSchema>;
