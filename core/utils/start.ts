import { CommandContext, Context } from "grammy";
import { group_connect, group_data, userData } from "../definitions/type";
import { read, write } from "../storage";
import { isInGroup } from "./common";
import { bot } from "../../bot";
import { bot_message } from "../definitions/constant";

export const start = async (ctx: CommandContext<Context>) => {
  if (isInGroup(ctx)) return;
  const groupList: group_data[] = read("groupList");
  const groupsToBeCheck: group_connect[] = [];
  const groupsAllreadyIn = [];
  const groupToAddUserToList: group_connect[] = [];
  let newUser: userData | null = null;

  if (ctx.from) {
    for (let index = 0; index < groupList.length; index++) {
      const groupData: group_connect = read(groupList[index].id.toString());
      const user = groupData.user_connect.conected_user.find(
        (user) => user.id == ctx.from?.id
      );
      if (user) {
        groupsAllreadyIn.push(groupData.title);
      } else {
        groupsToBeCheck.push(groupData);
      }
    }
  }

  for (let index = 0; index < groupsToBeCheck.length; index++) {
    if (ctx.from) {
      try {
        const userDataFoundInGroup = await bot.api.getChatMember(
          groupsToBeCheck[index].id,
          ctx.from.id
        );
        if (!newUser) {
          const { id, first_name, last_name, username } =
            userDataFoundInGroup.user;
          newUser = { id, first_name, last_name, username };
        }
        groupToAddUserToList.push(groupsToBeCheck[index]);
      } catch (error) {
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
          const groupDB: group_connect = read(groupId.toString());
          console.log(
            "pei",
            JSON.stringify(ctx.from),
            JSON.stringify(ctx.update)
          );

          groupDB.user_connect.conected_user.push({ ...newUser, chat_id });
          write(groupId.toString(), groupDB);
          addedGroupData.push(groupToAddUserToList[index].title);

          const { user_count, conected_user, message_id } =
            groupDB.user_connect;

          bot.api.editMessageText(
            chat_id,
            message_id,
            bot_message.init(user_count, conected_user.length)
          );
        }
      } catch (error) {}
    }
    if (addedGroupData.length > 0) {
      ctx.reply(bot_message.user_first_start(addedGroupData));
    }
  } else {
    if (groupsAllreadyIn.length > 0) {
      ctx.reply(bot_message.user_allready_start(groupsAllreadyIn));
    } else ctx.reply(bot_message.user_notfound);
  }
};
