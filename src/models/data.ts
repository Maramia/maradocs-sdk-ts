/**
 * Data upload and download models for file handling in the MaraDocs API.
 * @module data
 */
import { z } from "zod/v4";
import {
  AudioHandleSchema,
  PdfHandleSchema,
  JpegHandleSchema,
  PngHandleSchema,
  ConfidenceSchema,
  UnvalidatedFileHandleSchema,
  OdtHandleSchema,
  Str255Schema,
  VideoHandleSchema,
} from "./misc";
import {
  AudioContainerFormatSchema,
  AudioFlacCompressionLevelSchema,
  AudioMp3BitrateSchema,
  AudioWavBitDepthSchema,
} from "./audio";
import {
  VideoAudioBitrateSchema,
  VideoAudioCodecSchema,
  VideoConstantFrameRateSchema,
  VideoContainerFormatSchema,
} from "./video";

const DEFAULT_EXPIRATION_TIME = 60 * 5; //  5 minutes
const MAX_EXPIRATION_TIME = 60 * 60; // 1 hour
const ExpirationTimeSchema = z
  .number()
  .int()
  .positive()
  .max(MAX_EXPIRATION_TIME)
  .default(DEFAULT_EXPIRATION_TIME)
  .optional()
  .describe("Number of seconds until the download URL expires (max 1 hour)");

const PROXY_THIRD_PARTY_WARNING =
  "When the uploader/downloader is an unauthenticated third party (or any client that must not learn the workspace encryption key), you HAVE TO USE proxy_url and MUST NOT forward post_header/headers to that party.";

const UseProxySchema = z
  .boolean()
  .optional()
  .describe(
    `If true, also mint a proxy_url that does not require SSE-C headers. ${PROXY_THIRD_PARTY_WARNING}`,
  );

const ProxyUrlSchema = z
  .string()
  .nullish()
  .describe(
    `Encrypting/decrypting proxy URL (no SSE-C headers required). Required for unauthenticated third parties. ${PROXY_THIRD_PARTY_WARNING}`,
  );

const DownloadResponseFields = {
  url: z.url().describe("Presigned GET URL to download the file (first-party; requires headers)"),
  headers: z
    .record(z.string(), z.string())
    .describe(
      `SSE-C headers for the GET request (contains encryption key; first-party only). ${PROXY_THIRD_PARTY_WARNING}`,
    ),
  proxy_url: ProxyUrlSchema,
};
// ============================================================================
// Upload
// ============================================================================

/**
 * Request to upload a file to the workspace
 */
export const DataUploadRequestSchema = z
  .object({
    name: Str255Schema.optional().describe("Name of the file"),
    size: z.number().int().positive().describe("Size of the file in bytes"),
    use_proxy: UseProxySchema,
  })
  .describe("File upload request");
export type DataUploadRequest = z.infer<typeof DataUploadRequestSchema>;

/**
 * Response to a file upload request containing presigned URL and headers
 */
export const DataUploadResponseSchema = z
  .object({
    post_url: z.string().describe("Presigned POST URL for file upload (first-party)"),
    post_header: z
      .record(z.string(), z.string())
      .describe(
        `Form fields for the presigned POST, including SSE-C key material (first-party only). ${PROXY_THIRD_PARTY_WARNING}`,
      ),
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe(
      "Handle to the uploaded file",
    ),
    proxy_url: ProxyUrlSchema,
  })
  .describe("File upload response");
export type DataUploadResponse = z.infer<typeof DataUploadResponseSchema>;

// ============================================================================
// Download - PDF
// ============================================================================

/**
 * Request to download a PDF file from the workspace
 */
export const DataDownloadPdfRequestSchema = z
  .object({
    pdf_handle: PdfHandleSchema.describe("Handle to the PDF file to download"),
    expires_in: ExpirationTimeSchema,
    use_proxy: UseProxySchema,
  })
  .describe("PDF download request");
export type DataDownloadPdfRequest = z.infer<
  typeof DataDownloadPdfRequestSchema
>;

/**
 * Response to a PDF download request
 */
export const DataDownloadPdfResponseSchema = z
  .object({
    ...DownloadResponseFields,
  })
  .describe("PDF download response");
export type DataDownloadPdfResponse = z.infer<
  typeof DataDownloadPdfResponseSchema
>;

// ============================================================================
// Download - MP4
// ============================================================================

/**
 * Request to export and download an MP4 video from the workspace
 */
export const DataDownloadMp4RequestSchema = z
  .object({
    video_handle: VideoHandleSchema.describe(
      "Handle to the validated internal video file",
    ),
    constant_frame_rate: VideoConstantFrameRateSchema.default("CFR24").describe(
      "Target CFR for the output video",
    ),
    audio_codec: VideoAudioCodecSchema.default("aac").describe(
      "Audio codec for the output",
    ),
    audio_bitrate: VideoAudioBitrateSchema.default("CBR128K").describe(
      "Audio bitrate for the output",
    ),
    format: VideoContainerFormatSchema.default("mp4").describe(
      "Output container format (currently only mp4)",
    ),
    expires_in: ExpirationTimeSchema,
    use_proxy: UseProxySchema,
  })
  .describe("MP4 download request");
export type DataDownloadMp4Request = z.input<typeof DataDownloadMp4RequestSchema>;

/**
 * Response to an MP4 download request
 */
export const DataDownloadMp4ResponseSchema = z
  .object({
    ...DownloadResponseFields,
  })
  .describe("MP4 download response");
export type DataDownloadMp4Response = z.infer<
  typeof DataDownloadMp4ResponseSchema
>;

// ============================================================================
// Download - MP3
// ============================================================================

export const DataDownloadMp3RequestSchema = z
  .object({
    audio_handle: AudioHandleSchema.describe(
      "Handle to the validated internal audio file",
    ),
    bitrate: AudioMp3BitrateSchema.default("CBR192K").describe(
      "Target MP3 bitrate",
    ),
    format: AudioContainerFormatSchema.default("mp3").describe(
      "Output container format (mp3)",
    ),
    expires_in: ExpirationTimeSchema,
    use_proxy: UseProxySchema,
  })
  .describe("MP3 download request");
export type DataDownloadMp3Request = z.input<typeof DataDownloadMp3RequestSchema>;

export const DataDownloadMp3ResponseSchema = z
  .object({
    ...DownloadResponseFields,
  })
  .describe("MP3 download response");
export type DataDownloadMp3Response = z.infer<
  typeof DataDownloadMp3ResponseSchema
>;

// ============================================================================
// Download - WAV
// ============================================================================

export const DataDownloadWavRequestSchema = z
  .object({
    audio_handle: AudioHandleSchema.describe(
      "Handle to the validated internal audio file",
    ),
    bit_depth: AudioWavBitDepthSchema.default("S16").describe(
      "Target WAV bit depth",
    ),
    format: AudioContainerFormatSchema.default("wav").describe(
      "Output container format (wav)",
    ),
    expires_in: ExpirationTimeSchema,
    use_proxy: UseProxySchema,
  })
  .describe("WAV download request");
export type DataDownloadWavRequest = z.input<typeof DataDownloadWavRequestSchema>;

export const DataDownloadWavResponseSchema = z
  .object({
    ...DownloadResponseFields,
  })
  .describe("WAV download response");
export type DataDownloadWavResponse = z.infer<
  typeof DataDownloadWavResponseSchema
>;

// ============================================================================
// Download - FLAC
// ============================================================================

export const DataDownloadFlacRequestSchema = z
  .object({
    audio_handle: AudioHandleSchema.describe(
      "Handle to the validated internal audio file",
    ),
    compression_level: AudioFlacCompressionLevelSchema.default(5).describe(
      "Target FLAC compression level",
    ),
    format: AudioContainerFormatSchema.default("flac").describe(
      "Output container format (flac)",
    ),
    expires_in: ExpirationTimeSchema,
    use_proxy: UseProxySchema,
  })
  .describe("FLAC download request");
export type DataDownloadFlacRequest = z.input<
  typeof DataDownloadFlacRequestSchema
>;

export const DataDownloadFlacResponseSchema = z
  .object({
    ...DownloadResponseFields,
  })
  .describe("FLAC download response");
export type DataDownloadFlacResponse = z.infer<
  typeof DataDownloadFlacResponseSchema
>;

// ============================================================================
// Download - JPEG
// ============================================================================

/**
 * Request to download a JPEG file from the workspace
 */
export const DataDownloadJpegRequestSchema = z
  .object({
    jpeg_handle: JpegHandleSchema.describe(
      "Handle to the JPEG file to download",
    ),
    expires_in: ExpirationTimeSchema,
    use_proxy: UseProxySchema,
  })
  .describe("JPEG download request");
export type DataDownloadJpegRequest = z.infer<
  typeof DataDownloadJpegRequestSchema
>;

/**
 * Response to a JPEG download request
 */
export const DataDownloadJpegResponseSchema = z
  .object({
    ...DownloadResponseFields,
  })
  .describe("JPEG download response");
export type DataDownloadJpegResponse = z.infer<
  typeof DataDownloadJpegResponseSchema
>;

// ============================================================================
// Download - PNG
// ============================================================================

/**
 * Request to download a PNG file from the workspace
 */
export const DataDownloadPngRequestSchema = z
  .object({
    png_handle: PngHandleSchema.describe("Handle to the PNG file to download"),
    expires_in: ExpirationTimeSchema,
    use_proxy: UseProxySchema,
  })
  .describe("PNG download request");
export type DataDownloadPngRequest = z.infer<
  typeof DataDownloadPngRequestSchema
>;

/**
 * Response to a PNG download request
 */
export const DataDownloadPngResponseSchema = z
  .object({
    ...DownloadResponseFields,
  })
  .describe("PNG download response");
export type DataDownloadPngResponse = z.infer<
  typeof DataDownloadPngResponseSchema
>;

// ============================================================================
// Download - ODT
// ============================================================================

/**
 * Request to download an ODT file from the workspace
 */
export const DataDownloadOdtRequestSchema = z
  .object({
    odt_handle: OdtHandleSchema.describe("Handle to the ODT file to download"),
    expires_in: ExpirationTimeSchema,
    use_proxy: UseProxySchema,
  })
  .describe("ODT download request");
export type DataDownloadOdtRequest = z.infer<
  typeof DataDownloadOdtRequestSchema
>;

/**
 * Response to an ODT download request
 */
export const DataDownloadOdtResponseSchema = z
  .object({
    ...DownloadResponseFields,
  })
  .describe("ODT download response");
export type DataDownloadOdtResponse = z.infer<
  typeof DataDownloadOdtResponseSchema
>;

// ============================================================================
// Download - Unvalidated
// ============================================================================

/**
 * Request to download a binary file that has not been validated yet
 */
export const DataDownloadUnvalidatedRequestSchema = z
  .object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe(
      "Handle to the unvalidated file",
    ),
    expires_in: ExpirationTimeSchema,
    use_proxy: UseProxySchema,
  })
  .describe("Unvalidated file download request");
export type DataDownloadUnvalidatedRequest = z.infer<
  typeof DataDownloadUnvalidatedRequestSchema
>;

/**
 * Response to an unvalidated file download request
 */
export const DataDownloadUnvalidatedResponseSchema = z
  .object({
    ...DownloadResponseFields,
  })
  .describe("Unvalidated file download response");
export type DataDownloadUnvalidatedResponse = z.infer<
  typeof DataDownloadUnvalidatedResponseSchema
>;

// ============================================================================
// Media Type Detection
// ============================================================================

/**
 * Request to determine the media type (MIME) of a file
 */
export const DataMediaTypeRequestSchema = z
  .object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema,
  })
  .describe("Media type detection request");
export type DataMediaTypeRequest = z.infer<typeof DataMediaTypeRequestSchema>;

/**
 * Response containing the detected media type and confidence
 */
export const DataMediaTypeResponseSchema = z
  .object({
    media_type: z.string().describe("Detected media type (MIME) of the file"),
    confidence: ConfidenceSchema.describe(
      "Confidence in the detected media type",
    ),
  })
  .describe("Media type detection response");
export type DataMediaTypeResponse = z.infer<typeof DataMediaTypeResponseSchema>;

// ============================================================================
// Virus Scan
// ============================================================================

/**
 * Request to scan a file for viruses
 */
export const VirusScanRequestSchema = z
  .object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe(
      "Handle to the file to scan",
    ),
  })
  .describe("Virus scan request");
export type VirusScanRequest = z.infer<typeof VirusScanRequestSchema>;

/**
 * Response to the virus scan request
 */
export const VirusScanResponseSchema = z
  .object({
    virus_found: z.boolean().describe("Whether a virus was found"),
    virus_info: z
      .string()
      .nullish()
      .describe("Information about the virus, if found"),
  })
  .describe("Virus scan response");
export type VirusScanResponse = z.infer<typeof VirusScanResponseSchema>;
