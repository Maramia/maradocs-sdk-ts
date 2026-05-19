/**
 * Video processing models for the MaraDocs API.
 * @module video
 */
import { z } from "zod/v4";
import {
  AudioMetadataSchema,
  UnvalidatedFileHandleSchema,
  VideoHandleSchema,
  VideoMetadataSchema,
  type VideoHandle,
} from "./misc";
import { ValidationErrorException, ValidationVirusException } from "./errors";

export const VideoConstantFrameRateSchema = z
  .enum(["CFR24", "CFR30"])
  .describe("Target constant frame rate for transcoded output");
export type VideoConstantFrameRate = z.infer<typeof VideoConstantFrameRateSchema>;

export const VideoAudioCodecSchema = z
  .enum(["aac"])
  .describe("Audio codec for transcoded output");
export type VideoAudioCodec = z.infer<typeof VideoAudioCodecSchema>;

export const VideoAudioBitrateSchema = z
  .enum(["CBR128K", "CBR256K"])
  .describe("Audio bitrate (CBR) for transcoded output");
export type VideoAudioBitrate = z.infer<typeof VideoAudioBitrateSchema>;

export const VideoContainerFormatSchema = z
  .enum(["mp4"])
  .describe("Output container format (currently only mp4)");
export type VideoContainerFormat = z.infer<typeof VideoContainerFormatSchema>;

/**
 * Request to validate and standardize a video file.
 */
export const VideoValidateRequestSchema = z
  .object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe(
      "Handle to the unvalidated file",
    ),
  })
  .describe("Video validation request");
export type VideoValidateRequest = z.infer<typeof VideoValidateRequestSchema>;

export const VideoValidateResponseOkSchema = z
  .object({
    class_name: z.literal("VideoValidateResponseOk"),
    video_handle: VideoHandleSchema.describe("Handle to the validated MP4"),
  })
  .describe("Successful video validation");

export const VideoValidateResponseErrorSchema = z
  .object({
    class_name: z.literal("VideoValidateResponseError"),
    error: z.string().describe("Error message"),
  })
  .describe("Video validation error");

export const VideoValidateResponseVirusSchema = z
  .object({
    class_name: z.literal("VideoValidateResponseVirus"),
    virus: z.string().describe("Virus scan message"),
  })
  .describe("Video validation - virus detected");

export const VideoValidateResponseSchema = z
  .object({
    class_name: z.literal("VideoValidateResponse"),
    source_video_metadata: VideoMetadataSchema
      .nullable()
      .describe("Source metadata for the validated video's video stream"),
    source_audio_metadata: AudioMetadataSchema
      .nullable()
      .describe("Source metadata for the validated video's audio stream"),
    response: z
      .discriminatedUnion("class_name", [
        VideoValidateResponseOkSchema,
        VideoValidateResponseErrorSchema,
        VideoValidateResponseVirusSchema,
      ])
      .describe("Validation result"),
  })
  .describe("Video validation response");

export type VideoValidateResponseOk = z.infer<typeof VideoValidateResponseOkSchema>;
export type VideoValidateResponseError = z.infer<
  typeof VideoValidateResponseErrorSchema
>;
export type VideoValidateResponseVirus = z.infer<
  typeof VideoValidateResponseVirusSchema
>;
export type VideoValidateResponse = z.infer<typeof VideoValidateResponseSchema>;

/**
 * Extract the video handle from a validation response.
 * @throws {ValidationErrorException} If validation failed due to an error
 * @throws {ValidationVirusException} If a virus was detected
 */
export function okVideo(response: VideoValidateResponse): VideoHandle {
  if (response.response.class_name === "VideoValidateResponseOk") {
    return response.response.video_handle;
  }
  if (response.response.class_name === "VideoValidateResponseError") {
    throw new ValidationErrorException(response.response.error);
  }
  if (response.response.class_name === "VideoValidateResponseVirus") {
    throw new ValidationVirusException(response.response.virus);
  }
  throw new ValidationErrorException("Unknown validation response type");
}
