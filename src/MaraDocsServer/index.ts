import { HealthcheckEp } from "../shared/healthcheckEp";
import { FetchWrapper } from "../shared/fetchWrapper";
import { WorkspaceEp } from "./workspaceEp";
import { WebviewEp } from "./webviewEp";
import { AccountEp } from "./accountEp";

import { API_URL_V1 } from "../shared/apiUrl";

export class MaraDocsServer {
    healthcheck: HealthcheckEp;
    account: AccountEp;
    workspace: WorkspaceEp;
    webview: WebviewEp;

    /**
     * @param secretKey - The secret key for the MaraDocs server
     * @param apiUrlWithVersion - The API URL with version. If not provided, the default API URL will be used.
     * @param timeoutMs - Optional default timeout in milliseconds for each request.
     */
    constructor({ secretKey, apiUrlWithVersion, timeoutMs }: { secretKey: string; apiUrlWithVersion?: string; timeoutMs?: number }) {
        apiUrlWithVersion = apiUrlWithVersion ?? API_URL_V1;
        let wrap = new FetchWrapper({
            jwt: secretKey,
            apiUrlWithVersion,
            ...(timeoutMs != null && { timeoutMs }),
        });
        this.healthcheck = new HealthcheckEp(wrap);
        this.account = new AccountEp(wrap);
        this.workspace = new WorkspaceEp(wrap);
        this.webview = new WebviewEp(wrap);
    }
}
