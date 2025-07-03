import * as actionCore from "@actions/core"
import * as fs from "fs"

class ConfigManager {
    public configPath: string;

    constructor() {
        this.configPath = actionCore.getInput("config", {
            required: true
        });
    }

    public GetConfigPath(): string {
        return this.configPath;
    }

    public IsValidConfigPath(): boolean {
        return fs.existsSync(this.configPath);
    }
}

export default ConfigManager;