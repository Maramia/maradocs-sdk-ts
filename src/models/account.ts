/**
 * Account and subaccount management models for the MaraDocs API.
 * @module account
 */
import { z } from "zod";
import {
    UUIDSchema,
    NonNegativeIntSchema,
    PositiveIntSchema,
    DateTimeSchema,
    Base64BytesSchema,
    type DateTime,
} from "./misc";

// Re-export DateTime for consumers who import from account
export { DateTime, DateTimeSchema };

// ============================================================================
// Core Models
// ============================================================================

/**
 * Subaccount with available credits and metadata
 */
export const SubaccountSchema = z.object({
    id: UUIDSchema.describe("Unique identifier of the subaccount"),
    available_credits: NonNegativeIntSchema.describe("Available credits balance"),
    created_at: DateTimeSchema.describe("Creation timestamp"),
}).describe("Subaccount with credit balance");
export type Subaccount = z.infer<typeof SubaccountSchema>;

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Request to create a new subaccount (empty request body)
 */
export const SubaccountCreateRequestSchema = z.object({}).describe("Subaccount creation request");
export type SubaccountCreateRequest = z.infer<typeof SubaccountCreateRequestSchema>;

/**
 * Request to create a subaccount with initial reserved credits
 */
export const CreateSubaccountSchema = z.object({
    reservation: NonNegativeIntSchema.describe("Initial credits to reserve for the subaccount"),
}).describe("Create subaccount with reserved credits");
export type CreateSubaccount = z.infer<typeof CreateSubaccountSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Response containing the account's available credits
 */
export const AccountCreditsGetResponseSchema = z.object({
    credits: NonNegativeIntSchema.describe("Available credits balance"),
}).describe("Account credits response");
export type AccountCreditsGetResponse = z.infer<typeof AccountCreditsGetResponseSchema>;

/**
 * Response containing the subaccount's available credits
 */
export const SubaccountCreditsGetResponseSchema = z.object({
    available_credits: NonNegativeIntSchema.describe("Available credits balance"),
}).describe("Subaccount credits response");
export type SubaccountCreditsGetResponse = z.infer<typeof SubaccountCreditsGetResponseSchema>;

/**
 * Overview of all subaccounts and their credit balances
 */
export const SubaccountOverviewSchema = z.object({
    subaccounts: z.array(SubaccountSchema).describe("List of subaccounts with credit balances"),
}).describe("Subaccount overview");
export type SubaccountOverview = z.infer<typeof SubaccountOverviewSchema>;

// ============================================================================
// Path Parameter Schemas
// ============================================================================

/**
 * Path parameter for subaccount ID
 */
export const SubaccountIdParamSchema = z.object({
    id: UUIDSchema.describe("Subaccount ID"),
}).describe("Subaccount ID parameter");
export type SubaccountIdParam = z.infer<typeof SubaccountIdParamSchema>;

/**
 * Type of credit transfer for subaccounts
 */
export const SubaccountTransferTypeSchema = z.enum(["reservation", "release"]).describe(
    "Transfer type: 'reservation' to add credits, 'release' to return credits"
);
export type SubaccountTransferType = z.infer<typeof SubaccountTransferTypeSchema>;

/**
 * Record of a credit transfer to/from a subaccount
 */
export const SubaccountTransferSchema = z.object({
    amount: NonNegativeIntSchema.describe("Amount of credits transferred"),
    created_at: DateTimeSchema.describe("Timestamp of the transfer"),
    transfer_type: SubaccountTransferTypeSchema.describe("Type of transfer"),
}).describe("Credit transfer record");
export type SubaccountTransfer = z.infer<typeof SubaccountTransferSchema>;

/**
 * History of credit transfers for a subaccount
 */
export const SubaccountTransferHistorySchema = z.object({
    transfers: z.array(SubaccountTransferSchema).describe("List of transfers"),
}).describe("Subaccount transfer history");
export type SubaccountTransferHistory = z.infer<typeof SubaccountTransferHistorySchema>;

/**
 * Parameters for reserving or releasing credits on a subaccount
 */
export const SubaccountReserveReleaseParamsSchema = z.object({
    id: UUIDSchema.describe("Subaccount ID"),
    transfer_type: SubaccountTransferTypeSchema.describe("Type of transfer"),
    amount: PositiveIntSchema.describe("Amount of credits to transfer"),
}).describe("Subaccount reserve/release parameters");
export type SubaccountReserveReleaseParams = z.infer<typeof SubaccountReserveReleaseParamsSchema>;

/**
 * Parameters for listing subaccounts with optional pagination
 */
export const SubaccountsListParamsSchema = z.object({
    start_at: DateTimeSchema.optional().describe("Start pagination from this timestamp"),
}).describe("Subaccounts list parameters");
export type SubaccountsListParams = z.infer<typeof SubaccountsListParamsSchema>;

// ============================================================================
// Credit Spending Models
// ============================================================================

/**
 * Record of a credit expenditure
 */
export const SpentCreditSchema = z.object({
    id: UUIDSchema.describe("Unique identifier of the spending record"),
    spent: NonNegativeIntSchema.describe("Amount of credits spent"),
    reimbursed: z.boolean().describe("Whether the credits have been reimbursed"),
    created_at: DateTimeSchema.describe("Timestamp of the expenditure"),
}).describe("Credit expenditure record");
export type SpentCredit = z.infer<typeof SpentCreditSchema>;

/**
 * Summary of spent credits across account and subaccounts
 */
export const SpentCreditsSchema = z.object({
    account_spending: z.array(SpentCreditSchema).describe(
        "Credits spent in workspaces without subaccounts"
    ),
    subaccount_spending: z.record(UUIDSchema, z.array(SpentCreditSchema)).describe(
        "Map of subaccount IDs to their spending records"
    ),
}).describe("Summary of spent credits");
export type SpentCredits = z.infer<typeof SpentCreditsSchema>;

// ============================================================================
// Account Secret Key
// ============================================================================

/**
 * Account secret key - can be obtained from the MaraDocs UI.
 * Used for authentication when creating workspaces.
 */
export const AccountSecretKeySchema = z.object({
    account_id: UUIDSchema.describe("ID of the account"),
    seed: Base64BytesSchema.describe("Base64-encoded secret seed"),
}).describe("Account secret key for authentication");
export type AccountSecretKey = z.infer<typeof AccountSecretKeySchema>;
