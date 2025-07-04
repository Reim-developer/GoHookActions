import BinaryManager from "../binaryManger";
import assert from "assert"

(async function (): Promise<void> {
    let binaryManger = new BinaryManager();
    let versionTag = "v1.1.1";

    let version = await binaryManger.GetSpecifyVersion(versionTag);
    const ERROR_MESSAGE = `[Specify Version Test] Test FAILED with:\nActual version: ${version}\nExpected version: ${versionTag}`

    assert.strictEqual(version, versionTag, ERROR_MESSAGE);
})();