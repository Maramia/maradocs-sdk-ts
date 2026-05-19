/**
 * Audio processing models for the MaraDocs API.
 * @module audio
 */
import { z } from "zod/v4";
import {
  AudioMetadataSchema,
  UnvalidatedFileHandleSchema,
  AudioHandleSchema,
  type AudioHandle,
} from "./misc";
import { ValidationErrorException, ValidationVirusException } from "./errors";

export const AudioCodecSchema = z
  .enum(["mp3", "wav", "flac"])
  .describe("Audio codec used in exported files");
export type AudioCodec = z.infer<typeof AudioCodecSchema>;

export const AudioContainerFormatSchema = z
  .enum(["mp3", "wav", "flac"])
  .describe("Container format used for exported audio files");
export type AudioContainerFormat = z.infer<typeof AudioContainerFormatSchema>;

export const AudioMp3BitrateSchema = z
  .enum(["CBR128K", "CBR192K"])
  .describe("CBR bitrate presets for MP3 export");
export type AudioMp3Bitrate = z.infer<typeof AudioMp3BitrateSchema>;

export const AudioWavBitDepthSchema = z
  .enum(["S16", "S24"])
  .describe("PCM bit depth presets for WAV export");
export type AudioWavBitDepth = z.infer<typeof AudioWavBitDepthSchema>;

export const AudioFlacCompressionLevelSchema = z
  .union([z.literal(5), z.literal(8)])
  .describe("Discrete FLAC compression presets");
export type AudioFlacCompressionLevel = z.infer<
  typeof AudioFlacCompressionLevelSchema
>;

export const AudioValidateRequestSchema = z
  .object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe(
      "Handle to the unvalidated file",
    ),
  })
  .describe("Audio validation request");
export type AudioValidateRequest = z.infer<typeof AudioValidateRequestSchema>;

export const AudioValidateResponseOkSchema = z
  .object({
    class_name: z.literal("AudioValidateResponseOk"),
    audio_handle: AudioHandleSchema.describe("Handle to the validated audio"),
  })
  .describe("Successful audio validation");

export const AudioValidateResponseErrorSchema = z
  .object({
    class_name: z.literal("AudioValidateResponseError"),
    error: z.string().describe("Error message"),
  })
  .describe("Audio validation error");

export const AudioValidateResponseVirusSchema = z
  .object({
    class_name: z.literal("AudioValidateResponseVirus"),
    virus: z.string().describe("Virus scan message"),
  })
  .describe("Audio validation - virus detected");

export const AudioValidateResponseSchema = z
  .object({
    class_name: z.literal("AudioValidateResponse"),
    source_audio_metadata: AudioMetadataSchema
      .nullable()
      .describe("Source metadata for the validated audio stream"),
    response: z
      .discriminatedUnion("class_name", [
        AudioValidateResponseOkSchema,
        AudioValidateResponseErrorSchema,
        AudioValidateResponseVirusSchema,
      ])
      .describe("Validation result"),
  })
  .describe("Audio validation response");

export type AudioValidateResponseOk = z.infer<typeof AudioValidateResponseOkSchema>;
export type AudioValidateResponseError = z.infer<
  typeof AudioValidateResponseErrorSchema
>;
export type AudioValidateResponseVirus = z.infer<
  typeof AudioValidateResponseVirusSchema
>;
export type AudioValidateResponse = z.infer<typeof AudioValidateResponseSchema>;

export function okAudio(response: AudioValidateResponse): AudioHandle {
  if (response.response.class_name === "AudioValidateResponseOk") {
    return response.response.audio_handle;
  }
  if (response.response.class_name === "AudioValidateResponseError") {
    throw new ValidationErrorException(response.response.error);
  }
  if (response.response.class_name === "AudioValidateResponseVirus") {
    throw new ValidationVirusException(response.response.virus);
  }
  throw new ValidationErrorException("Unknown validation response type");
}
