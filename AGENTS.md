# @maramia/maradocs-sdk-ts

Official TypeScript client for the [MaraDocs API](https://api.maradocs.io). Package `@maramia/maradocs-sdk-ts`. Works in Node.js and other runtimes with `fetch`.

See [README.md](README.md) for method tables and examples. API reference: [api.maradocs.io](https://api.maradocs.io).

## Install

```bash
npm install @maramia/maradocs-sdk-ts
```

## Clients and auth

| Client | Auth | Use |
|--------|------|-----|
| `MaraDocsServer` | Account secret key | Account, workspace, and webview management. Server-side only. |
| `MaraDocsClient` | Workspace secret | Document processing (`data`, `img`, `pdf`, `html`, `email`, `video`, `audio`, `flow`, `healthcheck`, `info`). |

Never embed the account secret in client-side code. Create a workspace with `MaraDocsServer` and pass `workspace_secret` to `MaraDocsClient`.

```typescript
import { MaraDocsServer, MaraDocsClient } from "@maramia/maradocs-sdk-ts";

const server = new MaraDocsServer({ secretKey: process.env.MARADOCS_SECRET_KEY! });
const ws = await server.workspace.create({});
const client = new MaraDocsClient({ workspaceSecret: ws.workspace_secret });
```

Optional constructor `timeoutMs` is the default timeout for all requests. Override the API host with `apiUrlWithVersion` (default `https://api.maradocs.io/v1`).

## Core workflow

Upload → validate → extract a handle → transform → download. `flow.ocrImg` / `flow.ocrPdf` skip the low-level steps.

```typescript
import { okPdf } from "@maramia/maradocs-sdk-ts/models/pdf";

const uploaded = await client.data.upload(file);
const validated = await client.pdf.validate({
  unvalidated_file_handle: uploaded.unvalidated_file_handle,
});
const pdfHandle = okPdf(validated); // throws on error or virus
const blob = await client.data.downloadPdf({ pdf_handle: pdfHandle });
```

Validation responses are discriminated unions (`Ok`, `Error`, `Virus`). Use `okPdf`, `okImg`, `okHtml`, `okEmail`, `okVideo`, `okAudio` — they throw `ValidationErrorException` or `ValidationVirusException` on failure.

## Conventions

- `RequestOptions` (`{ timeout?: number }`) is accepted **only on poll-based methods**: all `img` / `pdf` / `html` / `email` / `video` / `audio` methods, plus `data.mimeType`, `virusScan`, and transcoded downloads (`downloadMp4` / `Mp3` / `Wav` / `Flac`). Upload/download blobs, `createUpload` / `createDownload*`, account, workspace, webview, and healthcheck do not take it.
- `createUpload` / `createDownload*` mint **proxy-only** URLs for unauthenticated third parties. `upload` / `download*` are first-party (SSE-C).
- API errors throw `ApiErrorException` (`@maramia/maradocs-sdk-ts/models/errors`) with `apiError.code` and `apiError.message`. HTTP: 400 bad request, 402 insufficient credits, 422 validation, 500 internal.
- Models are importable via `@maramia/maradocs-sdk-ts/models/<domain>` (e.g. `pdf`, `img`, `errors`).
- Zod v4: `import { z } from "zod/v4"`.
