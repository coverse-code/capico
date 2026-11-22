# Capico

## Vercel’ga joylash

1. Repozitoriyani GitHub’ga yuboring va Vercel’da **Add New Project** orqali ulang.
2. Framework’ni avtomatik aniqlashda qoldiring. Vercel `server.py` dagi Flask ilovasini ishga tushiradi; alohida build command kerak emas.
3. Vercel loyiha sozlamalaridagi **Environment Variables** bo‘limiga `DATABASE_URL` qo‘shing. Qiymat PostgreSQL ma’lumotlar bazasining ulanish manzili bo‘lishi kerak (masalan, Neon yoki Supabase’dan).
4. `COOKIE_SECURE` qiymatini `true` qilib belgilang va loyihani qayta deploy qiling.
5. Deploydan so‘ng `/api/health` manzilida `{"status":"ok"}` javobini tekshiring.

Vercel fayl tizimi doimiy emas; shuning uchun deployda SQLite ishlatilmaydi va `DATABASE_URL` talab qilinadi. PostgreSQL URL’ni kodga kiritmang, uni faqat Vercel muhit o‘zgaruvchilarida saqlang.

## Mahalliy ishga tushirish

Python 3.10+ va `requirements.txt` dagi paketlarni o‘rnating, so‘ng loyiha papkasida `python server.py` buyrug‘ini bajaring. Mahalliy sinov uchun SQLite avtomatik ishlatiladi.
# capico
