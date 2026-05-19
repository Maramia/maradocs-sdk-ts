import { API_URL_V1 } from "../shared/apiUrl";
import { HealthcheckEp } from "../shared/healthcheckEp";
import { ImgEp } from "./imgEp";
import { PdfEp } from "./pdfEp";
import { VideoEp } from "./videoEp";
import { AudioEp } from "./audioEp";
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
    video: VideoEp;
    audio: AudioEp;
    html: HtmlEp;
    email: EmailEp;
    data: DataEp;
    flow: Flow;
    info: WorkspaceInfo;
    /**
     * @param workspaceSecret - The workspace secret for the MaraDocs client
     * @param apiUrlWithVersion - The API URL with version. If not provided, the default API URL will be used.
     * @param timeoutMs - Optional default timeout in milliseconds for each request.
     */
    constructor({ workspaceSecret, apiUrlWithVersion, timeoutMs }: { workspaceSecret: string; apiUrlWithVersion?: string; timeoutMs?: number }) {
        apiUrlWithVersion = apiUrlWithVersion ?? API_URL_V1;
        let wrap = new FetchWrapper({
            jwt: workspaceSecret,
            apiUrlWithVersion,
            ...(timeoutMs != null && { timeoutMs }),
        });
        this.healthcheck = new HealthcheckEp(wrap);
        this.info = new WorkspaceInfo(workspaceSecret);
        this.img = new ImgEp(wrap);
        this.pdf = new PdfEp(wrap);
        this.video = new VideoEp(wrap);
        this.audio = new AudioEp(wrap);
        this.html = new HtmlEp(wrap);
        this.email = new EmailEp(wrap);
        this.data = new DataEp(wrap);
        this.flow = new Flow(this.data, this.img, this.pdf);
    }
}

export class WorkspaceInfo {
    public readonly accountId: string;
    public readonly subaccount: string | undefined;
    public readonly workspaceId: string;
    public readonly encryptionKey: Uint8Array;

    constructor(workspaceSecret: string) {
        const workspaceInfo = decodeWorkspaceInfo(workspaceSecret);
        this.accountId = workspaceInfo.account_id;
        this.subaccount = workspaceInfo.subaccount ?? undefined;
        this.workspaceId = workspaceInfo.workspace_id;
        this.encryptionKey = parseEncryptionKey(workspaceInfo);
    }
}
