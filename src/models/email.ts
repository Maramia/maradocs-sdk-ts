/**
 * Email parsing and validation models for the MaraDocs API.
 * @module email
 */
import { z } from "zod/v4";
import {
  UnvalidatedFileHandleSchema,
  Str255Schema,
  FileHandleSchema,
  SignedHashSchema,
  HtmlHandleSchema,
  PdfHandleSchema,
  type UnvalidatedFileHandle,
  type PdfHandle,
  type ImgHandle,
} from "./misc";
import { DataMediaTypeResponseSchema } from "./data";
import { PdfValidateResponseSchema, type PdfValidateResponse } from "./pdf";
import { ImgValidateResponseSchema, type ImgValidateResponse } from "./img";
import { ValidationErrorException, ValidationVirusException } from "./errors";

// ============================================================================
// Address Types
// ============================================================================

/**
 * Email address with optional display name.
 * @example { name: "John Doe", address: "john@example.com" }
 * @example { name: null, address: "noreply@example.com" }
 */
export const NamedAddressSchema = z
  .object({
    name: Str255Schema.nullable().describe("Display name (eg: 'John Doe')"),
    address: Str255Schema.describe("Email address (eg: 'john@example.com')"),
  })
  .describe("Email address with optional display name");
export type NamedAddress = z.infer<typeof NamedAddressSchema>;

// ============================================================================
// Email Attachment
// ============================================================================

/**
 * Attachment metadata for an email.
 * Includes file handle, media type, and optional validation results.
 */
export const EmailAttachmentSchema = z
  .object({
    class_name: z.literal("EmailAttachment"),
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe(
      "Handle to the attachment file"
    ),
    media_type: DataMediaTypeResponseSchema.describe(
      "Media type information for the attachment"
    ),
    validated: z
      .union([
        PdfValidateResponseSchema,
        ImgValidateResponseSchema,
        z.lazy((): z.ZodTypeAny => EmailValidateResponseSchema),
      ])
      .nullable()
      .describe(
        "PDF/IMG validation response. `null` if the attachment is not a PDF/IMG."
      ),
    name: Str255Schema.nullable().describe("Name of the attachment"),
    content_id: Str255Schema.nullable().describe(
      "Content ID of the attachment"
    ),
    content_disposition: Str255Schema.nullable().describe(
      "Content disposition of the attachment"
    ),
  })
  .describe("Email attachment");
export type EmailAttachment = z.infer<typeof EmailAttachmentSchema>;

// ============================================================================
// Email Handle
// ============================================================================

/**
 * Handle to a validated email in the workspace.
 * Contains parsed headers and references to body and attachments.
 */
export const EmailHandleSchema = z
  .object({
    class_name: z.literal("EmailHandle"),
    file_handle: FileHandleSchema,
    signed_hash: SignedHashSchema,
    from_addr: z
      .array(NamedAddressSchema)
      .describe("From addresses (can be empty)"),
    to_addr: z
      .array(NamedAddressSchema)
      .describe("To addresses (can be empty)"),
    cc_addr: z
      .array(NamedAddressSchema)
      .describe("CC addresses (can be empty)"),
    bcc_addr: z
      .array(NamedAddressSchema)
      .describe("BCC addresses (can be empty)"),
    date: Str255Schema.nullable().describe(
      "Date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS±HH:MM)"
    ),
    subject: Str255Schema.nullable().describe("Subject of the email"),
    text_body: UnvalidatedFileHandleSchema.nullable().describe(
      "Plain text body of the email"
    ),
    html_body: UnvalidatedFileHandleSchema.nullable().describe(
      "HTML body of the email"
    ),
    attachments: z
      .array(EmailAttachmentSchema)
      .describe("Attachments of the email"),
  })
  .describe("Handle to a validated email");
export type EmailHandle = z.infer<typeof EmailHandleSchema>;

// ============================================================================
// Email Validation Request/Response
// ============================================================================

/**
 * Request to validate an email file
 */
export const EmailValidateRequestSchema = z
  .object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe(
      "Handle to the unvalidated email file"
    ),
  })
  .describe("Email validation request");
export type EmailValidateRequest = z.input<typeof EmailValidateRequestSchema>;

/**
 * Email validation successful
 */
export const EmailValidateResponseOkSchema = z
  .object({
    class_name: z.literal("EmailValidateResponseOk"),
    email_handle: EmailHandleSchema.describe("Handle to the validated email"),
  })
  .describe("Successful email validation");
export type EmailValidateResponseOk = z.infer<
  typeof EmailValidateResponseOkSchema
>;

/**
 * Email validation failed due to some error
 */
export const EmailValidateResponseErrorSchema = z
  .object({
    class_name: z.literal("EmailValidateResponseError"),
    error: z.string().describe("Error message"),
  })
  .describe("Email validation error");
export type EmailValidateResponseError = z.infer<
  typeof EmailValidateResponseErrorSchema
>;

/**
 * Email validation failed due to virus detection
 */
export const EmailValidateResponseVirusSchema = z
  .object({
    class_name: z.literal("EmailValidateResponseVirus"),
    virus: z.string().describe("Virus detection message"),
  })
  .describe("Email validation - virus detected");
export type EmailValidateResponseVirus = z.infer<
  typeof EmailValidateResponseVirusSchema
>;

/**
 * Response to an email validation request (discriminated union)
 */
export const EmailValidateResponseSchema = z
  .object({
    class_name: z.literal("EmailValidateResponse"),
    response: z
      .discriminatedUnion("class_name", [
        EmailValidateResponseOkSchema,
        EmailValidateResponseErrorSchema,
        EmailValidateResponseVirusSchema,
      ])
      .describe("Validation result"),
  })
  .describe("Email validation response");
export type EmailValidateResponse = z.infer<typeof EmailValidateResponseSchema>;

// ============================================================================
// Validated Attachment Type (defined after EmailValidateResponse to avoid circular ref)
// ============================================================================

/**
 * Union type for validated attachment responses.
 * Attachments can be validated as PDF, Image, or nested Email.
 *
 * Note: This type is defined at the end of the file because it references
 * EmailValidateResponse which uses z.lazy() for circular schema support.
 */
export type ValidatedAttachment =
  | PdfValidateResponse
  | ImgValidateResponse
  | EmailValidateResponse;

// ============================================================================
// Email Rendering - Localization
// ============================================================================

/**
 * Supported locales for email template labels.
 */
export const LocaleSchema = z.enum([
  "en",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "nl",
  "pl",
]);
export type Locale = z.infer<typeof LocaleSchema>;

/**
 * Custom labels for the email template.
 * If provided, these labels take precedence over the locale-based labels.
 */
export const EmailTemplateLabelsSchema = z
  .object({
    from_label: Str255Schema.describe("Label for the 'From' field"),
    to_label: Str255Schema.describe("Label for the 'To' field"),
    cc_label: Str255Schema.describe("Label for the 'CC' field"),
    date_label: Str255Schema.describe("Label for the 'Date' field"),
  })
  .describe("Custom labels for the email template");
export type EmailTemplateLabels = z.infer<typeof EmailTemplateLabelsSchema>;

/**
 * Options for rendering an email to HTML format.
 *
 * Localization options:
 * - Provide `locale` to use predefined labels for that language
 * - Provide `labels` for fully custom labels (takes precedence over locale)
 */
export const EmailToHtmlOptionsSchema = z
  .object({
    locale: LocaleSchema.optional().describe(
      "Locale for template labels (e.g., 'en', 'de'). Ignored if `labels` is provided."
    ),
    labels: EmailTemplateLabelsSchema.optional().describe(
      "Custom labels for the email template. Takes precedence over `locale`."
    ),
  })
  .describe("Options for rendering an email to HTML format");
export type EmailToHtmlOptions = z.input<typeof EmailToHtmlOptionsSchema>;

// ============================================================================
// Email to HTML Request/Response
// ============================================================================

/**
 * Request to render an email to HTML format.
 */
export const EmailToHtmlRequestSchema = z
  .object({
    email_handle: EmailHandleSchema.describe(
      "Handle to the validated email to render"
    ),
    options: EmailToHtmlOptionsSchema.optional().describe(
      "Options for rendering the email to HTML format"
    ),
  })
  .describe("Request to render an email to HTML format");
export type EmailToHtmlRequest = z.input<typeof EmailToHtmlRequestSchema>;

/**
 * Response containing the rendered email as HTML.
 */
export const EmailToHtmlResponseSchema = z
  .object({
    html_handle: HtmlHandleSchema.describe("Handle to the rendered HTML file"),
  })
  .describe("Response containing the rendered email as HTML");
export type EmailToHtmlResponse = z.infer<typeof EmailToHtmlResponseSchema>;

// ============================================================================
// Email to PDF Request/Response
// ============================================================================

/**
 * Request to render an email to PDF format.
 */
export const EmailToPdfRequestSchema = z
  .object({
    email_handle: EmailHandleSchema.describe(
      "Handle to the validated email to render"
    ),
    options_html: EmailToHtmlOptionsSchema.optional().describe(
      "Options for rendering the email to HTML format"
    ),
  })
  .describe("Request to render an email to PDF format");
export type EmailToPdfRequest = z.input<typeof EmailToPdfRequestSchema>;

/**
 * Response containing the rendered email as PDF.
 */
export const EmailToPdfResponseSchema = z
  .object({
    pdf_handle: PdfHandleSchema.describe("Handle to the rendered PDF file"),
  })
  .describe("Response containing the rendered email as PDF");
export type EmailToPdfResponse = z.infer<typeof EmailToPdfResponseSchema>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Utility function to extract the email handle from a validation response.
 * Returns the email handle if validation was successful.
 * Throws ValidationErrorException if validation failed due to an error.
 * Throws ValidationVirusException if a virus was detected.
 * @param response - The email validation response
 * @returns The validated email handle
 * @throws {ValidationErrorException} If validation failed due to an error
 * @throws {ValidationVirusException} If a virus was detected
 */
export function okEmail(response: EmailValidateResponse): EmailHandle {
  if (response.response.class_name === "EmailValidateResponseOk") {
    return response.response.email_handle;
  } else if (response.response.class_name === "EmailValidateResponseError") {
    throw new ValidationErrorException(response.response.error);
  } else if (response.response.class_name === "EmailValidateResponseVirus") {
    throw new ValidationVirusException(response.response.virus);
  }
  throw new ValidationErrorException("Unknown validation response type");
}

// ============================================================================
// Email Tree Traversal Utilities
// ============================================================================

/**
 * Collects all UnvalidatedFileHandles from an email and its nested emails.
 * Includes text_body, html_body, and all attachment file handles.
 * @param email - The root email handle to traverse
 * @returns Array of all UnvalidatedFileHandles found in the email tree
 */
export function collectUnvalidatedFileHandles(
  email: EmailHandle
): UnvalidatedFileHandle[] {
  const handles: UnvalidatedFileHandle[] = [];

  // Collect from attachments
  for (const attachment of email.attachments) {
    handles.push(attachment.unvalidated_file_handle);

    // Recurse into nested emails
    const validated = attachment.validated as ValidatedAttachment | null;
    if (
      validated?.class_name === "EmailValidateResponse" &&
      validated.response.class_name === "EmailValidateResponseOk"
    ) {
      handles.push(
        ...collectUnvalidatedFileHandles(validated.response.email_handle)
      );
    }
  }

  return handles;
}

/**
 * Collects all PdfHandles from an email and its nested emails.
 * Only includes successfully validated PDFs.
 * @param email - The root email handle to traverse
 * @returns Array of all PdfHandles found in the email tree
 */
export function collectPdfHandles(email: EmailHandle): PdfHandle[] {
  const handles: PdfHandle[] = [];

  for (const attachment of email.attachments) {
    const validated = attachment.validated as ValidatedAttachment | null;
    if (validated) {
      if (
        validated.class_name === "PdfValidateResponse" &&
        validated.response.class_name === "PdfValidateResponseOk"
      ) {
        handles.push(validated.response.pdf_handle);
      } else if (
        validated.class_name === "EmailValidateResponse" &&
        validated.response.class_name === "EmailValidateResponseOk"
      ) {
        // Recurse into nested emails
        handles.push(...collectPdfHandles(validated.response.email_handle));
      }
    }
  }

  return handles;
}

/**
 * Collects all ImgHandles from an email and its nested emails.
 * Only includes successfully validated images.
 * @param email - The root email handle to traverse
 * @returns Array of all ImgHandles found in the email tree
 */
export function collectImgHandles(email: EmailHandle): ImgHandle[] {
  const handles: ImgHandle[] = [];

  for (const attachment of email.attachments) {
    const validated = attachment.validated as ValidatedAttachment | null;
    if (validated) {
      if (
        validated.class_name === "ImgValidateResponse" &&
        validated.response.class_name === "ImgValidateResponseOk"
      ) {
        handles.push(validated.response.img_handle);
      } else if (
        validated.class_name === "EmailValidateResponse" &&
        validated.response.class_name === "EmailValidateResponseOk"
      ) {
        // Recurse into nested emails
        handles.push(...collectImgHandles(validated.response.email_handle));
      }
    }
  }

  return handles;
}

/**
 * Collects all EmailHandles from an email tree (including the root).
 * Returns the root email and all nested emails that validated successfully.
 * @param email - The root email handle to traverse
 * @returns Array of all EmailHandles found in the email tree (root first)
 */
export function collectEmailHandles(email: EmailHandle): EmailHandle[] {
  const handles: EmailHandle[] = [email];

  for (const attachment of email.attachments) {
    const validated = attachment.validated as ValidatedAttachment | null;
    if (
      validated?.class_name === "EmailValidateResponse" &&
      validated.response.class_name === "EmailValidateResponseOk"
    ) {
      handles.push(...collectEmailHandles(validated.response.email_handle));
    }
  }

  return handles;
}
