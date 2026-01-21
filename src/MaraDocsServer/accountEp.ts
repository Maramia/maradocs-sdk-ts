import * as acc from "../models/account";
import { FetchWrapper } from "../shared/fetchWrapper";
import { z } from "zod";

// Schema for void responses
const NullSchema = z.null();

export class AccountEp {
    private wrap: FetchWrapper;

    constructor(wrap: FetchWrapper) {
        this.wrap = wrap;
    }

    /**
     * Get available credits for the current account
     */
    public async getCredits(): Promise<acc.AccountCreditsGetResponse> {
        return await this.wrap.get("/account/credits", acc.AccountCreditsGetResponseSchema);
    }

    /**
     * Create a new SubAccount with a reserved amount of credits
     */
    public async createSubaccount(req: acc.SubaccountCreateRequest): Promise<acc.Subaccount> {
        return await this.wrap.post("/account/subaccount", req, acc.SubaccountSchema);
    }

    /**
     * Delete a Subaccount and transfer the remaining credits to the account
     */
    public async deleteSubaccount(id: string) {
        await this.wrap.delete(`/account/subaccount/${id}`, null, NullSchema);
    }

    /**
     * Get the available credits for a subaccount
     */
    public async getSubaccountCredits(id: string): Promise<acc.Subaccount> {
        return await this.wrap.get(`/account/subaccount/${id}/credits`, acc.SubaccountSchema);
    }

    /**
     * Get the credits history for a subaccount
     */
    public async getSubaccountTransfers({
        id,
        transferType,
        createdBefore,
        limit,
    }: {
        id: string;
        transferType: acc.SubaccountTransferType;
        createdBefore?: acc.DateTime;
        limit?: number;
    }): Promise<acc.SubaccountTransferHistory> {
        const basePath = `/account/subaccount/${id}/${transferType}`;
        const params = new URLSearchParams();
        if (createdBefore !== undefined) {
            params.append("created_before", createdBefore);
        }
        if (limit !== undefined) {
            params.append("limit", limit.toString());
        }
        const queryString = params.toString();
        const path = queryString ? `${basePath}?${queryString}` : basePath;
        return await this.wrap.get(path, acc.SubaccountTransferHistorySchema);
    }

    /**
     * Reserve credits for a SubAccount (transfer from account to subaccount)
     */
    public async reserveCredits(id: string, amount: number) {
        await this.wrap.patch(`/account/subaccount/${id}/reservation/${amount}`, null, NullSchema);
    }

    /**
     * Release credits from a SubAccount (transfer from subaccount back to account)
     */
    public async releaseCredits(id: string, amount: number) {
        await this.wrap.patch(`/account/subaccount/${id}/release/${amount}`, null, NullSchema);
    }

    /**
     * Get all subaccounts and their credits. Limited to 1000 subaccounts.
     * Use the start_at parameter to paginate.
     */
    public async getSubaccounts(start_at?: acc.DateTime): Promise<acc.SubaccountOverview> {
        const basePath = "/account/subaccounts/credits";
        const params = new URLSearchParams();
        if (start_at) {
            params.append("start_at", start_at);
        }
        const queryString = params.toString();
        const path = queryString ? `${basePath}?${queryString}` : basePath;
        return await this.wrap.get(path, acc.SubaccountOverviewSchema);
    }
}
