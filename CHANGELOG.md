# Changelog

All notable changes to this project will be documented in this file.

<!--
## [Unreleased]

### Added
### Changed
### Removed
### Fixed
-->

## [1.1.0] - 2025-02-18

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
