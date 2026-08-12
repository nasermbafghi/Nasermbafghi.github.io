# ارتقای پنل مدیریت محتوا

این نسخه برای مدیریت تقریباً تمام محتوای سایت از پنل ادمین طراحی شده است.

## فقط یک بار در Supabase
1. Supabase > SQL Editor > New query
2. فایل `content-manager-upgrade.sql` را کامل کپی کنید.
3. Run را بزنید.
4. باید پیام `Success. No rows returned` یا پیام موفقیت مشابه ببینید.

این SQL اطلاعات قبلی Projects و Experience را حذف نمی‌کند و جدول‌های جدید را اضافه می‌کند.

## فایل‌های GitHub
فایل‌های عمومی نسخه جدید را جایگزین نسخه قبلی کنید:
- index.html
- style.css
- script.js
- site-supabase.js
- supabase-config.js
- admin.html
- admin.css
- admin.js
- naser.jpg
- پوشه images

فایل‌های SQL و MD لازم نیست روی GitHub منتشر شوند.

## چیزهایی که از Admin قابل مدیریت است
- متن اصلی سایت، About، Contact و SEO
- نمایش/مخفی‌سازی بخش‌ها
- CV/Resume: آپلود PDF + نمایش/عدم نمایش دکمه
- شماره تلفن، ایمیل، واتساپ و هر لینک اجتماعی
- LinkedIn, GitHub, Google Scholar, X, YouTube, Instagram, Telegram به‌صورت Draft آماده هستند
- پیام‌های دریافتی
- Projects
- Experience
- Expertise
- Publications
- Skills
- Education
- Optional/Future Content برای Certification, Award, Course, Service, Membership, Language و موارد آینده

## نکته امنیتی
Publishable key در Frontend باقی می‌ماند. دسترسی مدیریتی توسط Supabase Auth و RLS کنترل می‌شود. service_role key یا Database Password را هرگز داخل فایل‌های سایت قرار ندهید.
