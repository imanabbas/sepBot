"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.write = exports.read = void 0;
const jfs_1 = __importDefault(require("jfs"));
const path = "./core/storage/data";
const prettyDB = new jfs_1.default(path, { pretty: true });
const read = (key) => {
    if (typeof key == "number")
        key = key.toString();
    try {
        const data = prettyDB.getSync(key);
        const cloned = JSON.parse(JSON.stringify(data));
        if (Object.keys(cloned).length > 0 || Array.isArray(cloned)) {
            return cloned;
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.log("read file error:", error);
        return null;
    }
};
exports.read = read;
const write = (key, data) => {
    if (typeof key == "number")
        key = key.toString();
    try {
        prettyDB.saveSync(key, data);
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.write = write;
