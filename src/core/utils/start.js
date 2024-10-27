"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const storage_1 = require("../storage");
const common_1 = require("./common");
const bot_1 = require("../../bot");
const constant_1 = require("../definitions/constant");
const start = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, common_1.isInGroup)(ctx))
        return;
    const groupList = (0, storage_1.read)("groupList");
    const groupsToBeCheck = [];
    const groupsAllreadyIn = [];
    const groupToAddUserToList = [];
    let newUser = null;
    if (ctx.from) {
        for (let index = 0; index < groupList.length; index++) {
            const groupData = (0, storage_1.read)(groupList[index].id.toString());
            const user = groupData.user_connect.conected_user.find((user) => { var _a; return user.id == ((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id); });
            if (user) {
                groupsAllreadyIn.push(groupData.title);
            }
            else {
                groupsToBeCheck.push(groupData);
            }
        }
    }
    for (let index = 0; index < groupsToBeCheck.length; index++) {
        if (ctx.from) {
            try {
                const userDataFoundInGroup = yield bot_1.bot.api.getChatMember(groupsToBeCheck[index].id, ctx.from.id);
                if (!newUser) {
                    const { id, first_name, last_name, username } = userDataFoundInGroup.user;
                    newUser = { id, first_name, last_name, username };
                }
                groupToAddUserToList.push(groupsToBeCheck[index]);
            }
            catch (error) {
                console.log("why");
            }
        }
    }
    if (groupToAddUserToList.length > 0) {
        const addedGroupData = [];
        for (let index = 0; index < groupToAddUserToList.length; index++) {
            try {
                if (newUser) {
                    const chat_id = groupToAddUserToList[index].id;
                    const groupId = chat_id;
                    const groupDB = (0, storage_1.read)(groupId.toString());
                    console.log("pei", JSON.stringify(ctx.from), JSON.stringify(ctx.update));
                    groupDB.user_connect.conected_user.push(Object.assign(Object.assign({}, newUser), { chat_id }));
                    (0, storage_1.write)(groupId.toString(), groupDB);
                    addedGroupData.push(groupToAddUserToList[index].title);
                    const { user_count, conected_user, message_id } = groupDB.user_connect;
                    bot_1.bot.api.editMessageText(chat_id, message_id, constant_1.bot_message.init(user_count, conected_user.length));
                }
            }
            catch (error) { }
        }
        if (addedGroupData.length > 0) {
            ctx.reply(constant_1.bot_message.user_first_start(addedGroupData));
        }
    }
    else {
        if (groupsAllreadyIn.length > 0) {
            ctx.reply(constant_1.bot_message.user_allready_start(groupsAllreadyIn));
        }
        else
            ctx.reply(constant_1.bot_message.user_notfound);
    }
});
exports.start = start;
