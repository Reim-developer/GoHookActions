import BinaryManager from "../binaryManger";

(async function (): Promise<void> {
    let binaryManger = new BinaryManager();
    let versionTag = await binaryManger.GetLatestVersion();

    if (versionTag != null) {
        console.log(`Latest version of GoHook ${versionTag}`);
    }
})();