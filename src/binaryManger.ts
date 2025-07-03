import * as coreActions from "@actions/core"
import * as https from "https"

class BinaryManager {
    private version: string;
    static readonly API_HOST_NAME: string = "api.github.com";
    static readonly RELEASE_PAGE_URL: string = "/repos/Reim-developer/GoHook/releases";

    constructor() {
        this.version = coreActions.getInput("use-cli-version") || "latest"
    }

    public async GetLatestVersion(): Promise<string | null> {
        const RESULT: Promise<string | null> = new Promise((resolv) => {
            const REQUEST_OPTIONS = {
                hostname: BinaryManager.API_HOST_NAME,
                path: `${BinaryManager.RELEASE_PAGE_URL}/${this.version}`,
                method: "GET",
                headers: {
                    "User-Agent": "GoHookActions"
                }
            };

            const REQUEST = https.request(REQUEST_OPTIONS, function (response): void {
                let responseBody: string = "";

                response.on("data", (chunk) => responseBody += chunk);
                response.on("end", function (): void {
                    const JSON_DATA = JSON.parse(responseBody);
                    const BINARY_VERSION = JSON_DATA.tag_name;

                    if (!BINARY_VERSION) {
                        coreActions.setFailed("GitHub API did not return a valid tag name for latest release.");
                        return resolv(null);
                    }

                    resolv(BINARY_VERSION);
                });
            });

            REQUEST.on("error", function (error): void {
                coreActions.setFailed(`Request to GitHub API is failed: ${error.message}`)
                return resolv(null);
            });

            REQUEST.end();
        });

        return RESULT;
    }

}

export default BinaryManager;