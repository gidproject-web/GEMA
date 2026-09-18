/*
  KONFIGURASI GALERI GEMA
  -----------------------
  Agar galeri menjadi publik lintas perangkat:
  1. Buat project Supabase.
  2. Jalankan file supabase-setup.sql pada SQL Editor.
  3. Salin Project URL dan anon public key ke bawah.

  Aman menaruh anon key di frontend SELAMA Row Level Security (RLS) aktif
  sesuai policy pada supabase-setup.sql.
*/
window.GEMA_GALLERY_CONFIG = {
  SUPABASE_URL: "https://ytoswfwattzzclhfzvtv.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0b3N3ZndhdHR6emNsaGZ6dnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzAzODMsImV4cCI6MjEwNTMwNjM4M30.F-RXQiRBzLB5RmCzmzkvl5LJqA8b52qaRBvDvpbUZSw"
};
