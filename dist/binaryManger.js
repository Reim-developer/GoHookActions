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
Object.defineProperty(exports, "__esModule", { value: true });
const coreActions = __importStar(require("@actions/core"));
const https = __importStar(require("https"));
class BinaryManager {
    constructor() {
        this.version = coreActions.getInput("use-cli-version") || "latest";
    }
    async GetLatestVersion() {
        const RESULT = new Promise((resolv) => {
            const REQUEST_OPTIONS = {
                hostname: BinaryManager.API_HOST_NAME,
                path: `${BinaryManager.RELEASE_PAGE_URL}/${this.version}`,
                method: "GET",
                headers: {
                    "User-Agent": "GoHookActions"
                }
            };
            const REQUEST = https.request(REQUEST_OPTIONS, function (response) {
                let responseBody = "";
                response.on("data", (chunk) => responseBody += chunk);
                response.on("end", function () {
                    const JSON_DATA = JSON.parse(responseBody);
                    const BINARY_VERSION = JSON_DATA.tag_name;
                    if (!BINARY_VERSION) {
                        coreActions.setFailed("GitHub API did not return a valid tag name for latest release.");
                        return resolv(null);
                    }
                    resolv(BINARY_VERSION);
                });
            });
            REQUEST.on("error", function (error) {
                coreActions.setFailed(`Request to GitHub API is failed: ${error.message}`);
                return resolv(null);
            });
            REQUEST.end();
        });
        return RESULT;
    }
}
BinaryManager.API_HOST_NAME = "api.github.com";
BinaryManager.RELEASE_PAGE_URL = "/repos/Reim-developer/GoHook/releases";
exports.default = BinaryManager;
