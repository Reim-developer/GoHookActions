"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actionManager_1 = __importDefault(require("./actionManager"));
(async function () {
    let actionManager = new actionManager_1.default();
    await actionManager.run();
})();
