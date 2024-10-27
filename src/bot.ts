import {
  Bot,
  type Context,
  InlineKeyboard,
  MemorySessionStorage,
} from "grammy";
import "dotenv/config";
import { InlineKeyboardButton, InputFile, type ChatMember } from "grammy/types";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";
import { addReplyParam } from "@roziscoding/grammy-autoquote";
import { read, write } from "./core/storage";
import {
  group_connect,
  queryData,
  reciver_message,
  state,
} from "./core/definitions/type";
import { bot_message } from "./core/definitions/constant";
import { start } from "./core/utils/start";
import { isAdmin, isInGroup, userState } from "./core/utils/common";
import { init } from "./core/utils/init";
import { groupMenu } from "./core/utils/groupMenu";
import { queryPF } from "./core/definitions/prefix";
import { createReadStream } from "fs";

type MyContext = Context & ChatMembersFlavor;
const bot = new Bot<MyContext>(process.env.SECRET_KEY || "");

const adapter = new MemorySessionStorage<ChatMember>();
bot.use(chatMembers(adapter));

bot.command("start", start);
bot.command("init", init);
bot.command("menu", groupMenu);
bot.on("callback_query:data", async (ctx) => {
  const command: queryData = JSON.parse(ctx.callbackQuery.data);

  if (isAdmin(ctx)) {
    console.log(ctx.callbackQuery.data);

    switch (command.query) {
      case "group":
        const buttonRows: any = [];
        const groupId = command.data[0];
        const step: state = { data: groupId, message: "", step: "ATG" };
        userState[ctx.from.id] = step;
        const sendMessageButton = InlineKeyboard.text(
          "ارسال پیام 📝",
          JSON.stringify({
            query: queryPF.sendMessage,
            data: [groupId],
          })
        );
        const checkConnectionButton = InlineKeyboard.text(
          "وضعیت اتصال🔗",
          JSON.stringify({
            query: queryPF.checkConnection,
            data: [groupId],
          })
        );
        const checkMessagesButton = InlineKeyboard.text(
          "پیام‌های ارسالی 📤",
          JSON.stringify({
            query: queryPF.seeMessages,
            data: [groupId],
          })
        );
        const backupGroupButton = InlineKeyboard.text(
          "پشتیبان‌گیری از داده‌ها 💾",
          JSON.stringify({
            query: queryPF.backupData,
            data: [groupId],
          })
        );
        buttonRows.push(
          [sendMessageButton],
          [checkConnectionButton],
          [checkMessagesButton],
          [backupGroupButton]
        );
        const keyboard = InlineKeyboard.from(buttonRows);
        await ctx.editMessageText("دستور مورد نظر خود را انتخاب کنید", {
          reply_markup: keyboard,
        });
        break;

      case "message":
        const group: group_connect = read(command.data[0]);
        const { id, title } = group;
        await ctx.editMessageText(
          `پیام مورد نظر را برای ارسال به اعضاء گروه ${title} وارد کنید`
        );
        break;
      case "seeMessages":
        const groupToGetMessages: group_connect = read(command.data[0]);
        const MessagesList = groupToGetMessages.messages;
        let indexOfMessages = 0;
        ctx.editMessageText(
          `بازبینی پیام  های گروه: ${groupToGetMessages.title}`
        );
        const sendMessagesStatus = async (index: number) => {
          if (!(index < MessagesList.length)) {
            ctx.answerCallbackQuery("done!");
            return;
          }
          const { date, message, sentTo } = MessagesList[index];
          await ctx.reply(
            bot_message.getMessageStatus(
              message,
              date,
              sentTo.length,
              sentTo.filter((user) => user.read === true).length
            )
          );
          index++;
          sendMessagesStatus(index);
        };

        sendMessagesStatus(indexOfMessages);
        break;
      case "sendIt":
        console.log(JSON.stringify(ctx), "where is date");

        const state = userState[ctx.from.id];
        const date = ctx.update.message?.date || new Date().getTime();
        const { message } = state;
        const groupToSendMessage: group_connect = read(state.data);
        const sentTo: reciver_message[] = [];
        const delay = 500;
        let indexOfSendMessage = 0;
        await ctx.editMessageText(
          `فرایند ارسال پیام ها با موفقیت شروع شد.\n زمان تقریبی ارسال تمامی پیام ها: ${
            (groupToSendMessage.user_connect.conected_user.length * delay) /
            1000
          } ثانیه`
        );

        const sendMessage = async (index: number) => {
          if (
            index + 1 >
            groupToSendMessage.user_connect.conected_user.length
          ) {
            groupToSendMessage.messages.push({
              date,
              message: message || "",
              readBy: [],
              sentTo,
            });
            write(state.data, groupToSendMessage);
            delete userState[ctx.from.id];
            ctx.reply("پیام ها با موفقیت ارسال شد");
            return;
          }
          console.log(index);

          const user = groupToSendMessage.user_connect.conected_user[index];

          const readMessageButton = InlineKeyboard.text(
            "پیام رو خوندم",
            JSON.stringify({
              query: queryPF.readMessage,
              data: [groupToSendMessage.id, date],
            })
          );
          const m = await bot.api.sendMessage(user.id, message || "", {
            reply_markup: InlineKeyboard.from([[readMessageButton]]),
          });
          if (m) sentTo.push({ ...user, read: false, read_date: 0 });
          index++;
          sendMessage(index);
        };
        sendMessage(indexOfSendMessage);

        break;
      case queryPF.backupData:
        try {
          const filePath = "./core/storage/data/" + command.data[0] + ".json";
          await ctx.editMessageText(bot_message.backup);
          const res = await ctx.replyWithDocument(new InputFile(filePath));
          await ctx.reply("پشتیبان گیری با موفقیت انجام شد");
        } catch (error) {
          await ctx.reply("پشتیبان گیری به مشکل خورد");
        }
        break;

      case queryPF.checkConnection:
        const fileName = command.data[0];
        const groupData: group_connect = read(fileName);
        const {
          date: dateofConnect,
          user_count,
          conected_user,
        } = groupData.user_connect;
        await ctx.editMessageText(
          bot_message.check(user_count, conected_user.length, dateofConnect)
        );
        break;
      case queryPF.readMessage:
        //done in commen query
        break;

      default:
        await ctx.answerCallbackQuery("این بخش تکمیل نشده"); // remove loading animation
        break;
    }
  } else {
    //user query command
  }
  //common command
  switch (command.query) {
    case "read":
      const userId = ctx.from.id;
      const dateOfRead = ctx.update.message?.date || new Date().getTime();
      console.log(JSON.stringify(ctx));

      const groupData: group_connect = read(command.data[0]);
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
        const newSentTo = groupData.messages[indexOfMessage].sentTo?.map(
          (user) => {
            if (user.id == userId) {
              user.read = true;
              user.read_date = dateOfRead;
              isAdded = true;
            }
            return user;
          }
        );

        if (isAdded) {
          groupData.messages[indexOfMessage].sentTo = newSentTo;
          write(command.data[0], groupData);
          const editedMessage =
            (ctx.update.callback_query.message?.text || "") +
            "\nخواندن پیام ثبت شد";
          const oldMessage = ctx.update.message?.text;
          if (editedMessage != oldMessage) {
            ctx.editMessageText(editedMessage);
          }
        } else {
          ctx.reply("نمیدونم چرا پیدات نکردم تو لیست :/");
        }
      } else {
        ctx.reply("پیام مورد نظر پیدا نشد");
      }

      break;
    default:
      //   await ctx.call("این بخش تکمیل نشده"); // remove loading animation
      break;
  }
});

bot.on("message", (ctx) => {
  if (isInGroup(ctx)) return;
  if (isAdmin(ctx)) {
    const state = userState[ctx.from.id];
    if (state && state.step == "ATG") {
      state.message = ctx.message.text;
      userState[ctx.from.id] = state;
      const { text, date } = ctx.message;
      const groupToSendMessage: group_connect = read(state.data);
      const readMessageButton = new InlineKeyboard()
        .text(
          "اصلاح پیام",
          JSON.stringify({ query: queryPF.sendMessage, data: [state.data] })
        )
        .text(
          "ارسال پیام",
          JSON.stringify({ query: queryPF.acceptSend, data: [state.data] })
        );
      ctx.reply(
        `پیش نمایش ارسال پیام به اعضاء گروه: ${groupToSendMessage.title}\n\n${text}`,
        {
          reply_markup: readMessageButton,
        }
      );
    } else {
      ctx.reply("متوجه دستور نشدم برای شروع میتونی روی /menu بزنی");
    }
  } else {
    ctx.reply("غیر از /start و خوندن پیاما کار دیگه ایی نمیشه کرد :)");
  }
});

bot.start({
  allowed_updates: ["chat_member", "message", "callback_query"],
});
console.log("start of app");

export { bot };
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
