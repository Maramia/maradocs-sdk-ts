/**
 * Workspace management models for the MaraDocs API.
 * @module workspace
 */
import { z } from "zod/v4";

// ============================================================================
// Workspace Creation
// ============================================================================

/**
 * Request to create a new workspace
 */
export const WorkspaceCreateRequestSchema = z.object({
    subaccount: z.guid().optional().describe("Subaccount to charge for the workspace (optional)"),
}).describe("Workspace creation request");
export type WorkspaceCreateRequest = z.infer<typeof WorkspaceCreateRequestSchema>;

/**
 * Response to a workspace creation request
 */
export const WorkspaceCreateResponseSchema = z.object({
    subaccount: z.guid().nullable().describe("Subaccount that will be charged (null if none)"),
    workspace_id: z.guid().describe("Unique identifier for the created workspace"),
    publishable_key: z.base64().describe("Base64-encoded publishable key (JWT) for the workspace"),
}).describe("Workspace creation response");
export type WorkspaceCreateResponse = z.infer<typeof WorkspaceCreateResponseSchema>;

// ============================================================================
// Workspace Deletion
// ============================================================================

/**
 * Request to delete a workspace
 */
export const WorkspaceDeleteRequestSchema = z.object({
    workspace_id: z.guid().describe("ID of the workspace to delete"),
    subaccount: z.guid().optional().nullable().describe("Subaccount associated with the workspace (optional)"),
}).describe("Workspace deletion request");
export type WorkspaceDeleteRequest = z.infer<typeof WorkspaceDeleteRequestSchema>;

/**
 * Response to a workspace deletion request (empty)
 */
export const WorkspaceDeleteResponseSchema = z.object({}).describe("Workspace deletion response");
export type WorkspaceDeleteResponse = z.infer<typeof WorkspaceDeleteResponseSchema>;
