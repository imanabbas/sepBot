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
exports.init = void 0;
const storage_1 = require("../storage");
const common_1 = require("./common");
const constant_1 = require("../definitions/constant");
const init = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const chat_type = (_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat.type;
    const isMessage = ctx.update.message;
    console.log("test init");
    if (isMessage &&
        (chat_type == "group" || chat_type == "supergroup") &&
        (0, common_1.isAdmin)(ctx)) {
        const groupId = ctx.update.message.chat.id;
        const user_count = yield ctx.getChatMemberCount();
        if ((0, common_1.isExist)(groupId.toString())) {
            const groupData = (0, storage_1.read)(groupId);
            const message = yield ctx.reply(constant_1.bot_message.init(user_count, groupData.user_connect.conected_user.length));
            const commandMessage = ctx.update.message.message_id;
            const oldMessage = groupData.user_connect.message_id;
            try {
                ctx.deleteMessages([commandMessage, oldMessage]);
            }
            catch (error) { }
            const message_id = message.message_id;
            groupData.user_connect.message_id = message_id;
            groupData.user_connect.user_count = user_count;
            (0, storage_1.write)(groupId.toString(), groupData);
        }
        else {
            console.log(JSON.stringify(ctx));
            const { id, title } = (_b = ctx.update.message) === null || _b === void 0 ? void 0 : _b.chat;
            const { date } = ctx.update.message;
            const newInit = {
                id,
                title,
                messages: [],
                user_connect: {
                    date,
                    message_id: -1,
                    user_count,
                    conected_user: [],
                },
            };
            const message = yield ctx.reply("prossing!");
            const message_id = message.message_id;
            newInit.user_connect.message_id = message_id;
            (0, storage_1.write)(groupId.toString(), newInit);
            const groupList = (0, storage_1.read)("groupList");
            groupList.push({ id: newInit.id, title: newInit.title });
            (0, storage_1.write)("groupList", groupList);
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                const test = yield ctx.editMessageText(constant_1.bot_message.init(user_count, 0), {
                    // @ts-ignore
                    chat_id: message.chat.id,
                    message_id,
                });
                console.log(test);
            }), 200);
        }
    }
});
exports.init = init;
const s = {
    update: {
        update_id: 935406040,
        message: {
            message_id: 185,
            from: {
                id: 278638346,
                is_bot: false,
                first_name: "a.b",
                username: "ab_bhd",
                language_code: "en",
            },
            chat: { id: -1002276283321, title: "test bot", type: "supergroup" },
            date: 1728560094,
            text: "/init",
            entities: [{ offset: 0, length: 5, type: "bot_command" }],
        },
    },
    api: {
        token: "8136871017:AAGGRFDesKmyt_EWO1fH3W5acIcd9J_HbnU",
        raw: {},
        config: {},
    },
    me: {
        id: 8136871017,
        is_bot: true,
        first_name: "Sepehr",
        username: "SepehrAC_bot",
        can_join_groups: true,
        can_read_all_group_messages: true,
        supports_inline_queries: false,
        can_connect_to_business: false,
        has_main_web_app: false,
    },
    chatMembers: {},
    match: "",
};
