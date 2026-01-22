import { FetchWrapper } from "./fetchWrapper";

export class HealthcheckEp {
    private wrap: FetchWrapper;

    constructor(wrap: FetchWrapper) {
        this.wrap = wrap;
    }

    /**
     * Checks if the server is healthy by doing a GET request to the healthcheck/ping endpoint.
     * @returns True if the server response is 200, false otherwise.
     */
    public async ping(): Promise<boolean> {
        try {
            const response = await fetch(this.wrap.url("/healthcheck/ping"), {
                method: "GET",
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }
}
