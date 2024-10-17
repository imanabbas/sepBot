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
exports.bot = void 0;
const grammy_1 = require("grammy");
require("dotenv/config");
const types_1 = require("grammy/types");
const chat_members_1 = require("@grammyjs/chat-members");
const storage_1 = require("./core/storage");
const constant_1 = require("./core/definitions/constant");
const start_1 = require("./core/utils/start");
const common_1 = require("./core/utils/common");
const init_1 = require("./core/utils/init");
const groupMenu_1 = require("./core/utils/groupMenu");
const prefix_1 = require("./core/definitions/prefix");
const bot = new grammy_1.Bot(process.env.SECRET_KEY || "");
exports.bot = bot;
const adapter = new grammy_1.MemorySessionStorage();
bot.use((0, chat_members_1.chatMembers)(adapter));
bot.command("start", start_1.start);
bot.command("init", init_1.init);
bot.command("menu", groupMenu_1.groupMenu);
bot.on("callback_query:data", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const command = JSON.parse(ctx.callbackQuery.data);
    if ((0, common_1.isAdmin)(ctx)) {
        console.log(ctx.callbackQuery.data);
        switch (command.query) {
            case "group":
                const buttonRows = [];
                const groupId = command.data[0];
                const step = { data: groupId, message: "", step: "ATG" };
                common_1.userState[ctx.from.id] = step;
                const sendMessageButton = grammy_1.InlineKeyboard.text("ارسال پیام 📝", JSON.stringify({
                    query: prefix_1.queryPF.sendMessage,
                    data: [groupId],
                }));
                const checkConnectionButton = grammy_1.InlineKeyboard.text("وضعیت اتصال🔗", JSON.stringify({
                    query: prefix_1.queryPF.checkConnection,
                    data: [groupId],
                }));
                const checkMessagesButton = grammy_1.InlineKeyboard.text("پیام‌های ارسالی 📤", JSON.stringify({
                    query: prefix_1.queryPF.seeMessages,
                    data: [groupId],
                }));
                const backupGroupButton = grammy_1.InlineKeyboard.text("پشتیبان‌گیری از داده‌ها 💾", JSON.stringify({
                    query: prefix_1.queryPF.backupData,
                    data: [groupId],
                }));
                buttonRows.push([sendMessageButton], [checkConnectionButton], [checkMessagesButton], [backupGroupButton]);
                const keyboard = grammy_1.InlineKeyboard.from(buttonRows);
                yield ctx.editMessageText("دستور مورد نظر خود را انتخاب کنید", {
                    reply_markup: keyboard,
                });
                break;
            case "message":
                const group = (0, storage_1.read)(command.data[0]);
                const { id, title } = group;
                yield ctx.editMessageText(`پیام مورد نظر را برای ارسال به اعضاء گروه ${title} وارد کنید`);
                break;
            case "seeMessages":
                const groupToGetMessages = (0, storage_1.read)(command.data[0]);
                const MessagesList = groupToGetMessages.messages;
                let indexOfMessages = 0;
                ctx.editMessageText(`بازبینی پیام های گروه: ${groupToGetMessages.title}`);
                const sendMessagesStatus = (index) => __awaiter(void 0, void 0, void 0, function* () {
                    if (!(index < MessagesList.length)) {
                        ctx.answerCallbackQuery("done!");
                        return;
                    }
                    const { date, message, sentTo } = MessagesList[index];
                    yield ctx.reply(constant_1.bot_message.getMessageStatus(message, date, sentTo.length, sentTo.filter((user) => user.read === true).length));
                    index++;
                    sendMessagesStatus(index);
                });
                sendMessagesStatus(indexOfMessages);
                break;
            case "sendIt":
                console.log(JSON.stringify(ctx), "where is date");
                const state = common_1.userState[ctx.from.id];
                const date = ((_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.date) || new Date().getTime();
                const { message } = state;
                const groupToSendMessage = (0, storage_1.read)(state.data);
                const sentTo = [];
                const delay = 500;
                let indexOfSendMessage = 0;
                yield ctx.editMessageText(`فرایند ارسال پیام ها با موفقیت شروع شد.\n زمان تقریبی ارسال تمامی پیام ها: ${(groupToSendMessage.user_connect.conected_user.length * delay) /
                    1000} ثانیه`);
                const sendMessage = (index) => __awaiter(void 0, void 0, void 0, function* () {
                    if (index + 1 >
                        groupToSendMessage.user_connect.conected_user.length) {
                        groupToSendMessage.messages.push({
                            date,
                            message: message || "",
                            readBy: [],
                            sentTo,
                        });
                        (0, storage_1.write)(state.data, groupToSendMessage);
                        delete common_1.userState[ctx.from.id];
                        ctx.reply("پیام ها با موفقیت ارسال شد");
                        return;
                    }
                    console.log(index);
                    const user = groupToSendMessage.user_connect.conected_user[index];
                    const readMessageButton = grammy_1.InlineKeyboard.text("پیام رو خوندم", JSON.stringify({
                        query: prefix_1.queryPF.readMessage,
                        data: [groupToSendMessage.id, date],
                    }));
                    const m = yield bot.api.sendMessage(user.id, message || "", {
                        reply_markup: grammy_1.InlineKeyboard.from([[readMessageButton]]),
                    });
                    if (m)
                        sentTo.push(Object.assign(Object.assign({}, user), { read: false, read_date: 0 }));
                    index++;
                    sendMessage(index);
                });
                sendMessage(indexOfSendMessage);
                break;
            case prefix_1.queryPF.backupData:
                try {
                    const filePath = "./core/storage/data/" + command.data[0] + ".json";
                    yield ctx.editMessageText(constant_1.bot_message.backup);
                    const res = yield ctx.replyWithDocument(new types_1.InputFile(filePath));
                    yield ctx.reply("پشتیبان گیری با موفقیت انجام شد");
                }
                catch (error) {
                    yield ctx.reply("پشتیبان گیری به مشکل خورد");
                }
                break;
            case prefix_1.queryPF.checkConnection:
                const fileName = command.data[0];
                const groupData = (0, storage_1.read)(fileName);
                const { date: dateofConnect, user_count, conected_user, } = groupData.user_connect;
                yield ctx.editMessageText(constant_1.bot_message.check(user_count, conected_user.length, dateofConnect));
                break;
            case prefix_1.queryPF.readMessage:
                //done in commen query
                break;
            default:
                yield ctx.answerCallbackQuery("این بخش تکمیل نشده"); // remove loading animation
                break;
        }
    }
    else {
        //user query command
    }
    //common command
    switch (command.query) {
        case "read":
            const userId = ctx.from.id;
            const dateOfRead = ((_b = ctx.update.message) === null || _b === void 0 ? void 0 : _b.date) || new Date().getTime();
            console.log(JSON.stringify(ctx));
            const groupData = (0, storage_1.read)(command.data[0]);
            let indexOfMessage = 0;
            const messageToAddSeen = groupData.messages.find((message, index) => {
                if (message.date == parseInt(command.data[1])) {
                    indexOfMessage = index;
                    return true;
                }
                return false;
            });
            if (messageToAddSeen) {
                let isAdded = false;
                const newSentTo = (_c = groupData.messages[indexOfMessage].sentTo) === null || _c === void 0 ? void 0 : _c.map((user) => {
                    if (user.id == userId) {
                        user.read = true;
                        user.read_date = dateOfRead;
                        isAdded = true;
                    }
                    return user;
                });
                if (isAdded) {
                    groupData.messages[indexOfMessage].sentTo = newSentTo;
                    (0, storage_1.write)(command.data[0], groupData);
                    const editedMessage = (((_d = ctx.update.callback_query.message) === null || _d === void 0 ? void 0 : _d.text) || "") +
                        "\nخواندن پیام ثبت شد";
                    const oldMessage = (_e = ctx.update.message) === null || _e === void 0 ? void 0 : _e.text;
                    if (editedMessage != oldMessage) {
                        ctx.editMessageText(editedMessage);
                    }
                }
                else {
                    ctx.reply("نمیدونم چرا پیدات نکردم تو لیست :/");
                }
            }
            else {
                ctx.reply("پیام مورد نظر پیدا نشد");
            }
            break;
        default:
            //   await ctx.call("این بخش تکمیل نشده"); // remove loading animation
            break;
    }
}));
bot.on("message", (ctx) => {
    if ((0, common_1.isInGroup)(ctx))
        return;
    if ((0, common_1.isAdmin)(ctx)) {
        const state = common_1.userState[ctx.from.id];
        if (state && state.step == "ATG") {
            state.message = ctx.message.text;
            common_1.userState[ctx.from.id] = state;
            const { text, date } = ctx.message;
            const groupToSendMessage = (0, storage_1.read)(state.data);
            const readMessageButton = new grammy_1.InlineKeyboard()
                .text("اصلاح پیام", JSON.stringify({ query: prefix_1.queryPF.sendMessage, data: [state.data] }))
                .text("ارسال پیام", JSON.stringify({ query: prefix_1.queryPF.acceptSend, data: [state.data] }));
            ctx.reply(`پیش نمایش ارسال پیام به اعضاء گروه: ${groupToSendMessage.title}\n\n${text}`, {
                reply_markup: readMessageButton,
            });
        }
        else {
            ctx.reply("متوجه دستور نشدم برای شروع میتونی روی /menu بزنی");
        }
    }
    else {
        ctx.reply("غیر از /start و خوندن پیاما کار دیگه ایی نمیشه کرد :)");
    }
});
bot.start({
    allowed_updates: ["chat_member", "message", "callback_query"],
});
console.log("start of app");
const m = {
    update: {
        update_id: 935405886,
        callback_query: {
            id: "1196742587743003700",
            from: {
                id: 278638346,
                is_bot: false,
                first_name: "a.b",
                username: "ab_bhd",
                language_code: "en",
            },
            message: {
                message_id: 493,
                from: {
                    id: 8136871017,
                    is_bot: true,
                    first_name: "Sepehr",
                    username: "SepehrAC_bot",
                },
                chat: {
                    id: 278638346,
                    first_name: "a.b",
                    username: "ab_bhd",
                    type: "private",
                },
                date: 1728473925,
                text: "lskdlsdklskd",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "پیام رو خوندم",
                                callback_data: "read|-1002276283321|1728473923780",
                            },
                        ],
                    ],
                },
            },
            chat_instance: "1026935981196543083",
            data: "read|-1002276283321|1728473923780",
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
};
