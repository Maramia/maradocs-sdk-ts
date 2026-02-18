import { API_URL_V1 } from "../shared/apiUrl";
import { HealthcheckEp } from "../shared/healthcheckEp";
import { ImgEp } from "./imgEp";
import { PdfEp } from "./pdfEp";
import { HtmlEp } from "./htmlEp";
import { EmailEp } from "./emailEp";
import { DataEp } from "./dataEp";
import { Flow } from "./flow";
import { FetchWrapper } from "../shared/fetchWrapper";
import { decodeWorkspaceInfo, parseEncryptionKey } from "../shared/decodeToken";

export class MaraDocsClient {
    healthcheck: HealthcheckEp;
    img: ImgEp;
    pdf: PdfEp;
    html: HtmlEp;
    email: EmailEp;
    data: DataEp;
    flow: Flow;
    info: WorkspaceInfo;
    /**
     * @param workspaceSecret - The workspace secret for the MaraDocs client
     * @param apiUrlWithVersion - The API URL with version. If not provided, the default API URL will be used.
     */
    constructor({ workspaceSecret, apiUrlWithVersion }: { workspaceSecret: string; apiUrlWithVersion?: string }) {
        apiUrlWithVersion = apiUrlWithVersion ?? API_URL_V1;
        let wrap = new FetchWrapper({ jwt: workspaceSecret, apiUrlWithVersion });
        this.healthcheck = new HealthcheckEp(wrap);
        this.info = new WorkspaceInfo(workspaceSecret);
        this.img = new ImgEp(wrap);
        this.pdf = new PdfEp(wrap);
        this.html = new HtmlEp(wrap);
        this.email = new EmailEp(wrap);
        this.data = new DataEp(wrap);
        this.flow = new Flow(this.data, this.img, this.pdf);
    }
}

export class WorkspaceInfo {
    public readonly account_id: string;
    public readonly subaccount: string | undefined;
    public readonly workspace_id: string;
    public readonly encryption_key: Uint8Array;

    constructor(workspace_secret_key: string) {
        const workspace_info = decodeWorkspaceInfo(workspace_secret_key);
        this.account_id = workspace_info.account_id;
        this.subaccount = workspace_info.subaccount ?? undefined;
        this.workspace_id = workspace_info.workspace_id;
        this.encryption_key = parseEncryptionKey(workspace_info);
    }
}
