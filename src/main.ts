import ActionManager from "./actionManager";

(async function () {
    let actionManager = new ActionManager();
    await actionManager.run();
})();