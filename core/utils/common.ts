import { group_data, state, stateObj } from "../definitions/type";
import { read } from "../storage";

let userState: stateObj = {};

const isInGroup = (ctx: any) => {
  //   console.log(JSON.stringify(ctx));
  const place = ctx.update.message.chat.type;
  return place == "group" || place == "supergroup";
};
const isAdmin = (ctx: any) => {
  const adminsId = [278638346, 92717742];
  const userId = ctx.from.id;
  return adminsId.includes(userId);
};

const isExist = (group_id: string) => {
  const groupList: group_data[] = read("groupList");
  const inList = groupList.find((group) => group.id == parseInt(group_id) * -1);
  if (!inList) return false;
  const data = read(group_id);
  return Boolean(data);
};

export { isAdmin, isExist, isInGroup, userState };
