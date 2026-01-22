/**
 * HTML validation and conversion models for the MaraDocs API.
 * @module html
 */
import { z } from "zod/v4";
import {
    HtmlHandleSchema,
    PdfHandleSchema,
    UnvalidatedFileHandleSchema,
} from "./misc";

// ============================================================================
// HTML Validation
// ============================================================================

/**
 * Request to validate an HTML file
 */
export const HtmlValidateRequestSchema = z.object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe("Handle to the unvalidated HTML file"),
}).describe("HTML validation request");
export type HtmlValidateRequest = z.infer<typeof HtmlValidateRequestSchema>;

/**
 * HTML validation successful
 */
export const HtmlValidateResponseOkSchema = z.object({
    class_name: z.literal("HtmlValidateResponseOk"),
    html_handle: HtmlHandleSchema.describe("Handle to the validated HTML"),
}).describe("Successful HTML validation");
export type HtmlValidateResponseOk = z.infer<typeof HtmlValidateResponseOkSchema>;

/**
 * HTML validation failed due to some error (e.g., decoding error)
 */
export const HtmlValidateResponseErrorSchema = z.object({
    class_name: z.literal("HtmlValidateResponseError"),
    error: z.string().describe("Error message"),
}).describe("HTML validation error");
export type HtmlValidateResponseError = z.infer<typeof HtmlValidateResponseErrorSchema>;

/**
 * HTML validation failed due to virus detection
 */
export const HtmlValidateResponseVirusSchema = z.object({
    class_name: z.literal("HtmlValidateResponseVirus"),
    virus: z.string().describe("Virus scan message"),
}).describe("HTML validation - virus detected");
export type HtmlValidateResponseVirus = z.infer<typeof HtmlValidateResponseVirusSchema>;

/**
 * Response to an HTML validation request (discriminated union)
 */
export const HtmlValidateResponseSchema = z.object({
    class_name: z.literal("HtmlValidateResponse"),
    response: z.discriminatedUnion("class_name", [
        HtmlValidateResponseOkSchema,
        HtmlValidateResponseErrorSchema,
        HtmlValidateResponseVirusSchema,
    ]).describe("Validation result"),
}).describe("HTML validation response");
export type HtmlValidateResponse = z.infer<typeof HtmlValidateResponseSchema>;

// ============================================================================
// HTML to PDF Conversion
// ============================================================================

/**
 * Request to convert an HTML file to PDF format
 */
export const HtmlToPdfRequestSchema = z.object({
    html_handle: HtmlHandleSchema.describe("Handle to the HTML to convert"),
}).describe("HTML to PDF conversion request");
export type HtmlToPdfRequest = z.infer<typeof HtmlToPdfRequestSchema>;

/**
 * Response to an HTML to PDF conversion request
 */
export const HtmlToPdfResponseSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the converted PDF file"),
}).describe("HTML to PDF conversion response");
export type HtmlToPdfResponse = z.infer<typeof HtmlToPdfResponseSchema>;
