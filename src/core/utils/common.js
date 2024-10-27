"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userState = exports.isInGroup = exports.isExist = exports.isAdmin = void 0;
const storage_1 = require("../storage");
let userState = {};
exports.userState = userState;
const isInGroup = (ctx) => {
    //   console.log(JSON.stringify(ctx));
    const place = ctx.update.message.chat.type;
    return place == "group" || place == "supergroup";
};
exports.isInGroup = isInGroup;
const isAdmin = (ctx) => {
    const adminsId = [278638346, 92717742];
    const userId = ctx.from.id;
    return adminsId.includes(userId);
};
exports.isAdmin = isAdmin;
const isExist = (group_id) => {
    const groupList = (0, storage_1.read)("groupList");
    const inList = groupList.find((group) => group.id == parseInt(group_id) * -1);
    if (!inList)
        return false;
    const data = (0, storage_1.read)(group_id);
    return Boolean(data);
};
exports.isExist = isExist;
