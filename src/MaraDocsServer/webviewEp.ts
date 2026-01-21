import * as webview from "../models/webview";
import { FetchWrapper } from "../shared/fetchWrapper";

export class WebviewEp {
    private wrap: FetchWrapper;

    constructor(wrap: FetchWrapper) {
        this.wrap = wrap;
    }

    /**
     * Opens the workspace with the MaraDocs UI in a webview or browser.
     * Returns a URL that can be opened in a browser or webview.
     */
    public async open(req: webview.WebviewOpenRequest): Promise<webview.WebviewOpenResponse> {
        return this.wrap.post("/webview", req, webview.WebviewOpenResponseSchema);
    }

    /**
     * Adds files to the webview.
     * Files added this way will be available in the webview interface.
     */
    public async addFile(req: webview.WebviewAddFileRequest): Promise<webview.WebviewAddFileResponse> {
        return this.wrap.put("/webview", req, webview.WebviewAddFileResponseSchema);
    }

    /**
     * Gets the status of the webview.
     * Returns whether the webview is currently open or closed.
     */
    public async status(): Promise<webview.WebviewStatusResponse> {
        return this.wrap.get("/webview/status", webview.WebviewStatusResponseSchema);
    }

    /**
     * Gets the results of the webview.
     * Returns lists of uploaded and processed files from the webview session.
     */
    public async results(): Promise<webview.WebviewResultsResponse> {
        return this.wrap.get("/webview/results", webview.WebviewResultsResponseSchema);
    }
}
