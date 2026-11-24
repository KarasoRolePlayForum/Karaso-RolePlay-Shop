پنل مدیریت CMDهای دستورات استف (Owner-only)

چه اضافه شده:
- staff-commands-admin.html / .css / .js: پنل اختصاصی Owner برای افزودن، ویرایش و حذف CMD.
- staff-commands-owner-link.js: نمایش لینک پنل فقط وقتی کاربر Owner باشد.
- staff-commands.js: بارگیری CMDهای سفارشی از Supabase و نمایش در گروه رنک مناسب.
- KARASO_STAFF_COMMANDS_OWNER_PANEL.sql: ساخت جدول و سیاست‌های امنیتی RLS.

راه‌اندازی ضروری:
1) فایل KARASO_STAFF_COMMANDS_OWNER_PANEL.sql را باز کنید.
2) تمام SQL را در Supabase Dashboard > SQL Editor اجرا کنید (Run).
3) سپس فایل‌های ZIP را روی مخزن GitHub جایگزین کنید.
4) با حساب Owner وارد سایت شوید و صفحه دستورات استف را باز کنید. لینک «پنل مدیریت دستورات (Owner)» باید ظاهر شود.
5) در پنل می‌توانید نوع دسته (ادمین/CM یا هلپر)، نام رنک، CMD، Syntax و توضیح را ثبت کنید.

امنیت:
- جدول RLS دارد. خواندن برای صفحه عمومی باز است.
- Insert/Update/Delete فقط برای profiles.role='owner' مجاز است. کنترل سمت مرورگر صرفاً برای نمایش رابط است؛ امنیت اصلی با RLS اعمال می‌شود.
- نقش admin به پنل دسترسی ندارد، فقط owner.
