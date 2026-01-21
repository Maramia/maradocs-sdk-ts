import * as ws from "../models/workspace";
import { FetchWrapper } from "../shared/fetchWrapper";

export class WorkspaceEp {
    private wrap: FetchWrapper;

    constructor(wrap: FetchWrapper) {
        this.wrap = wrap;
    }

    /** Create a new workspace. Never expose `request.secret_key` to the client */
    public async create(req: ws.WorkspaceCreateRequest): Promise<ws.WorkspaceCreateResponse> {
        return await this.wrap.post("/workspace", req, ws.WorkspaceCreateResponseSchema);
    }

    /** Delete a workspace. Never expose `request.secret_key` to the client */
    public async delete(req: ws.WorkspaceDeleteRequest): Promise<ws.WorkspaceDeleteResponse> {
        return await this.wrap.delete("/workspace", req, ws.WorkspaceDeleteResponseSchema);
    }
}
