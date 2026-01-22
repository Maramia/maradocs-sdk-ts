# MaraDocs TypeScript SDK

Official TypeScript SDK for the [MaraDocs API](https://maradocs.io) - OCR and document processing for PDFs, images, emails, and HTML.

## Installation

```bash
npm install @maramia/maradocs-sdk-ts
```

## Documentation

Full API documentation: [api.maradocs.io](https://api.maradocs.io)

## Quick Start

```typescript
import { MaraDocsServer, MaraDocsClient } from "@maramia/maradocs-sdk-ts";

// Server-side: create workspace and send publishable_key to client
const server = new MaraDocsServer({ secretKey: process.env.MARADOCS_SECRET_KEY! });
const ws = await server.workspace.create({});

// Client-side: OCR documents and combine into single PDF
const client = new MaraDocsClient({ publishableKey: ws.publishable_key });
const imgPdf = await client.flow.ocrImg(imageFile);   // image → searchable PDF
const pdfPdf = await client.flow.ocrPdf(pdfFile);     // PDF → searchable PDF
const combined = await client.pdf.compose({ pdfs: [{ pdf_handle: imgPdf }, { pdf_handle: pdfPdf }] });
const blob = await client.data.downloadPdf({ pdf_handle: combined.pdf_handle });
```

## Clients

| Client | Use Case | Authentication |
|--------|----------|----------------|
| `MaraDocsClient` | Client-side (browser) document processing | Publishable key |
| `MaraDocsServer` | Server-side workspace management | Secret key |

## Error Handling
All errors from incorrect API usage are returned as `400 Bad Request`.    
Insufficient credits are returned as `402 Payment Required`.  
Validation errors are returned as `422 Unprocessable Entity`.  
Internal errors are returned as `500 Internal Server Error`.  

API errors throw an `ApiErrorException` with both machine-readable codes and human-readable messages:

```typescript
import { ApiErrorException } from "@maramia/maradocs-sdk-ts/models/errors";

try {
  await client.pdf.compose({ pdfs: [{ pdf_handle: pdf, pages: [{ page_number: 999 }] }] });
} catch (e) {
  if (e instanceof ApiErrorException) {
    console.log(e.api_error.code);    // e.g. 300 (PDF_PAGE_OUT_OF_RANGE)
    console.log(e.api_error.message); // human-readable explanation
  }
}
```

See [errors.ts](https://github.com/Maramia/maradocs-sdk-ts/blob/main/src/models/errors.ts) for all error codes.

## API Reference

### Server Operations (`server.workspace`)

| Method | Description |
|--------|-------------|
| `workspace.create` | Create a new workspace |
| `workspace.delete` | Delete a workspace |

### PDF Operations (`client.pdf`)

| Method | Description |
|--------|-------------|
| `validate` | Validate PDF (virus scan + encoding check) |
| `compose` | Merge/split PDFs by selecting pages |
| `optimize` | Reduce file size |
| `rotate` | Rotate specific pages |
| `toImg` | Render pages as images |
| `orientation` | Detect and fix page orientation |
| `ocrToPdf` | Create searchable PDF with text layer |

### Image Operations (`client.img`)

| Method | Description |
|--------|-------------|
| `validate` | Validate image |
| `thumbnail` | Create thumbnail |
| `findDocuments` | Detect documents in photo |
| `extractQuadrilateral` | Extract and correct perspective |
| `orientation` | Detect and fix orientation |
| `rotate` | Rotate by 0°/90°/180°/270° |
| `toJpeg` | Convert to JPEG |
| `toPng` | Convert to PNG |
| `toPdf` | Convert to PDF |
| `ocrToPdf` | OCR to searchable PDF |

### HTML Operations (`client.html`)

| Method | Description |
|--------|-------------|
| `validate` | Validate HTML |
| `toPdf` | Convert to PDF |

### Email Operations (`client.email`)

| Method | Description |
|--------|-------------|
| `validate` | Parse and validate .eml/.msg files and extract attachments |

### Data Operations (`client.data`)

| Method | Description |
|--------|-------------|
| `upload` | Upload file with progress tracking |
| `mimeType` | Detect MIME type |
| `downloadPdf` | Download as Blob |
| `downloadJpeg` | Download as Blob |
| `downloadPng` | Download as Blob |



## Examples

### Merge/Split PDFs

```typescript
// Upload PDFs
const uploadedPdf1 = await client.data.upload(pdf1File);
const uploadedPdf2 = await client.data.upload(pdf2File);

// Validate PDFs
const pdf1 = await client.pdf.validate({ unvalidated_file_handle: uploadedPdf1.unvalidated_file_handle });
const pdf2 = await client.pdf.validate({ unvalidated_file_handle: uploadedPdf2.unvalidated_file_handle });

// Merge PDFs
const composed = await client.pdf.compose({
  pdfs: [
    { pdf_handle: pdf1, pages: [{ page_number: 0 }, { page_number: 2 }] },
    { pdf_handle: pdf2 }, // all pages
  ],
});

// Download merged PDF
const mergedPdf = await client.data.downloadPdf({ pdf_handle: composed.pdf_handle });
```

### Low-Level Image Processing

For fine-grained control (instead of `flow.ocrImg`):

```typescript
// Upload and validate
const uploaded = await client.data.upload(imageFile);
const validated = await client.img.validate({
  unvalidated_file_handle: uploaded.unvalidated_file_handle,
});
if (validated.response.class_name !== "ImgValidateResponseOk") {
  throw new Error("Validation failed");
}
const imgHandle = validated.response.img_handle;

// Find and extract document
const docs = await client.img.findDocuments({ img_handle: imgHandle });
if (docs.documents.length > 0) {
  const extracted = await client.img.extractQuadrilateral({
    img_handle: imgHandle,
    quadrilateral: docs.documents[0].quadrilateral,
  });
  // Continue with extracted.img_handle...
}
```
