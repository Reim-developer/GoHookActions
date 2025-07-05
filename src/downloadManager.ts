import os from "os"
import http, { IncomingMessage } from "http"
import https from "https";
import { https as redirectHttps } from "follow-redirects"
import * as actionCore from "@actions/core"
import fs from "fs";
import OperatingSystem from "./osEnum";

interface ReleaseAsset {
    name: string,
    browser_download_url: string
}

interface ReleaseData {
    assets?: ReleaseAsset[]
}

type PromiseData = (value: ReleaseData | PromiseLike<ReleaseData>) => void
type HttpMessage = http.IncomingMessage;

class DownloadManager {
    static readonly API_HOST_NAME: string = "api.github.com";
    static readonly RELEASE_PAGE_URL: string = "/repos/Reim-developer/GoHook/releases";

    private detectOperatingSystem(): OperatingSystem {
        const OS_PLATFORM = os.platform();

        switch (OS_PLATFORM) {
            case "win32":
                return OperatingSystem.Win32;

            case "linux":
                return OperatingSystem.Linux;

            case "darwin":
                return OperatingSystem.Darwin

            default:
                return OperatingSystem.Unknown
        }
    }
    private handleLinuxDownloadRequest(response: HttpMessage, resolv: PromiseData): void {
        let responseData: string = "";

        response.on("data", (chunk) => responseData += chunk);
        response.on("end", function (): void {
            try {
                resolv(JSON.parse(responseData))
            } catch (error: unknown) {
                if (error instanceof (Error)) {
                    actionCore.setFailed("Could not parse JSON data.");
                    actionCore.setFailed(`Full message error: ${error.message}`);
                    actionCore.setFailed(`Raw response data: ${responseData}`);

                    return;
                }

                actionCore.setFailed("Could not parse JSON data.");
                actionCore.setFailed("Could not get last error message.");
                return;
            }
        });

        response.on("error", function (): void {
            let statusCode = response.statusCode;

            if (!statusCode) {
                actionCore.setFailed("Request to GitHub FAILED.");
                actionCore.setFailed("Could not get the status code. Maybe it's unknown.");

                return;

            }

            actionCore.setFailed("Request to GitHub FAILED.");
            actionCore.setFailed(`The request status code: ${statusCode}`);
        });
    }

    private downloadHelper(ASSET: ReleaseAsset) {
        const ARCHIVE_FILE = fs.createWriteStream(ASSET.name);

        actionCore.info(`Found binary asset archived: ${ASSET.name}`);
        actionCore.info(`Download from: ${ASSET.browser_download_url}`);

        const USER_AGENT = {
            headers: {
                "User-Agent": "GoHookActions"
            }
        };

        redirectHttps.get(ASSET.browser_download_url, USER_AGENT, (response: HttpMessage) => {
            const STATUS_CODE = response.statusCode;
            const OK_STATUS = 200;

            if (STATUS_CODE == undefined) {
                actionCore.setFailed("Could not download GoHook archived.");
                actionCore.setFailed("Could not get status code. Maybe it's undefined.");

                return;
            }

            if (STATUS_CODE != OK_STATUS) {
                actionCore.setFailed("Could not download GoHook archived.");
                actionCore.setFailed(`Status code: ${STATUS_CODE}`);

                return;
            }

            const TOTAL_BYTES = parseInt(response.headers["content-length"] || "0", 10);
            let downloadedBytes = 0;
            let lastLogged = Date.now();

            response.on("data", function (chunk: Buffer): void {
                downloadedBytes += chunk.length;

                if (Date.now() - lastLogged > 500) {
                    lastLogged = Date.now();

                    if (TOTAL_BYTES) {
                        const PERCENT = ((downloadedBytes / TOTAL_BYTES) * 100).toFixed(2);
                        const MB_NOW = (downloadedBytes / 1024 / 1024).toFixed(2);
                        const MB_TOTAL = (TOTAL_BYTES / 1024 / 1024).toFixed(2);

                        actionCore.info(`Downloading: ${PERCENT}% (${MB_NOW}MB of ${MB_TOTAL}MB)`);

                        return;
                    }

                    actionCore.info("Downloading the GoHook archived. Could not show progress now.");
                }
            });

            response.pipe(ARCHIVE_FILE);

            ARCHIVE_FILE.on("finish", function (): void {
                ARCHIVE_FILE.close();
                actionCore.info(`Successfully download the GoHook archived: ${ASSET.name}`);
            });

            response.on("error", function (error): void {
                actionCore.info("Error when download GoHook archived.");
                actionCore.info(`Full message error: ${error.message}`);

                return;
            })

        });
    }

    private async linuxDownloadSpecifyVersion(versionTag: string): Promise<void> {
        const API_PATH = `${DownloadManager.RELEASE_PAGE_URL}/tags/${versionTag}`;
        const LINUX_ASSET_NAME: string = "GoHook_linux.tar.gz";

        const OPTIONS = {
            hostname: DownloadManager.API_HOST_NAME,
            path: API_PATH,
            method: "GET",
            headers: {
                "User-Agent": "GoHookActions",
                "Accept": "application/json"
            }
        };

        const RELEASE_DATA: ReleaseData = await new Promise((resolv) => {
            const REQUEST = https.request(OPTIONS, (response: IncomingMessage) => {
                this.handleLinuxDownloadRequest(response, resolv);
            });

            REQUEST.end()
        });

        const ASSET = RELEASE_DATA.assets?.find(asset => asset.name === LINUX_ASSET_NAME);
        if (!ASSET) {
            actionCore.setFailed("Binary asset not found, maybe it's not found.");
            return;
        }

        this.downloadHelper(ASSET);
    }

    public async DownloadGoHookArchived(versionTag: string): Promise<void> {
        const OS = this.detectOperatingSystem()

        if (OS == OperatingSystem.Linux) {
            await this.linuxDownloadSpecifyVersion(versionTag);
        }
    }
}

export default DownloadManager;