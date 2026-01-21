/**
 * Image processing and conversion models for the MaraDocs API.
 * @module img
 */
import { z } from "zod";
import {
    ImgHandleSchema,
    PngHandleSchema,
    JpegHandleSchema,
    PdfHandleSchema,
    ConfidenceSchema,
    DiscreteAngleSchema,
    PdfImgColorSchema,
    PdfImgQualitySchema,
    PdfPageSizeSchema,
    DPISchema,
    OdtHandleSchema,
    UnvalidatedFileHandleSchema
} from "./misc";

// ============================================================================
// Position and Geometry Types
// ============================================================================

/**
 * Position of the image in a blank PDF page
 */
export const PdfImgPositionSchema = z.enum(["center"]).describe("Position of image in blank page");
export type PdfImgPosition = z.infer<typeof PdfImgPositionSchema>;

/**
 * Relative position in an image (0.0 to 1.0 for both x and y)
 */
export const RelativePositionSchema = z.object({
    x: z.number().min(0.0).max(1.0).describe("Relative position on the x-axis (0.0 to 1.0)"),
    y: z.number().min(0.0).max(1.0).describe("Relative position on the y-axis (0.0 to 1.0)"),
}).describe("Relative position within an image");
export type RelativePosition = z.infer<typeof RelativePositionSchema>;

/**
 * Quadrilateral defined by four corner points.
 * Points must be in correct positions (top-left, top-right, bottom-right, bottom-left).
 */
export const QuadrilateralSchema = z.object({
    top_left: RelativePositionSchema.describe("Top-left point"),
    top_right: RelativePositionSchema.describe("Top-right point"),
    bottom_right: RelativePositionSchema.describe("Bottom-right point"),
    bottom_left: RelativePositionSchema.describe("Bottom-left point"),
}).refine((data) => {
    return data.top_left.x <= data.top_right.x &&
        data.bottom_left.x <= data.bottom_right.x &&
        data.top_left.y <= data.bottom_left.y &&
        data.top_right.y <= data.bottom_right.y;
}, {
    message: "Quadrilateral points are not in correct positions",
}).describe("Quadrilateral with four corner points");
export type Quadrilateral = z.infer<typeof QuadrilateralSchema>;

// ============================================================================
// Image Validation
// ============================================================================

/**
 * Request to validate an image file
 */
export const ImgValidateRequestSchema = z.object({
    unvalidated_file_handle: UnvalidatedFileHandleSchema.describe("Handle to the unvalidated image file"),
}).describe("Image validation request");
export type ImgValidateRequest = z.infer<typeof ImgValidateRequestSchema>;

/**
 * Image validation successful
 */
export const ImgValidateResponseOkSchema = z.object({
    class_name: z.literal("ImgValidateResponseOk"),
    img_handle: ImgHandleSchema.describe("Handle to the validated image"),
}).describe("Successful image validation");
export type ImgValidateResponseOk = z.infer<typeof ImgValidateResponseOkSchema>;

/**
 * Image validation failed due to some error
 */
export const ImgValidateResponseErrorSchema = z.object({
    class_name: z.literal("ImgValidateResponseError"),
    error: z.string().describe("Error message"),
}).describe("Image validation error");
export type ImgValidateResponseError = z.infer<typeof ImgValidateResponseErrorSchema>;

/**
 * Image validation failed due to virus detection
 */
export const ImgValidateResponseVirusSchema = z.object({
    class_name: z.literal("ImgValidateResponseVirus"),
    virus: z.string().describe("Virus scan message"),
}).describe("Image validation - virus detected");
export type ImgValidateResponseVirus = z.infer<typeof ImgValidateResponseVirusSchema>;

/**
 * Response to an image validation request (discriminated union)
 */
export const ImgValidateResponseSchema = z.object({
    class_name: z.literal("ImgValidateResponse"),
    response: z.discriminatedUnion("class_name", [
        ImgValidateResponseOkSchema,
        ImgValidateResponseErrorSchema,
        ImgValidateResponseVirusSchema,
    ]).describe("Validation result"),
}).describe("Image validation response");
export type ImgValidateResponse = z.infer<typeof ImgValidateResponseSchema>;

// ============================================================================
// Image Orientation
// ============================================================================

/**
 * Request to determine the orientation of an image based on text content
 */
export const ImgOrientationRequestSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the image to analyze"),
}).describe("Image orientation detection request");
export type ImgOrientationRequest = z.infer<typeof ImgOrientationRequestSchema>;

/**
 * Response to an orientation detection request
 */
export const ImgOrientationResponseSchema = z.object({
    rotated_img_handle: ImgHandleSchema.describe("Handle to the auto-rotated image"),
    orientation: DiscreteAngleSchema.describe("Detected orientation angle"),
    confidence: ConfidenceSchema.describe("Confidence in the detected orientation"),
}).describe("Image orientation detection response");
export type ImgOrientationResponse = z.infer<typeof ImgOrientationResponseSchema>;

// ============================================================================
// Image Rotation
// ============================================================================

/**
 * Request to rotate an image by a specific angle
 */
export const ImgRotateRequestSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the image to rotate"),
    rotate: DiscreteAngleSchema.describe("Angle to rotate the image counter-clockwise"),
}).describe("Image rotation request");
export type ImgRotateRequest = z.infer<typeof ImgRotateRequestSchema>;

/**
 * Response to an image rotation request
 */
export const ImgRotateResponseSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the rotated image"),
}).describe("Image rotation response");
export type ImgRotateResponse = z.infer<typeof ImgRotateResponseSchema>;

// ============================================================================
// Thumbnail Generation
// ============================================================================

/**
 * Request to generate a thumbnail (lower resolution with same aspect ratio)
 */
export const ImgThumbnailRequestSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the source image"),
    max_width: z.number().int().positive().describe("Maximum width of the thumbnail in pixels"),
    max_height: z.number().int().positive().describe("Maximum height of the thumbnail in pixels"),
}).describe("Thumbnail generation request");
export type ImgThumbnailRequest = z.infer<typeof ImgThumbnailRequestSchema>;

/**
 * Response to a thumbnail generation request
 */
export const ImgThumbnailResponseSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the thumbnail image"),
}).describe("Thumbnail generation response");
export type ImgThumbnailResponse = z.infer<typeof ImgThumbnailResponseSchema>;

// ============================================================================
// Format Conversion - PNG
// ============================================================================

/**
 * Request to convert an image to PNG format
 */
export const ImgToPngRequestSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the image to convert"),
}).describe("Image to PNG conversion request");
export type ImgToPngRequest = z.infer<typeof ImgToPngRequestSchema>;

/**
 * Response to a PNG conversion request
 */
export const ImgToPngResponseSchema = z.object({
    png_handle: PngHandleSchema.describe("Handle to the PNG image"),
}).describe("Image to PNG conversion response");
export type ImgToPngResponse = z.infer<typeof ImgToPngResponseSchema>;

// ============================================================================
// Format Conversion - JPEG
// ============================================================================

/**
 * Request to convert an image to JPEG format
 */
export const ImgToJpegRequestSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the image to convert"),
    quality: z.number().int().min(0).max(100).default(75).describe("JPEG quality (0-100). Default: 75"),
    progressive: z.boolean().default(false).describe("Use progressive JPEG encoding. Default: false"),
}).describe("Image to JPEG conversion request");
export type ImgToJpegRequest = z.input<typeof ImgToJpegRequestSchema>;

/**
 * Response to a JPEG conversion request
 */
export const ImgToJpegResponseSchema = z.object({
    jpeg_handle: JpegHandleSchema.describe("Handle to the JPEG image"),
}).describe("Image to JPEG conversion response");
export type ImgToJpegResponse = z.infer<typeof ImgToJpegResponseSchema>;

// ============================================================================
// Format Conversion - PDF
// ============================================================================

/**
 * Options for embedding an image in a blank PDF page
 */
export const EmbeddingOptionsSchema = z.object({
    size: PdfPageSizeSchema.describe("Size of the blank page"),
    position: PdfImgPositionSchema.default("center").describe("Position of the image in the page. Default: center"),
}).describe("Options for embedding image in blank PDF page");
export type EmbeddingOptions = z.input<typeof EmbeddingOptionsSchema>;

/**
 * Options for converting an image to PDF format.
 * Controls quality, size, DPI, and optional blank page embedding.
 */
export const ImgToPdfOptionsSchema = z.object({
    img_quality: PdfImgQualitySchema.default(70).describe("Image quality in PDF (1-100). Default: 70"),
    img_color: PdfImgColorSchema.default("original").describe("Color mode. Default: original"),
    max_size: PdfPageSizeSchema.default({ width: 210, height: 297 }).describe("Max size (width, height) in mm. Default: A4 (210x297)"),
    max_dpi: DPISchema.default(120).describe("Maximum DPI for downsampling. Default: 120"),
    min_dpi: DPISchema.default(100).describe("Minimum DPI for sizing. Default: 100"),
    embed_in_blank_page: EmbeddingOptionsSchema.optional().nullable().describe("Embed in a blank page of specified size"),
}).refine((data) => {
    if (data.min_dpi && data.max_dpi && data.max_dpi < data.min_dpi) {
        return false;
    }
    return true;
}, {
    message: "max_dpi must be greater than or equal to min_dpi",
    path: ["max_dpi"],
}).refine((data) => {
    if (data.embed_in_blank_page && data.max_size) {
        if (data.embed_in_blank_page.size.width < data.max_size.width) {
            return false;
        }
        if (data.embed_in_blank_page.size.height < data.max_size.height) {
            return false;
        }
    }
    return true;
}, {
    message: "embedding size must be >= max_size",
    path: ["embed_in_blank_page"],
}).describe("PDF conversion options");
export type ImgToPdfOptions = z.input<typeof ImgToPdfOptionsSchema>;

/**
 * Request to convert an image to PDF format
 */
export const ImgToPdfRequestSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the image to convert"),
    options: ImgToPdfOptionsSchema.partial().optional().describe("PDF conversion options"),
}).describe("Image to PDF conversion request");
export type ImgToPdfRequest = z.input<typeof ImgToPdfRequestSchema>;

/**
 * Response to a PDF conversion request
 */
export const ImgToPdfResponseSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the PDF"),
}).describe("Image to PDF conversion response");
export type ImgToPdfResponse = z.infer<typeof ImgToPdfResponseSchema>;

// ============================================================================
// Document Detection
// ============================================================================

/**
 * Request to detect document boundaries in an image
 */
export const ImgFindDocumentsRequestSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the image to analyze"),
}).describe("Document detection request");
export type ImgFindDocumentsRequest = z.infer<typeof ImgFindDocumentsRequestSchema>;

/**
 * Detected document quadrilateral with confidence score
 */
export const ImgFindDocumentsQuadrilateralSchema = z.object({
    quadrilateral: QuadrilateralSchema.describe("Boundaries of the detected document"),
    confidence: ConfidenceSchema.describe("Confidence in the detection"),
}).describe("Detected document with boundaries");
export type ImgFindDocumentsQuadrilateral = z.infer<typeof ImgFindDocumentsQuadrilateralSchema>;

/**
 * Response to a document detection request
 */
export const ImgFindDocumentsResponseSchema = z.object({
    documents: z.array(ImgFindDocumentsQuadrilateralSchema).describe("List of detected documents"),
}).describe("Document detection response");
export type ImgFindDocumentsResponse = z.infer<typeof ImgFindDocumentsResponseSchema>;

// ============================================================================
// Quadrilateral Extraction
// ============================================================================

/**
 * Request to extract a quadrilateral region from an image
 */
export const ImgExtractQuadrilateralRequestSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the source image"),
    quadrilateral: QuadrilateralSchema.describe("Region to extract"),
}).describe("Quadrilateral extraction request");
export type ImgExtractQuadrilateralRequest = z.infer<typeof ImgExtractQuadrilateralRequestSchema>;

/**
 * Response to a quadrilateral extraction request
 */
export const ImgExtractQuadrilateralResponseSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the extracted image"),
}).describe("Quadrilateral extraction response");
export type ImgExtractQuadrilateralResponse = z.infer<typeof ImgExtractQuadrilateralResponseSchema>;

// ============================================================================
// OCR - Image to PDF
// ============================================================================

/**
 * Request to perform OCR on an image and create a PDF with overlaid text
 */
export const ImgOcrToPdfRequestSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the image for OCR"),
    options: ImgToPdfOptionsSchema.partial().optional().describe("PDF conversion options"),
}).describe("Image OCR to PDF request");
export type ImgOcrToPdfRequest = z.input<typeof ImgOcrToPdfRequestSchema>;

/**
 * Response to an OCR to PDF request
 */
export const ImgOcrToPdfResponseSchema = z.object({
    pdf_handle: PdfHandleSchema.describe("Handle to the PDF with OCR text overlay"),
}).describe("Image OCR to PDF response");
export type ImgOcrToPdfResponse = z.infer<typeof ImgOcrToPdfResponseSchema>;

// ============================================================================
// OCR - Image to ODT
// ============================================================================

/**
 * Options for ODT conversion (currently empty, reserved for future use)
 */
export const ImgToOdtOptionsSchema = z.object({}).describe("ODT conversion options");
export type ImgToOdtOptions = z.infer<typeof ImgToOdtOptionsSchema>;

/**
 * Request to perform OCR on an image and create an ODT file with the text
 */
export const ImgOcrToOdtRequestSchema = z.object({
    img_handle: ImgHandleSchema.describe("Handle to the image for OCR"),
    options: ImgToOdtOptionsSchema.describe("ODT conversion options"),
}).describe("Image OCR to ODT request");
export type ImgOcrToOdtRequest = z.infer<typeof ImgOcrToOdtRequestSchema>;

/**
 * Response to an OCR to ODT request
 */
export const ImgOcrToOdtResponseSchema = z.object({
    odt_handle: OdtHandleSchema.describe("Handle to the ODT file"),
}).describe("Image OCR to ODT response");
export type ImgOcrToOdtResponse = z.infer<typeof ImgOcrToOdtResponseSchema>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Utility functions for working with Quadrilaterals
 */
export const QuadrilateralUtils = {
    /**
     * Create a Quadrilateral from an unsorted list of 4 points.
     * Points are sorted by position to form a proper quadrilateral.
     * @param points - Array of exactly 4 RelativePosition points
     * @returns Quadrilateral with properly positioned corners
     * @throws Error if points array doesn't contain exactly 4 points
     */
    fromUnsorted: (points: RelativePosition[]): Quadrilateral => {
        if (points.length !== 4) {
            throw new Error("Quadrilateral must have 4 points");
        }

        // Sort by y-coordinate
        const sortedByY = [...points].sort((a, b) => a.y - b.y);
        const top = sortedByY.slice(0, 2);
        const bottom = sortedByY.slice(2);

        // Sort top and bottom by x-coordinate
        const sortedTop = top.sort((a, b) => a.x - b.x);
        const sortedBottom = bottom.sort((a, b) => a.x - b.x);

        const topLeft = sortedTop[0]!;
        const topRight = sortedTop[1]!;
        const bottomLeft = sortedBottom[0]!;
        const bottomRight = sortedBottom[1]!;

        return {
            top_left: topLeft,
            top_right: topRight,
            bottom_right: bottomRight,
            bottom_left: bottomLeft,
        };
    },
};
