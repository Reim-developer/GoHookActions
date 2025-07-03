import ConfigManager from "./configManager";
import * as actionCore from "@actions/core"

class ActionManager {
    private configManager: ConfigManager;

    constructor() {
        this.configManager = new ConfigManager();
    }

    public run(): void {
        if (!this.configManager.IsValidConfigPath()) {
            const wrongConfigPath = this.configManager.configPath;

            actionCore.setFailed(`Could not find your TOML config: ${wrongConfigPath}`);
            return
        }
        const configPath = this.configManager.GetConfigPath();

        actionCore.info(`${configPath}`);
    }
}

export default ActionManager;