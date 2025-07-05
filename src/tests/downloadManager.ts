import DownloadManager from "../downloadManager";

(async () => {
    let download = new DownloadManager();
    await download.DownloadGoHookArchived("v1.1.1");
})();