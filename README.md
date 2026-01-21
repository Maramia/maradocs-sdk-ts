# MaraDocs TypeScript SDK

Official TypeScript SDK for the [MaraDocs API](https://maradocs.io) - a document processing API for PDFs, images, emails, and HTML.

## Installation

```bash
npm install @maramia/maradocs-sdk-ts
```

## Quick Start

The SDK provides two main clients:

- **`MaraDocsClient`** - For client-side (browser) operations using a publishable key
- **`MaraDocsServer`** - For server-side operations using a secret key

### Client-Side Usage

```typescript
import { MaraDocsClient } from "@maramia/maradocs-sdk-ts";

const client = new MaraDocsClient({
  publishableKey: "your_publishable_key",
});

// Upload a file
const file = new File([pdfBytes], "document.pdf", { type: "application/pdf" });
const uploadResult = await client.data.upload(file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});

// Validate the PDF
const validated = await client.pdf.validate({
  unvalidated_file_handle: uploadResult.unvalidated_file_handle,
});

if (validated.response.class_name === "PdfValidateResponseOk") {
  const pdfHandle = validated.response.pdf_handle;
  // Use pdfHandle for further operations...
}
```

### Server-Side Usage

```typescript
import { MaraDocsServer } from "@maramia/maradocs-sdk-ts";

const server = new MaraDocsServer({
  secretKey: process.env.MARADOCS_SECRET_KEY!,
});

// Manage workspaces
const workspaces = await server.workspace.list();

// Create webview tokens for secure client access
const webviewToken = await server.webview.createToken({
  workspace_id: "ws_xxx",
});
```

## Features

### PDF Operations

```typescript
// Validate PDF (virus scan + encoding check)
await client.pdf.validate({ unvalidated_file_handle });

// Merge/split PDFs by selecting specific pages
await client.pdf.compose({
  pdfs: [
    { pdf_handle: pdf1, pages: [{ page_number: 0 }, { page_number: 2 }] },
    { pdf_handle: pdf2 }, // all pages
  ],
});

// Optimize PDF (reduce file size)
await client.pdf.optimize({
  pdf_handle,
  image_dpi: 150,
  image_quality: 70,
});

// Rotate pages
await client.pdf.rotate({
  pdf_handle,
  rotate: [
    [0, 90], // rotate page 0 by 90°
    [2, 180], // rotate page 2 by 180°
  ],
});

// Convert PDF pages to images
await client.pdf.toImg({ pdf_handle, dpi: 200 });

// Auto-detect and fix page orientation
await client.pdf.orientation({ pdf_handle });

// OCR - create searchable PDF with text layer
await client.pdf.ocrToPdf({ pdf_handle });
```

### Image Operations

```typescript
// Validate image
await client.img.validate({ unvalidated_file_handle });

// Create thumbnails
await client.img.thumbnail({ img_handle, max_width: 200, max_height: 200 });

// Find documents in a photo (for scanning)
await client.img.findDocuments({ img_handle });

// Extract and correct perspective
await client.img.extractQuadrilateral({ img_handle, quadrilateral });

// Detect and fix orientation
await client.img.orientation({ img_handle });

// Rotate image
await client.img.rotate({ img_handle, angle: 90 });

// Convert formats
await client.img.toJpeg({ img_handle, quality: 85 });
await client.img.toPng({ img_handle });
await client.img.toPdf({ img_handle });

// OCR - create searchable PDF from image
await client.img.ocrToPdf({ img_handle });
```

### HTML Operations

```typescript
// Validate HTML
await client.html.validate({ unvalidated_file_handle });

// Convert HTML to PDF
await client.html.toPdf({ html_handle });
```

### Email Operations

```typescript
// Parse and validate email files (.eml)
const result = await client.email.validate({ unvalidated_file_handle });

if (result.response.class_name === "EmailValidateResponseOk") {
  const email = result.response.email_handle;
  console.log(email.subject);
  console.log(email.from_addr);
  console.log(email.attachments);
}
```

### File Upload & Download

```typescript
// Upload with progress tracking
const uploaded = await client.data.upload(file, (percent) => {
  console.log(`${percent.toFixed(1)}%`);
});

// Determine MIME type
const mimeType = await client.data.mimeType({
  unvalidated_file_handle: uploaded.unvalidated_file_handle,
});

// Download processed files
const pdfBlob = await client.data.downloadPdf({ pdf_handle });
const jpegBlob = await client.data.downloadJpeg({ jpeg_handle });
const pngBlob = await client.data.downloadPng({ png_handle });
```

## Error Handling

```typescript
import { ApiErrorException, ApiErrorType } from "@maramia/maradocs-sdk-ts";

try {
  await client.pdf.validate({ unvalidated_file_handle });
} catch (error) {
  if (error instanceof ApiErrorException) {
    switch (error.type) {
      case ApiErrorType.Unauthorized:
        console.error("Invalid API key");
        break;
      case ApiErrorType.RateLimited:
        console.error("Rate limit exceeded");
        break;
      default:
        console.error(error.message);
    }
  }
}
```

## Workspace Info

Access workspace information decoded from your publishable key:

```typescript
const client = new MaraDocsClient({ publishableKey });

console.log(client.info.workspace_id);
console.log(client.info.account_id);
```

## Requirements

- Node.js 18+ or modern browser
- TypeScript 5.0+ (for TypeScript projects)

## Documentation

For complete API documentation and guides, visit [appimaradocs.io/docs](https://api.maradocs.io/docs).

## License

MIT License - see [LICENSE.md](./LICENSE.md) for details.
