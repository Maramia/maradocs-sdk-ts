import { API_URL_V1 } from "../shared/apiUrl";

export class Path {
    private apiUrlWithVersion: string;

    constructor(base_url: string = API_URL_V1) {
        this.apiUrlWithVersion = base_url;
    }

    private combine(paths: string[]): string {
        return paths.filter((s) => s !== "").join("/");
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
