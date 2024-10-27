import { CommandContext, Context, InlineKeyboard } from "grammy";
import { group_data, queryData } from "../definitions/type";
import { isAdmin, isInGroup } from "./common";
import { read } from "../storage";
import { queryPF } from "../definitions/prefix";

export const groupMenu = async (ctx: CommandContext<Context>) => {
  if (isInGroup(ctx)) return;
  if (isAdmin(ctx)) {
    try {
      const groupList: group_data[] = read("groupList");
      const buttonRows = [];
      for (let index = 0; index < groupList.length; index += 2) {
        let Temp = [];
        const queryCallback: queryData = {
          query: queryPF.selectGroup,
          data: [groupList[index].id.toString()],
        };
        const leftButton = InlineKeyboard.text(
          groupList[index].title,
          JSON.stringify(queryCallback)
        );

        Temp.push(leftButton);
        if (index + 1 < groupList.length) {
          const queryCallback: queryData = {
            query: queryPF.selectGroup,
            data: [groupList[index + 1].id.toString()],
          };
          const righButton = InlineKeyboard.text(
            groupList[index + 1].title,
            JSON.stringify(queryCallback)
          );
          Temp.push(righButton);
        }
        buttonRows.push(Temp);
      }

      const keyboard = InlineKeyboard.from(buttonRows);
      // Send inline keyboard with message.
      await ctx.reply("گروه مورد نظر خود را برای مدیریت انتخاب کنید", {
        reply_markup: keyboard,
      });
    } catch (error) {
      console.log(error);
    }
  }
};
