"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const https_1 = __importDefault(require("https"));
const follow_redirects_1 = require("follow-redirects");
const actionCore = __importStar(require("@actions/core"));
const fs_1 = __importDefault(require("fs"));
const osEnum_1 = __importDefault(require("./osEnum"));
class DownloadManager {
    detectOperatingSystem() {
        const OS_PLATFORM = os_1.default.platform();
        switch (OS_PLATFORM) {
            case "win32":
                return osEnum_1.default.Win32;
            case "linux":
                return osEnum_1.default.Linux;
            case "darwin":
                return osEnum_1.default.Darwin;
            default:
                return osEnum_1.default.Unknown;
        }
    }
    handleLinuxDownloadRequest(response, resolv) {
        let responseData = "";
        response.on("data", (chunk) => responseData += chunk);
        response.on("end", function () {
            try {
                resolv(JSON.parse(responseData));
            }
            catch (error) {
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
        response.on("error", function () {
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
    downloadHelper(ASSET) {
        const ARCHIVE_FILE = fs_1.default.createWriteStream(ASSET.name);
        actionCore.info(`Found binary asset archived: ${ASSET.name}`);
        actionCore.info(`Download from: ${ASSET.browser_download_url}`);
        const USER_AGENT = {
            headers: {
                "User-Agent": "GoHookActions"
            }
        };
        follow_redirects_1.https.get(ASSET.browser_download_url, USER_AGENT, (response) => {
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
            response.on("data", function (chunk) {
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
            ARCHIVE_FILE.on("finish", function () {
                ARCHIVE_FILE.close();
                actionCore.info(`Successfully download the GoHook archived: ${ASSET.name}`);
            });
            response.on("error", function (error) {
                actionCore.info("Error when download GoHook archived.");
                actionCore.info(`Full message error: ${error.message}`);
                return;
            });
        });
    }
    async linuxDownloadSpecifyVersion(versionTag) {
        const API_PATH = `${DownloadManager.RELEASE_PAGE_URL}/tags/${versionTag}`;
        const LINUX_ASSET_NAME = "GoHook_linux.tar.gz";
        const OPTIONS = {
            hostname: DownloadManager.API_HOST_NAME,
            path: API_PATH,
            method: "GET",
            headers: {
                "User-Agent": "GoHookActions",
                "Accept": "application/json"
            }
        };
        const RELEASE_DATA = await new Promise((resolv) => {
            const REQUEST = https_1.default.request(OPTIONS, (response) => {
                this.handleLinuxDownloadRequest(response, resolv);
            });
            REQUEST.end();
        });
        const ASSET = RELEASE_DATA.assets?.find(asset => asset.name === LINUX_ASSET_NAME);
        if (!ASSET) {
            actionCore.setFailed("Binary asset not found, maybe it's not found.");
            return;
        }
        this.downloadHelper(ASSET);
    }
    async DownloadSpecifyVersionGoHook(versionTag) {
        const OS = this.detectOperatingSystem();
        if (OS == osEnum_1.default.Linux) {
            await this.linuxDownloadSpecifyVersion(versionTag);
        }
    }
}
DownloadManager.API_HOST_NAME = "api.github.com";
DownloadManager.RELEASE_PAGE_URL = "/repos/Reim-developer/GoHook/releases";
exports.default = DownloadManager;
