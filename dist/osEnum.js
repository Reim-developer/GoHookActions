"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OperatingSystem;
(function (OperatingSystem) {
    OperatingSystem[OperatingSystem["Win32"] = 0] = "Win32";
    OperatingSystem[OperatingSystem["Linux"] = 1] = "Linux";
    OperatingSystem[OperatingSystem["Darwin"] = 2] = "Darwin";
    OperatingSystem[OperatingSystem["Unknown"] = 3] = "Unknown";
})(OperatingSystem || (OperatingSystem = {}));
exports.default = OperatingSystem;
