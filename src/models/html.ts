/**
 * HTML validation and conversion models for the MaraDocs API.
 * @module html
 */
import { z } from "zod/v4";
import {
  HtmlHandleSchema,
  PdfHandleSchema,
  UnvalidatedFileHandleSchema,
  type HtmlHandle,
} from "./misc";
import { ValidationErrorException, ValidationVirusException } from "./errors";

// ============================================================================
// HTML Validation
// ============================================================================

/**
 * Request to validate an HTML file
 */
export const HtmlValidateRequestSchema = z
  .object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe(
      "Handle to the unvalidated HTML file",
    ),
  })
  .describe("HTML validation request");
export type HtmlValidateRequest = z.infer<typeof HtmlValidateRequestSchema>;

/**
 * HTML validation successful
 */
export const HtmlValidateResponseOkSchema = z
  .object({
    class_name: z.literal("HtmlValidateResponseOk"),
    html_handle: HtmlHandleSchema.describe("Handle to the validated HTML"),
  })
  .describe("Successful HTML validation");
export type HtmlValidateResponseOk = z.infer<
  typeof HtmlValidateResponseOkSchema
>;

/**
 * HTML validation failed due to some error (e.g., decoding error)
 */
export const HtmlValidateResponseErrorSchema = z
  .object({
    class_name: z.literal("HtmlValidateResponseError"),
    error: z.string().describe("Error message"),
  })
  .describe("HTML validation error");
export type HtmlValidateResponseError = z.infer<
  typeof HtmlValidateResponseErrorSchema
>;

/**
 * HTML validation failed due to virus detection
 */
export const HtmlValidateResponseVirusSchema = z
  .object({
    class_name: z.literal("HtmlValidateResponseVirus"),
    virus: z.string().describe("Virus scan message"),
  })
  .describe("HTML validation - virus detected");
export type HtmlValidateResponseVirus = z.infer<
  typeof HtmlValidateResponseVirusSchema
>;

/**
 * Response to an HTML validation request (discriminated union)
 */
export const HtmlValidateResponseSchema = z
  .object({
    class_name: z.literal("HtmlValidateResponse"),
    response: z
      .discriminatedUnion("class_name", [
        HtmlValidateResponseOkSchema,
        HtmlValidateResponseErrorSchema,
        HtmlValidateResponseVirusSchema,
      ])
      .describe("Validation result"),
  })
  .describe("HTML validation response");
export type HtmlValidateResponse = z.infer<typeof HtmlValidateResponseSchema>;

// ============================================================================
// HTML to PDF Conversion
// ============================================================================

/**
 * Request to convert an HTML file to PDF format
 */
export const HtmlToPdfRequestSchema = z
  .object({
    html_handle: HtmlHandleSchema.describe("Handle to the HTML to convert"),
  })
  .describe("HTML to PDF conversion request");
export type HtmlToPdfRequest = z.infer<typeof HtmlToPdfRequestSchema>;

/**
 * Response to an HTML to PDF conversion request
 */
export const HtmlToPdfResponseSchema = z
  .object({
    pdf_handle: PdfHandleSchema.describe("Handle to the converted PDF file"),
  })
  .describe("HTML to PDF conversion response");
export type HtmlToPdfResponse = z.infer<typeof HtmlToPdfResponseSchema>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Utility function to extract the HTML handle from a validation response.
 * Returns the HTML handle if validation was successful.
 * Throws ValidationErrorException if validation failed due to an error.
 * Throws ValidationVirusException if a virus was detected.
 * @param response - The HTML validation response
 * @returns The validated HTML handle
 * @throws {ValidationErrorException} If validation failed due to an error
 * @throws {ValidationVirusException} If a virus was detected
 */
export function okHtml(response: HtmlValidateResponse): HtmlHandle {
  if (response.response.class_name === "HtmlValidateResponseOk") {
    return response.response.html_handle;
  } else if (response.response.class_name === "HtmlValidateResponseError") {
    throw new ValidationErrorException(response.response.error);
  } else if (response.response.class_name === "HtmlValidateResponseVirus") {
    throw new ValidationVirusException(response.response.virus);
  }
  throw new ValidationErrorException("Unknown validation response type");
}
