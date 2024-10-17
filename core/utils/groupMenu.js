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
exports.groupMenu = void 0;
const grammy_1 = require("grammy");
const common_1 = require("./common");
const storage_1 = require("../storage");
const prefix_1 = require("../definitions/prefix");
const groupMenu = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, common_1.isInGroup)(ctx))
        return;
    if ((0, common_1.isAdmin)(ctx)) {
        try {
            const groupList = (0, storage_1.read)("groupList");
            const buttonRows = [];
            for (let index = 0; index < groupList.length; index += 2) {
                let Temp = [];
                const queryCallback = {
                    query: prefix_1.queryPF.selectGroup,
                    data: [groupList[index].id.toString()],
                };
                const leftButton = grammy_1.InlineKeyboard.text(groupList[index].title, JSON.stringify(queryCallback));
                Temp.push(leftButton);
                if (index + 1 < groupList.length) {
                    const queryCallback = {
                        query: prefix_1.queryPF.selectGroup,
                        data: [groupList[index + 1].id.toString()],
                    };
                    const righButton = grammy_1.InlineKeyboard.text(groupList[index + 1].title, JSON.stringify(queryCallback));
                    Temp.push(righButton);
                }
                buttonRows.push(Temp);
            }
            const keyboard = grammy_1.InlineKeyboard.from(buttonRows);
            // Send inline keyboard with message.
            yield ctx.reply("گروه مورد نظر خود را برای مدیریت انتخاب کنید", {
                reply_markup: keyboard,
            });
        }
        catch (error) {
            console.log(error);
        }
    }
});
exports.groupMenu = groupMenu;
