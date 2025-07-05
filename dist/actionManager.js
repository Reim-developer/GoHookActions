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
const configManager_1 = __importDefault(require("./configManager"));
const actionCore = __importStar(require("@actions/core"));
const downloadManager_1 = __importDefault(require("./downloadManager"));
const binaryManger_1 = __importDefault(require("./binaryManger"));
class ActionManager {
    constructor() {
        this.configManager = new configManager_1.default();
        this.downloadManager = new downloadManager_1.default();
        this.binaryManager = new binaryManger_1.default();
    }
    run() {
        if (!this.configManager.IsValidConfigPath()) {
            const wrongConfigPath = this.configManager.configPath;
            actionCore.setFailed(`Could not find your TOML config: ${wrongConfigPath}`);
            return;
        }
        const configPath = this.configManager.GetConfigPath();
        actionCore.info(`Found your TOML configuration: ${configPath}`);
        actionCore.info("Started download GoHook archived:");
        (async () => {
            let lastestVersionTag = await this.binaryManager.GetLatestVersion();
            if (lastestVersionTag != null) {
                await this.downloadManager.DownloadGoHookArchived(lastestVersionTag);
            }
        });
    }
}
exports.default = ActionManager;
