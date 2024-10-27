import { CommandContext, Context } from "grammy";
import { group_connect, group_data } from "../definitions/type";
import { read, write } from "../storage";
import { isAdmin, isExist } from "./common";
import { bot_message } from "../definitions/constant";

export const init = async (ctx: CommandContext<Context>) => {
  const chat_type = ctx.update.message?.chat.type;
  const isMessage = ctx.update.message;
  console.log("test init");

  if (
    isMessage &&
    (chat_type == "group" || chat_type == "supergroup") &&
    isAdmin(ctx)
  ) {
    const groupId = ctx.update.message.chat.id;

    const user_count = await ctx.getChatMemberCount();
    if (isExist(groupId.toString())) {
      const groupData: group_connect = read(groupId);
      const message = await ctx.reply(
        bot_message.init(
          user_count,
          groupData.user_connect.conected_user.length
        )
      );
      const commandMessage = ctx.update.message.message_id;
      const oldMessage = groupData.user_connect.message_id;
      try {
        ctx.deleteMessages([commandMessage, oldMessage]);
      } catch (error) {}
      const message_id = message.message_id;
      groupData.user_connect.message_id = message_id;
      groupData.user_connect.user_count = user_count;
      write(groupId.toString(), groupData);
    } else {
      console.log(JSON.stringify(ctx));

      const { id, title } = ctx.update.message?.chat;
      const { date } = ctx.update.message;
      const newInit: group_connect = {
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
      const message = await ctx.reply("prossing!");
      const message_id = message.message_id;
      newInit.user_connect.message_id = message_id;
      write(groupId.toString(), newInit);
      const groupList: group_data[] = read("groupList");
      groupList.push({ id: newInit.id, title: newInit.title });
      write("groupList", groupList);
      setTimeout(async () => {
        const test = await ctx.editMessageText(
          bot_message.init(user_count, 0),
          {
            // @ts-ignore
            chat_id: message.chat.id,
            message_id,
          }
        );
        console.log(test);
      }, 200);
    }
  }
};

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
