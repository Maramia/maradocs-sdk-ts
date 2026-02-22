import { z } from "zod/v4";

export const WorkspaceInfoSchema = z
    .object({
        account_id: z.guid(),
        subaccount: z.guid().optional().nullable(),
        workspace_id: z.guid(),
        encryption_key: z.base64(),
    })
    .describe("Publishable key (JWT) for the workspace");

export type WorkspaceInfo = z.infer<typeof WorkspaceInfoSchema>;

export function decodeWorkspaceInfo(token: string): WorkspaceInfo {
    const decoded = Buffer.from(token, "base64");
    const payload = decoded.subarray(64); // First 64 bytes are the signing key
    return WorkspaceInfoSchema.parse(JSON.parse(payload.toString("utf-8")));
}

export function parseEncryptionKey(workspaceInfo: WorkspaceInfo): Uint8Array {
    return new Uint8Array(Buffer.from(workspaceInfo.encryption_key, "base64"));
}
