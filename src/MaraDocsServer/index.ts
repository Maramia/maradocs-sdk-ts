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

    constructor({ secretKey, apiUrlWithVersion }: { secretKey: string; apiUrlWithVersion?: string }) {
        apiUrlWithVersion = apiUrlWithVersion ?? API_URL_V1;
        let wrap = new FetchWrapper({ jwt: secretKey, apiUrlWithVersion });
        this.healthcheck = new HealthcheckEp(wrap);
        this.account = new AccountEp(wrap);
        this.workspace = new WorkspaceEp(wrap);
        this.webview = new WebviewEp(wrap);
    }
}
