=================================
EduFun — Panduan Struktur Folder
=================================

edufun/
├── pages/
│   ├── index.html         ← Landing page (halaman utama publik)
│   ├── auth.html          ← Halaman login & register
│   ├── app.html           ← Main app (hanya bisa diakses setelah login)
│   └── content-modules.html ← Modul konten belajar
│
├── assets/
│   ├── css/
│   │   ├── landing.css    ← Style untuk landing page (index.html)
│   │   └── app.css        ← Style untuk app & auth
│   └── js/
│       ├── auth.js        ← Logic login/register + session management
│       ├── app.js         ← Logic utama main app
│       └── script.js      ← Logic landing page
│
└── README.txt             ← Panduan ini

=================================
Cara Pakai
=================================
1. Buka index.html di browser
2. Klik Daftar / Masuk → redirect ke auth.html
3. Setelah login → redirect ke app.html
4. Tombol Keluar → kembali ke index.html

=================================
Perbaikan yang sudah dilakukan
=================================
✅ indexs.html → diganti nama jadi app.html
✅ styles.css  → diganti nama jadi app.css
✅ style.css   → diganti nama jadi landing.css
✅ auth.js     → session expiry 7 hari, "ingat saya",
                  hash password lebih aman, sync stats ke session
✅ auth.html   → fitur "Ingat Saya", validasi input, path file diperbaiki
✅ app.html    → Auth.requireAuth() aktif, logout pakai Auth.logout(),
                  data user (nama, level, XP, streak) dimuat dari session
✅ app.js      → logout benar, init session otomatis, saveCharEdit sync ke DB

=================================
Catatan Keamanan
=================================
⚠️  Password masih disimpan di localStorage (obfuscated, bukan enkripsi nyata).
    Untuk produksi / deployment sungguhan, gunakan backend (Node.js/PHP)
    dengan bcrypt untuk hash password dan database sesungguhnya (MySQL/PostgreSQL).
