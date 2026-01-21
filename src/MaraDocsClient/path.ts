import { API_URL_V1 } from "../shared/apiUrl";

export class Path {
    private apiUrlWithVersion: string;

    constructor(apiUrlWithVersion?: string) {
        this.apiUrlWithVersion = apiUrlWithVersion ?? API_URL_V1;
    }

    private combine(paths: string[]): string {
        return paths.filter((s) => s !== "").join("/");
    }

    /** Returns the data endpoint URL */
    data(ep: string = ""): string {
        return this.combine([this.apiUrlWithVersion, "data", ep]);
    }

    /** Returns the img endpoint URL */
    img(ep: string = ""): string {
        return this.combine([this.apiUrlWithVersion, "img", ep]);
    }

    /** Returns the pdf endpoint URL */
    pdf(ep: string = ""): string {
        return this.combine([this.apiUrlWithVersion, "pdf", ep]);
    }

    /** Returns the html endpoint URL */
    html(ep: string = ""): string {
        return this.combine([this.apiUrlWithVersion, "html", ep]);
    }

    /** Returns the webview endpoint URL */
    webview(ep: string = ""): string {
        return this.combine([this.apiUrlWithVersion, "webview", ep]);
    }

    /** Returns the workspace endpoint URL */
    workspace(ep: string = ""): string {
        return this.combine([this.apiUrlWithVersion, "workspace", ep]);
    }

    /** Returns the error endpoint URL */
    error(ep: string = ""): string {
        return this.combine([this.apiUrlWithVersion, "error", ep]);
    }
}
