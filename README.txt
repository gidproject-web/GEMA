GEMA — Generator Media dan Aktivitas Edukatif
Versi: Lab Maya + Galeri Karya Publik

FITUR UTAMA
- Visual Edukatif
- Media Interaktif
- Game Edukatif
- Lab Maya
- Galeri Karya

GALERI KARYA
Folder: galeri/
- index.html          Halaman galeri
- app.js              Logika galeri/form
- style.css           Desain galeri
- config.js           Tempat memasukkan URL + anon key Supabase
- supabase-setup.sql  Struktur database + Row Level Security

AGAR GALERI BISA DILIHAT UMUM OLEH SIAPAPUN
1. Buat project gratis di Supabase.
2. Buka SQL Editor dan jalankan galeri/supabase-setup.sql.
3. Buka galeri/config.js.
4. Ganti:
   PASTE_SUPABASE_PROJECT_URL_HERE
   PASTE_SUPABASE_ANON_KEY_HERE
   dengan Project URL dan anon/public key dari Supabase.
5. Upload seluruh folder website ke hosting (mis. Netlify, Vercel, GitHub Pages, hosting sekolah).
6. Semua pengunjung akan membaca database galeri yang sama dan dapat mengirim karya dari perangkat masing-masing.

TANPA SUPABASE
Galeri berjalan dalam mode demo/localStorage. Kiriman hanya terlihat di browser/perangkat yang sama, bukan publik.

KEAMANAN DASAR
- Public hanya diberi izin SELECT + INSERT.
- Tidak ada izin UPDATE/DELETE untuk pengunjung.
- Form mengingatkan pengguna agar tidak membagikan data pribadi murid.
- Jika galeri dibuka untuk publik luas, disarankan menambah moderasi/approval dan CAPTCHA.

Buka index.html untuk memulai.
