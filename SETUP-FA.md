# راه‌اندازی Supabase برای سایت NMB

این نسخه برای GitHub Pages + Supabase Free ساخته شده است.

## 1) ساخت دیتابیس
1. وارد پروژه Supabase خودت شو.
2. از منوی سمت چپ **SQL Editor** را باز کن.
3. **New query** را بزن.
4. تمام محتوای فایل `setup.sql` را Paste کن.
5. **Run** را بزن.

این کار جدول‌های `messages`, `projects`, `admin_users` و Storage bucket به نام `project-images` را می‌سازد و چهار پروژه فعلی را هم وارد دیتابیس می‌کند.

## 2) ساخت اکانت مدیر
1. در Supabase برو به **Authentication > Users**.
2. یک کاربر با ایمیل خودت و یک رمز قوی بساز.
3. UUID / User ID آن کاربر را Copy کن.
4. برگرد به **SQL Editor** و این دستور را با UUID واقعی اجرا کن:

```sql
insert into public.admin_users (user_id)
values ('YOUR-AUTH-USER-UUID')
on conflict do nothing;
```

مثال: فقط UUID را عوض کن؛ رمزت را هیچ جا داخل کد سایت نگذار.

## 3) تست پنل
پس از اجرای SQL، فایل‌های سایت را روی GitHub Pages قرار بده و برو به:

`https://nasermbafghi.github.io/admin.html`

با همان ایمیل و رمزی که در Authentication ساختی وارد شو.

## 4) تست فرم پیام
در صفحه اصلی به Contact برو، فرم را ارسال کن. سپس در `admin.html` باید پیام را ببینی.

## 5) اضافه کردن پروژه
از پنل Admin روی **New project** بزن. عنوان، سال، توضیح، تکنولوژی‌ها و تصاویر را وارد کن. اگر گزینه Publish روشن باشد، پروژه در صفحه اصلی نمایش داده می‌شود.

## امنیت
- `supabase-config.js` فقط Publishable key دارد؛ این کلید برای کد سمت مرورگر است.
- هیچ `service_role` یا Secret key داخل سایت قرار نده.
- دسترسی واقعی با Row Level Security کنترل می‌شود.
- فقط User ID ثبت‌شده در `admin_users` اجازه مدیریت دارد.

## افزودن مدیریت سوابق کاری (Experience)
اگر قبلاً `setup.sql` را اجرا کرده‌اید، برای فعال کردن بخش جدید Experience فقط فایل `experience-upgrade.sql` را در Supabase > SQL Editor به صورت یک New query اجرا کنید.

بعد از اجرای موفق، فایل‌های جدید سایت را روی GitHub جایگزین کنید. در `admin.html` بخش Experience اضافه شده و می‌توانید عنوان شغلی، شرکت، بازه زمانی، توضیح، مسئولیت‌ها، ترتیب نمایش و Published/Draft را مدیریت کنید.
