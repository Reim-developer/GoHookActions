import ConfigManager from "./configManager";
import * as actionCore from "@actions/core"
import DownloadManager from "./downloadManager";
import BinaryManager from "./binaryManger";

class ActionManager {
    private configManager: ConfigManager;
    private downloadManager: DownloadManager;
    private binaryManager: BinaryManager;

    constructor() {
        this.configManager = new ConfigManager();
        this.downloadManager = new DownloadManager();
        this.binaryManager = new BinaryManager();
    }

    public run(): void {
        if (!this.configManager.IsValidConfigPath()) {
            const wrongConfigPath = this.configManager.configPath;

            actionCore.setFailed(`Could not find your TOML config: ${wrongConfigPath}`);
            return
        }
        const configPath = this.configManager.GetConfigPath();

        actionCore.info(`Found your TOML configuration: ${configPath}`);
        actionCore.info("Started download GoHook archived:");



        (async () => {
            let lastestVersionTag = await this.binaryManager.GetLatestVersion();

            if (lastestVersionTag != null) {
                await this.downloadManager.DownloadGoHookArchived(lastestVersionTag);
            }
        })();
    }
}

export default ActionManager;