"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot_message = void 0;
exports.bot_message = {
    check: (user_count, signed_count, date) => `
  تاریخ شروع اتصال اعضا به ربات: ${new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
        dateStyle: "full",
        timeStyle: "medium",
    }).format(new Date(date * 1000))}
  تعداد اعضای گروه: ${user_count}
اعضای ثبت شده: ${signed_count}`,
    init: (user_count, signed_count) => `📢 اطلاعیه
دوستان عزیز برای هماهنگی‌های لازم و اطلاع رسانی‌ها
لطفا همه اعضا گروه  از طریق کلیک روی عکس یا اسم این ربات و یا از طریق ایدی 
@SepehrAC_bot
وارد  ربات بشن و ربات رو start کنن تا عضویتشون ثبت بشه✅
بعد از مدت زمان تعیین شده دوستانی که عضویتشون ثبت نشده باشه از گروه حذف خواهند شد.
تعداد اعضای گروه: ${user_count}
اعضای ثبت شده: ${signed_count}`,
    user_first_start: (groupList) => `عضویت شما در گروه${groupList.length > 1 ? "‌های" : ""}
${groupList.join("\n")} 
با موفقیت تایید شد✅
⚠️از این ربات برای اطلاع رسانی ها استفاده میشه ربات رو پاک نکنید⚠️
`,
    user_allready_start: (groupList) => `عضویت شما از قبل در گروه${groupList.length > 1 ? "های" : ""}
${groupList.join("\n")} 
تایید شده بود`,
    user_notfound: "شما در هیچ یک از گروه هایی که من هستم عضو نیستید",
    getMessageStatus: (message, date, reciver, seen) => `متن پیام:\n ${message}\n\nتاریخ ارسال: ${new Intl.DateTimeFormat("fa-IR-u-nu-latn", { dateStyle: "full", timeStyle: "medium" }).format(new Date(date))}\nتعداد دریافت کننده ها: ${reciver}\nتعداد بازدید: ${seen}`,
    backup: "پشتیبان گیری از داده ها با موفقیت آغاز شد",
};
