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
} from "./misc";
import { DataMediaTypeResponseSchema } from "./data";
import { PdfValidateResponseSchema } from "./pdf";
import { ImgValidateResponseSchema } from "./img";

// ============================================================================
// Address Types
// ============================================================================

/**
 * Email address with optional display name.
 * Format: [name | null, address] where name is optional
 * @example ["John Doe", "john@example.com"]
 * @example [null, "noreply@example.com"]
 */
export const NamedAddressSchema = z.tuple([
    Str255Schema.optional().nullable().describe("Display name (optional)"),
    Str255Schema.describe("Email address"),
]).describe("Email address with optional display name");
export type NamedAddress = z.infer<typeof NamedAddressSchema>;

// ============================================================================
// Email Attachment
// ============================================================================

/**
 * Attachment metadata for an email.
 * Includes file handle, media type, and optional validation results.
 */
export const EmailAttachmentSchema = z.object({
    class_name: z.literal("EmailAttachment"),
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe("Handle to the attachment file"),
    media_type: DataMediaTypeResponseSchema.describe("Media type information for the attachment"),
    validated: z.union([
        PdfValidateResponseSchema,
        ImgValidateResponseSchema,
        z.lazy((): z.ZodTypeAny => EmailValidateResponseSchema),
    ]).nullable().optional().describe("Validation response if attachment is PDF/IMG/Email, null otherwise"),
    name: Str255Schema.optional().nullable().describe("Name of the attachment"),
    content_id: Str255Schema.optional().nullable().describe("Content ID of the attachment"),
    content_disposition: Str255Schema.optional().nullable().describe("Content disposition of the attachment"),
}).describe("Email attachment");
export type EmailAttachment = z.infer<typeof EmailAttachmentSchema>;

// ============================================================================
// Email Handle
// ============================================================================

/**
 * Handle to a validated email in the workspace.
 * Contains parsed headers and references to body and attachments.
 */
export const EmailHandleSchema = z.object({
    class_name: z.literal("EmailHandle"),
    file_handle: FileHandleSchema,
    signed_hash: SignedHashSchema,
    from_addr: z.union([
        z.array(NamedAddressSchema),
        Str255Schema,
    ]).nullable().describe("From addresses (can be zero, one or more)"),
    to_addr: z.union([
        z.array(NamedAddressSchema),
        Str255Schema,
    ]).nullable().describe("To addresses (can be zero, one or more)"),
    cc_addr: z.union([
        z.array(NamedAddressSchema),
        Str255Schema,
    ]).nullable().describe("CC addresses (can be zero, one or more)"),
    bcc_addr: z.union([
        z.array(NamedAddressSchema),
        Str255Schema,
    ]).nullable().describe("BCC addresses (can be zero, one or more)"),
    date: Str255Schema.optional().nullable().describe("Date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS±HH:MM)"),
    subject: Str255Schema.optional().nullable().describe("Subject of the email"),
    text_body: UnvalidatedFileHandleSchema.optional().nullable().describe("Plain text body of the email"),
    html_body: UnvalidatedFileHandleSchema.optional().nullable().describe("HTML body of the email"),
    attachments: z.array(EmailAttachmentSchema).describe("Attachments of the email"),
}).describe("Handle to a validated email");
export type EmailHandle = z.infer<typeof EmailHandleSchema>;

// ============================================================================
// Email Validation Request/Response
// ============================================================================

/**
 * Request to validate an email file
 */
export const EmailValidateRequestSchema = z.object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe("Handle to the unvalidated email file"),
    limit_attachments: z.number().int().positive().default(50).describe(
        "Limit the number of attachments to validate. Default: 50"
    ),
}).describe("Email validation request");
export type EmailValidateRequest = z.input<typeof EmailValidateRequestSchema>;

/**
 * Email validation successful
 */
export const EmailValidateResponseOkSchema = z.object({
    class_name: z.literal("EmailValidateResponseOk"),
    email_handle: EmailHandleSchema.describe("Handle to the validated email"),
}).describe("Successful email validation");
export type EmailValidateResponseOk = z.infer<typeof EmailValidateResponseOkSchema>;

/**
 * Email validation failed due to some error
 */
export const EmailValidateResponseErrorSchema = z.object({
    class_name: z.literal("EmailValidateResponseError"),
    error: z.string().describe("Error message"),
}).describe("Email validation error");
export type EmailValidateResponseError = z.infer<typeof EmailValidateResponseErrorSchema>;

/**
 * Email validation failed due to virus detection
 */
export const EmailValidateResponseVirusSchema = z.object({
    class_name: z.literal("EmailValidateResponseVirus"),
    virus: z.string().describe("Virus detection message"),
}).describe("Email validation - virus detected");
export type EmailValidateResponseVirus = z.infer<typeof EmailValidateResponseVirusSchema>;

/**
 * Response to an email validation request (discriminated union)
 */
export const EmailValidateResponseSchema = z.object({
    class_name: z.literal("EmailValidateResponse"),
    response: z.discriminatedUnion("class_name", [
        EmailValidateResponseOkSchema,
        EmailValidateResponseErrorSchema,
        EmailValidateResponseVirusSchema,
    ]).describe("Validation result"),
}).describe("Email validation response");
export type EmailValidateResponse = z.infer<typeof EmailValidateResponseSchema>;
