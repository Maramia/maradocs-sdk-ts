# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- `MaraDocsClient.audio` and `MaraDocsClient.video` with `AudioEp.validate` and `VideoEp.validate` (async task + poll for `/audio/validate` and `/video/validate`).
- Audio and video Zod models and helpers in `models/audio` and `models/video` (including `okAudio` / `okVideo`).
- `AudioHandle`, `VideoHandle`, `AudioMetadata`, and `VideoMetadata` schemas on `models/misc`.
- `DataEp.virusScan` and `DataEp.downloadMp4`, `downloadMp3`, `downloadWav`, `downloadFlac` (async encode + poll, then presigned GET with progress).
- Optional `RequestOptions` (`{ timeout?: number }`) on task-based `DataEp` methods (`mimeType`, `virusScan`, transcoded downloads) and on `ImgEp`, `PdfEp`, `HtmlEp`, `EmailEp`, `AudioEp`, and `VideoEp` methods that use polling.
- Optional `timeoutMs` on `MaraDocsClient` and `MaraDocsServer` constructors (default timeout for all requests when set).
- `RequestOptions` type re-exported from the package root (`import type { RequestOptions } from '@maramia/maradocs-sdk-ts'`).
- `ImgEp.improveContrast` and matching request/response schemas in `models/img`.
- Barrel exports for `./video` and `./audio` from `models/index`.

### Changed

- `FetchWrapper` now supports per-request timeouts, optional client-level default timeout, and clearer HTTP error handling during `pollResult` (non-202 failures use the same JSON error path as other requests).
- `Flow.ocrImg` / `Flow.ocrImgHandle`: when document extraction finds regions, each crop is oriented and contrast-improved before PDF steps; optional `timeout` on `OcrImgOptions` / `OcrPdfOptions` is passed through to task calls. Pipeline order and steps align with the in-repo API client.
- **Breaking**: `TaskCreatedResponse` uses `tokens_spent` only; `milli_tokens_spent` is no longer on the schema (aligns with the API). Migrate from `milli_tokens_spent` to `tokens_spent`.

## [1.2.0] - 2026-02-22

### Changed
- **Breaking**: `ApiErrorException` properties renamed: `status_code` → `statusCode`, `api_error` → `apiError`
- **Breaking**: `DataEp` callback parameter renamed: `on_progress` → `onProgress` in `upload`, `downloadPdf`, `downloadJpeg`, `downloadPng`, `downloadOdt`, `downloadUnvalidated`

## [1.1.0] - 2026-02-18

### Added
- Progress tracking for download methods (`downloadPdf`, `downloadJpeg`, `downloadPng`, `downloadOdt`, `downloadUnvalidated`) via optional `on_progress` callback
- `DataEp.downloadUnvalidated` for downloading unvalidated files (e.g. email body content)
- `EmailEp.toHtml` and `EmailEp.toPdf` for rendering validated emails to HTML and PDF
- `Flow.ocrImgHandle` and `Flow.ocrPdfHandle` for OCR by handle (enables reuse of validated assets)
- `expires_in` option on download requests (configurable URL expiration, default 5 minutes)
- `name` option on upload requests
- `okImg`, `okPdf`, `okHtml` and `okEmail` helpers for validation responses

### Changed
- **Breaking**: `MaraDocsClient` constructor param `publishableKey` renamed to `workspaceSecret`
- **Breaking**: `AccountSecretKey` renamed to `AccountSecret` in account models
- **Breaking**: `WorkspaceCreateResponse` now returns `workspace_secret` (replaces previous publishable key field)
- Download responses now include `headers` from API (SSE-C); DataEp no longer computes headers client-side
- ImgEp OCR endpoint path: `/img/ocr/pdf` → `/img/ocr/to/pdf`
- Flow pipeline: `img.toPdf` replaced with `img.ocrToPdf`

### Removed
- **Breaking**: `js-md5` dependency removed; DataEp no longer takes `encryption_key` in constructor
