// @ts-nocheck
const root=document;const modeButtons=[...root.querySelectorAll('.mode-card')];const mpiOnly=[...root.querySelectorAll('.mpi-only')];const gameOnly=[...root.querySelectorAll('.game-only')];const labOnly=[...root.querySelectorAll('.lab-only')];const form=root.querySelector('#promptForm');const result=root.querySelector('#result');const output=root.querySelector('#promptOutput');const validation=root.querySelector('#validation');const summaryMode=root.querySelector('#summaryMode');let currentMode='mpi';
modeButtons.forEach(btn=>btn.addEventListener('click',()=>{currentMode=btn.dataset.mode;modeButtons.forEach(b=>b.classList.toggle('active',b===btn));mpiOnly.forEach(el=>el.classList.toggle('hidden',currentMode!=='mpi'));gameOnly.forEach(el=>el.classList.toggle('hidden',currentMode!=='game'));labOnly.forEach(el=>el.classList.toggle('hidden',currentMode!=='lab'));summaryMode.textContent=currentMode==='mpi'?'MEDIA INTERAKTIF':currentMode==='game'?'GAME EDUKATIF':'LAB MAYA';result.classList.add('hidden')}));
function checkedValues(name){return [...root.querySelectorAll(`[data-check-group="${name}"] input:checked`)].map(x=>x.value)}function clean(v){return(v||'').trim()}
function integrationText(d){
  const mode=(d.outputFormat==='gas' && (!d.resultIntegration || d.resultIntegration==='screen'))?'gas_default':(d.resultIntegration||'screen');
  const fields=checkedValues('resultFields');
  const dataList=fields.length?fields.join(', '):'hasil akhir yang relevan';
  const wa=clean(d.waNumber);
  const url=clean(d.scriptUrl);

  if(mode==='screen'){
    return `\n\nHASIL BELAJAR\n- Tampilkan ringkasan hasil di layar setelah aktivitas selesai.\n- Data yang ditampilkan: ${dataList}.\n- Tidak perlu mengirim data ke layanan eksternal.`;
  }
  if(mode==='gas_default'){return `\n\nHASIL & PENYIMPANAN GAS\n- Tampilkan hasil dan simpan data relevan ke Google Spreadsheet melalui fungsi server google.script.run.\n- Data: ${dataList}.\n- Tampilkan status simpan, waktu dan feedback tanpa mengirim data sensitif.`;}
  if(mode==='download'){
    return `\n\nHASIL BELAJAR & UNDUH\n- Tampilkan ringkasan hasil di layar.\n- Data: ${dataList}.\n- Sediakan tombol UNDUH HASIL yang menghasilkan file teks/CSV sederhana langsung dari browser tanpa library eksternal.`;
  }

  let out=`\n\nHASIL & INTEGRASI\nData yang dicatat: ${dataList}.`;
  if(mode==='whatsapp'||mode==='sheet_whatsapp'){
    out+=`\n- Sediakan tombol “Kirim Hasil ke WhatsApp”. Nomor penerima: ${wa||'[SIAPKAN VARIABEL KONFIGURASI NOMOR_WHATSAPP]'}. Gunakan tautan wa.me / api.whatsapp.com dengan pesan URL-encoded berisi ringkasan hasil. JANGAN mengirim otomatis; pengguna harus menekan tombol dan mengonfirmasi pengiriman di WhatsApp.`;
  }
  if(mode==='sheet'||mode==='sheet_whatsapp'){
    out+=d.outputFormat==='gas'?`\n- Simpan hasil melalui google.script.run yang memanggil fungsi server Code.gs. Tidak membutuhkan endpoint fetch karena di-host oleh HTML Service.`:`\n- Simpan hasil ke Google Spreadsheet melalui Google Apps Script Web App menggunakan fetch POST. Endpoint: ${url||'[SIAPKAN VARIABEL KONFIGURASI SCRIPT_URL]'}. Jika URL belum diisi, kode harus tetap valid dan menampilkan petunjuk singkat bahwa guru perlu menempel URL Apps Script pada variabel konfigurasi.`;
    out+=`\n- Tampilkan status “Mengirim hasil...”, “Berhasil disimpan”, dan pesan kesalahan yang ramah. Jika koneksi gagal, jangan hilangkan hasil dari layar.`;
  }
  if(d.outputFormat==='gas' && mode!=='sheet' && mode!=='sheet_whatsapp')out+=`\n- Selain opsi pelaporan terpilih, simpan hasil belajar yang relevan ke Spreadsheet melalui google.script.run pada Code.gs.`;
  out+=`\n- Jangan mengumpulkan data sensitif. Gunakan hanya data pembelajaran yang diperlukan.`;
  return out;
}
function updateIntegrationUI(){
  const select=root.querySelector('#resultIntegration');
  const waBox=root.querySelector('#whatsappSettings');
  const sheetBox=root.querySelector('#sheetSettings');
  if(!select||!waBox||!sheetBox)return;
  const v=select.value;
  waBox.classList.toggle('hidden',!(v==='whatsapp'||v==='sheet_whatsapp'));
  sheetBox.classList.toggle('hidden',!(v==='sheet'||v==='sheet_whatsapp'));
}

function baseRules(d){
const common=`KETENTUAN WAJIB:\n1. Responsive untuk HP, tablet dan laptop, aksesibel, dan nyaman disentuh.\n2. Semua tombol/fitur berfungsi, tidak boleh mockup.\n3. Materi dan evaluasi sesuai tujuan pembelajaran.\n4. Jangan menaruh kunci rahasia atau token privat dalam HTML/browser.\n5. Jika kamera digunakan, minta izin terlebih dahulu dan sediakan kontrol nonkamera.\n6. Beri instruksi pengujian dan penggunaan yang jelas.`;
if(d.outputFormat==='gas')return `${common}\n\nFORMAT GOOGLE APPS SCRIPT + SPREADSHEET (WAJIB):\n- Buat DUA file kode TERPISAH secara lengkap: (1) Code.gs dan (2) Index.html untuk HTML Service Google Apps Script, bukan HTML all-in-one yang dijalankan lewat file lokal.\n- Code.gs wajib memuat doGet() menggunakan HtmlService.createHtmlOutputFromFile('Index'), serta fungsi server untuk memvalidasi data, menyimpan hasil ke SpreadsheetApp, dan mengembalikan status sukses/gagal.\n- Index.html berisi seluruh HTML, CSS di tag style, dan JavaScript di tag script.\n- Pemanggilan server dari Index.html gunakan google.script.run.withSuccessHandler(...).withFailureHandler(...), bukan fetch URL Web App dari halaman GAS.\n- Sertakan konstanta SPREADSHEET_ID di Code.gs sebagai placeholder, buat header kolom Spreadsheet yang cocok dengan data hasil, contoh data uji dan penanganan duplikasi bila relevan.\n- Validasi input di server, gunakan LockService pada operasi tulis bersama, dan jangan percayai data dari browser.\n- Tampilkan loading/status keberhasilan/kegagalan, tanpa menghilangkan nilai murid saat gagal.\n- Berikan langkah urut: buat Spreadsheet, salin ID, buat project Apps Script, masukkan Code.gs dan Index.html, konfigurasi izin, deploy Web App, dan uji menggunakan URL /exec. Jelaskan pengaturan akses dan risiko tautan publik.\n- Output akhir harus berupa BLOK KODE Code.gs LENGKAP, BLOK KODE Index.html LENGKAP, struktur kolom Sheet dan tutorial deploy; jangan hanya memberi kerangka.

PANDUAN PEMASANGAN GOOGLE APPS SCRIPT UNTUK GURU PEMULA (WAJIB ADA DALAM JAWABAN, SETELAH KODE):
Susun keluaran berurutan: A. Ringkasan fungsi aplikasi; B. Persiapan dan struktur kolom Spreadsheet; C. KODE LENGKAP Code.gs; D. KODE LENGKAP Index.html; E. Panduan pemasangan bernomor; F. Pengujian; G. Mengatasi masalah; H. Cara mengubah materi dan soal.
Rinci panduan pemasangan dengan bahasa Indonesia sederhana dan lokasi klik yang jelas:
1) Buka sheets.google.com, buat Spreadsheet baru dan beri judul; buat sheet/tab sesuai nama persis dalam kode serta header kolom berurutan (tampilkan tabel nama kolom dan satu contoh baris DUMMY, tanpa data siswa nyata).
2) Temukan ID Spreadsheet pada URL antara /d/ dan /edit; tunjukkan di baris mana SPREADSHEET_ID harus ditempel. Jangan menaruh token, kata sandi, atau data pribadi di frontend.
3) Dari Spreadsheet pilih Ekstensi > Apps Script (atau buat project script.google.com dan hubungkan melalui ID), lalu buka editor.
4) Ganti isi file Code.gs default dengan kode lengkap. Tambahkan file HTML baru melalui tombol + > HTML, beri nama Index (nama file di editor menjadi Index.html), tempel kode Index.html lengkap. Jelaskan perbedaan Code.gs dan Index.html serta larangan menempel keduanya pada satu file.
5) Simpan proyek. Jika ada fungsi setup opsional, sebut nama fungsi yang tepat, cara menjalankannya SATU KALI, dan fungsi/izin yang akan diminta. Jangan meminta pengguna menjalankan doGet secara manual.
6) Klik Deploy > New deployment > Select type > Web app. Jelaskan Execute as (pemilik atau pengakses) dan Who has access berdasarkan konteks (akun sekolah, domain, atau publik). Untuk data murid, prioritaskan akses terbatas; jelaskan konsekuensi bila memakai Anyone dan jangan berjanji akses tersedia untuk semua akun.
7) Klik Deploy, selesaikan otorisasi dengan akun tepercaya, salin URL aplikasi yang berakhir /exec, buka URL di tab baru. Jangan gunakan URL editor sebagai tautan murid.
8) Jalankan satu data uji FIKTIF, pastikan UI merespons dan satu baris tersimpan sesuai header, periksa feedback loading, sukses dan gagal; pastikan tidak ada data kamera/video disimpan.
9) Jelaskan cara memperbarui kode: simpan perubahan, pilih Deploy > Manage deployments > Edit > New version lalu Deploy; jelaskan bahwa perubahan kode belum tentu muncul di URL /exec sebelum versi diperbarui.
10) Sertakan bagian pemecahan masalah singkat: doGet/Index tidak ditemukan, nama sheet/ID salah, izin ditolak, google.script.run gagal, baris tidak tersimpan, dan kamera tidak tersedia (HTTPS/perizinan).
- Panduan harus merujuk pada nama fungsi, nama tab, header, ID placeholder, dan konfigurasi yang BENAR-BENAR ada pada kode yang diberikan; tidak boleh menyebut contoh file/fungsi yang tidak dibuat.
- Tutup dengan checklist berurutan untuk guru dan instruksi membagikan URL /exec hanya kepada pengguna yang berwenang.`;
return `${common}\n\nFORMAT HTML ALL-IN-ONE (WAJIB):\n- Berikan SATU file HTML lengkap dari doctype hingga penutup html dengan CSS dan JS inline, siap disimpan sebagai index.html.\n- Tanpa backend atau build step, kecuali jika pilihan integrasi hasil meminta Spreadsheet, gunakan endpoint Apps Script terpisah dan jelaskan bahwa backend endpoint mesti disiapkan.\n- Integrasi kamera/MediaPipe boleh memuat pustaka dan model via CDN dengan fallback saat offline; jangan mengklaim kamera bisa berjalan secara offline pada semua perangkat.\n- Jika menyimpan ke Spreadsheet, jelaskan bahwa URL Web App harus dikonfigurasi dan tidak otomatis tersedia.\n- Hindari ketergantungan asset lokal terpisah.`;
}
function motionText(d){if(!d.motionMode||d.motionMode==='none')return '';return `\n\nINTERAKSI MOTION KAMERA / AR LITE\nMode: ${d.motionMode==='ar'?'AR Lite, tampilkan elemen/objek virtual transparan di atas umpan video kamera':'Deteksi tangan dengan kamera'}.\nGesture utama: ${d.gesture}.\n- Gunakan getUserMedia dan MediaPipe Hand Landmarker (atau pendekatan web modern setara), deteksi titik tangan real-time dan tampilkan status kalibrasi.\n- Terapkan pinch melalui jarak landmark ibu jari–telunjuk yang dinormalisasi berdasarkan ukuran tangan, dengan ambang aktif/nonaktif berbeda (hysteresis) dan cooldown agar tidak terpicu berulang.\n- Peta gesture menjadi aksi nyata sesuai aktivitas (mengambil objek, memilih jawaban, memindahkan benda atau menjalankan eksperimen).\n- Buat tombol Mulai Kamera, Hentikan Kamera, pilih kamera bila tersedia, indikator izin dan kegagalan, serta fallback mouse/touch.\n- Kamera hanya digunakan setelah persetujuan, tidak merekam atau mengirim video ke server; berhentikan stream saat selesai.\n- Kamera butuh secure context HTTPS atau localhost, perangkat kompatibel dan izin pengguna. Deteksi berbasis CDN memerlukan internet pertama kali.\n- Jangan menyebutnya world-tracked AR; implementasikan camera overlay interaktif (AR Lite).`}

function productionRules(d){
 const level={quick:'Prioritaskan versi ringan: 1 mekanik utama, animasi seperlunya, tanpa dependensi yang tidak diperlukan, antarmuka sederhana; fungsi inti tetap wajib.',standard:'Bangun versi lengkap yang mudah dirawat, dengan 1 mekanik utama, variasi tantangan dan feedback kaya.',advanced:'Bangun pengalaman lebih kaya dengan peningkatan kesulitan, transisi halus, dan fitur tambahan jika stabil; jangan mengorbankan fungsi utama.'}[d.buildLevel]||'Prioritaskan pengalaman yang mudah dipakai.';
 const response=d.answerStyle==='steps'?'Jelaskan tahapan persiapan singkat sebelum memberikan SEMUA kode lengkap, lalu tulis pengujian dan perbaikan.':'Tampilkan SEMUA kode lengkap lebih dulu, diikuti panduan pemasangan singkat dan checklist pengujian.';
 return `\n\nATURAN IMPLEMENTASI PRAKTIS\n- Tingkat kerumitan: ${level}\n- Format jawaban AI: ${response}\n- Semua data soal/konten ditempatkan dalam array atau objek konfigurasi yang mudah diedit guru, terpisah dari logika. Sertakan contoh cara mengganti materi/soal tanpa mengutak-atik fungsi.\n- Tetapkan alur state jelas: siap, bermain/belajar, jeda bila ada, hasil, ulang. Jangan menggandakan event listener ketika mulai ulang.\n- Berikan navigasi kembali, indikator proses, pesan kesalahan yang membantu, dan tombol reset.\n- Tetapkan kriteria penerimaan: fitur inti dapat dimainkan; input mouse dan sentuh bekerja; nilai dan reset benar; hasil tidak hilang ketika gagal menyimpan; tidak ada tombol palsu.\n- Periksa sintaks, pemanggilan fungsi, dan kasus kosong sebelum menulis jawaban. Jangan mengklaim sudah diuji pada browser jika belum.\n- Jika fitur kompleks tidak realistis dalam satu respons, hasilkan versi minimal yang benar-benar berfungsi dulu dan jelaskan batasannya, jangan mengirim kerangka atau pseudocode.\n- Tulis panduan uji 5 langkah dan cara memasang dengan istilah awam.\n- Jika memilih GAS, Code.gs dan Index.html wajib lengkap serta saling cocok, termasuk fungsi dan nama file.`;
}
function gamePlayRules(d){
 const type=d.gameType||'';
 const rules={
 'Quiz Battle':'Giliran/tahap kuis, sistem poin dan perubahan tantangan yang jelas; mekanisme battle harus terlihat, bukan sekadar soal berurutan.',
 'Memory Card':'Kartu benar-benar tertutup, flip dua kartu, tunggu perbandingan, kunci saat animasi, pasangan benar menetap terbuka, salah menutup lagi; hitung langkah.',
 'Matching Game':'Dua kelompok item yang diacak, pilih pasangan / drag-drop, garis atau indikator cocok, pasangan benar terkunci, salah mendapat feedback.',
 'Drag and Drop Challenge':'Objek dapat diseret ke target dengan collision/validasi; untuk HP sediakan tap-pilih-tap-target. Objek benar berpindah status.',
 'Escape Room Edukasi':'Minimal 2 ruangan berbeda, masing-masing memiliki clue, input kode/kunci, inventori clue dan syarat membuka pintu; tidak cukup berupa soal biasa.',
 'Adventure / Mission Game':'Peta level atau adegan berpindah, misi dan inventori/reward, progres membuka tahap berikutnya melalui aksi pemain.',
 'Treasure Hunt':'Petunjuk mengarah ke lokasi/objek yang bisa dicari atau diklik; kunci dan harta terbuka hanya saat syarat terpenuhi.',
 'Spin Wheel Quiz':'Roda visual bergerak dengan animasi putaran nyata, berhenti pada sektor yang terpilih, sektor mengarahkan kategori pertanyaan.',
 'Maze Challenge':'Representasikan maze sebagai grid/nodes, ada posisi pemain dan jalur/gerak terhalang dinding; teka-teki membantu membuka jalan.',
 'Tebak Gambar':'Visual petunjuk benar-benar ditampilkan, dapat mengungkap hint bertahap, validasi tebakan dan pembahasan.',
 'True or False Challenge':'Kartu pernyataan cepat, tombol benar/salah, feedback dan tempo yang dapat diatur tanpa menjebak aksesibilitas.',
 'Puzzle Edukatif':'Potongan benar-benar bisa dipindahkan/disusun, pengecekan urutan/posisi, tombol acak dan ulang.',
 'Millionaire Quiz Show':'Tangga 10–15 tahap poin virtual, satu soal 4 opsi tiap tahap, bantuan 50:50 aktif sekali, bantuan audiens berlabel simulasi (bukan suara nyata), checkpoint poin dan kondisi kalah/berhenti. Jangan tampilkan bantuan yang tidak bekerja.',
 'Platformer Klasik':'Canvas 2D dengan game loop requestAnimationFrame, gravitasi, kecepatan horizontal, lompat, lantai/platform, collision, checkpoint, collectible edukatif, batas layar, tombol kiri/kanan/lompat pada HP. Kemenangan melalui mencapai garis akhir dan item konsep, bukan sekadar dialog soal.',
 'Endless Runner':'Karakter otomatis bergerak, tombol lompat/geser, obstacle datang, deteksi benturan, jarak/kecepatan bertambah wajar, collectible konsep dan kondisi game over. Pertanyaan tidak memblokir setiap detik permainan.',
 'Tower Defense Edukasi':'Peta grid/jalur nyata, musuh bergerak per frame/tick, tower bisa diposisikan, radius/serangan/cooldown, wave, nyawa basis, resource pertahanan dari tantangan benar.',
 'Wordle Edukasi':'Papan 5 huruf dengan maksimal 6 percobaan, warna tepat/salah posisi/tidak ada yang menangani huruf berulang dengan benar, input keyboard fisik dan layar, kosakata sesuai materi.',
 'Jeopardy Quiz Board':'Grid kategori x nominal poin, setiap kotak membuka tantangan, tak bisa dibuka dua kali, poin bertambah/berkurang sesuai aturan, layar akhir.',
 'Rhythm Challenge':'Not datang pada garis target mengikuti waktu, pencet tombol tepat pada jendela timing, umpan balik perfect/good/miss, kalibrasi sederhana dan mode tanpa suara.',
 'Tarik Tambang Edukatif':'Dua tim di kiri dan kanan, tali dengan posisi x yang berubah nyata menurut kekuatan kedua tim, garis tengah dan zona menang, input tarik tombol/keyboard/tap ritmis dengan cooldown; tantangan konsep memberi bonus tenaga sementara, bukan menggantikan aksi tarik. Lawan AI memakai kekuatan bertahap yang seimbang, terdapat stamina, countdown, hasil menang/kalah dan ulang tanpa bug.',
 'Panjat Pinang Edukatif':'Batang vertikal dengan karakter yang benar-benar bergerak naik/turun sesuai input, gravitasi/slip ringan, stamina dan tempat istirahat/checkpoint. Ambil item konsep di ketinggian berbeda, pilihan strategi atau tantangan singkat memberi pijakan/tenaga, puncak mempunyai kondisi menang; sediakan kontrol tap/keyboard dan tombol ulang.',
 'Balap Karung Edukatif':'Lintasan horizontal dengan sprite pemain dan lawan, tindakan lompat memakai timing dan cooldown, rintangan serta collision, progres jarak, stamina, booster belajar setelah tantangan kontekstual, finish dan restart. Lompatan wajib memindahkan karakter, bukan animasi dekoratif.',
 'Estafet Pengetahuan':'Minimal 3 pelari/pos estafet, tongkat benar-benar berpindah berdasarkan jarak dan timing di zona oper; tiap pos mempunyai tantangan materi yang berbeda sebagai bonus waktu/energi; gagal oper punya konsekuensi, progress tim, finish, reset dan kontrol sentuh/keyboard.',
 };
 return `\n\nKONTRAK GAMEPLAY KHUSUS: ${rules[type]||'Mekanik harus bekerja nyata dan berbeda dari kuis linear.'}\n- Tulis kondisi MENANG/KALAH, kondisi RESET, kontrol PC/HP, dan variabel state yang diperlukan untuk mekanik ini.\n- Masukkan konsep pembelajaran ke aksi inti game; bukan mengganti game menjadi daftar soal.\n- Jika memakai konsep game populer, gunakan aset/nama/karakter orisinal tanpa meniru merek atau konten berhak cipta.`;
}
function generateMPI(d){const features=checkedValues('mpiFeatures');return `Bertindaklah sebagai instructional designer, UI/UX designer, dan front-end developer yang berpengalaman membuat media pembelajaran interaktif untuk sekolah.\n\nBuat langsung MEDIA PEMBELAJARAN INTERAKTIF dengan format kode sesuai pilihan pengguna berdasarkan spesifikasi berikut.\n\nDATA PEMBELAJARAN\nMata pelajaran: ${d.mapel}\nKelas: ${d.kelas}\nFase: ${d.fase}\nMateri / topik: ${d.materi}\nTujuan pembelajaran:\n${d.tp}\n\nSPESIFIKASI MEDIA\nJenis media: ${d.mpiType}\nJumlah bagian/scene: ${d.mpiScenes}\nInteraksi yang digunakan: ${features.length?features.join(', '):'Tentukan interaksi paling relevan dengan materi'}\nTarget perangkat: ${d.device}\nMode penggunaan: ${d.usage}\nBahasa: ${d.language}\nGaya visual: ${d.style}\nCatatan tambahan: ${clean(d.notes)||'Tidak ada'}\n\nSTRUKTUR YANG DIHARAPKAN\n- Layar pembuka/hero yang menarik dengan judul materi dan tombol Mulai Belajar.\n- Tujuan pembelajaran ditampilkan secara ringkas.\n- Navigasi yang jelas dan konsisten.\n- Materi dibagi menjadi bagian kecil, visual, tidak berupa paragraf panjang.\n- Gunakan kartu, ikon, diagram sederhana, ilustrasi CSS/SVG inline, atau elemen visual yang relevan.\n- Sertakan interaksi sesuai pilihan pengguna.\n- Sertakan minimal satu aktivitas pemahaman/cek pemahaman.\n- Sertakan feedback setelah siswa berinteraksi.\n- Sertakan progress belajar jika relevan.\n- Akhiri dengan rangkuman/refleksi singkat serta tombol ulang/kembali.\n- Jangan menaruh semua materi pada satu layar panjang tanpa struktur.\n\n${integrationText(d)}\n\n\n\n${baseRules(d)}\n\n${productionRules(d)}\n\nBuat desain ${d.style} yang modern, menarik, ramah siswa, dan profesional. Susun sendiri konten, aktivitas, pertanyaan, dan feedback berdasarkan materi dan tujuan pembelajaran.`}
function gameParticipationText(d){
 const mode=d.gamePlayMode||'solo';
 const shared='KETENTUAN SEMUA MODE: permainan harus benar-benar dapat dimainkan di satu perangkat, tanpa login atau server real-time; jangan menjanjikan multiplayer lintas gawai. Nama peserta/tim boleh diedit sebelum mulai; gunakan data contoh netral; pencatatan hasil hanya jika integrasi dipilih. Umpan balik harus membantu pembelajaran, bukan mempermalukan tim kalah. Reset harus menghapus skor, giliran, state pertandingan, dan timer dengan benar.';
 const modes={
  solo:`INDIVIDU VS KOMPUTER / TANTANGAN: Satu pemain aktif. Jika game kompetitif (misalnya Tarik Tambang atau Balap Karung), buat lawan komputer otomatis dengan kecepatan/kekuatan wajar, bukan sekadar skor pasif. Beri pilihan kesulitan mudah/normal; lawan tidak boleh curang atau mustahil dikalahkan. Jika game nonkompetitif, gunakan target skor/waktu dan tantangan lingkungan sebagai pengganti lawan.`,
  duel:`DUA PEMAIN BERGANTIAN: Sediakan dua nama pemain, dua status/skor yang terpisah, indikator giliran sangat jelas, tombol Serahkan Giliran, dan blok aksi pemain lain sampai giliran beralih. Untuk game aksi real-time, tiap pemain menjalani ronde setara di arena yang di-reset per ronde, lalu bandingkan waktu/jarak/poin (hot-seat), bukan berpura-pura dua orang mengontrol dua perangkat. Soal dan tingkat kesulitan harus seimbang. Tampilkan hasil dua pemain dan opsi pertandingan ulang.`,
  teams:`DUA KELOMPOK DI KELAS: Optimalkan tampilan proyektor dengan nama Tim A/B dapat diganti, skor besar, progres dua tim, kontras kuat dan instruksi singkat terlihat dari jauh. Guru/operator mengendalikan giliran atau aksi tim menggunakan satu keyboard/mouse, siswa berdiskusi secara fisik sebelum keputusan dikirim. Jangan mensyaratkan tiap siswa punya HP. Terapkan ronde adil, penanda tim yang aktif, pembatas waktu opsional, papan skor dan hasil pertandingan. Jika Tarik Tambang, tampilkan posisi tali dan gaya tarik dua tim; jika Panjat Pinang, bandingkan progres/timer dua tim secara bergiliran. Jumlah anggota: ${d.teamSize||'3-5'} per tim.`,
  cooperative:`KOLABORASI SATU TIM: Seluruh anggota bekerja sama mencapai target bersama, bukan saling mengalahkan. Beri pembagian peran opsional (pengamat, pengendali, pencatat, penjawab), target kolektif, kesempatan diskusi dan langkah lanjut setelah konsensus. Sertakan progress bersama serta evaluasi refleksi kontribusi tim; jangan tampilkan ranking individu. Jumlah anggota anjuran: ${d.teamSize||'3-5'}.`
 };
 const controller=d.gameController==='teacher'?'Kontrol aksi/game oleh guru atau operator kelas.':d.gameController==='students'?'Kontrol aksi oleh siswa pada satu perangkat.':'Tentukan kontrol paling sederhana sesuai mode; untuk kelas/proyektor prioritaskan guru sebagai operator.';
 const turn=d.turnDuration&&d.turnDuration!=='none'&&mode!=='solo'?`Timer per giliran ${d.turnDuration} detik dengan berhenti saat jeda/transisi dan reset saat ronde baru.`:'Tanpa batas waktu per giliran; jangan membuat timer paksa.';
 return `\n\nMODE PEMAIN DAN KOLABORASI (WAJIB)\nPilihan: ${mode}.\n${modes[mode]}\n${controller}\n${turn}\n${shared}\nJika mekanisme game tidak cocok dengan format mode yang dipilih, adaptasikan giliran/ronde secara nyata sambil mempertahankan gameplay utama, bukan menggantinya dengan kuis pilihan ganda.`;
}

function generateGame(d){const features=checkedValues('gameFeatures');const gameType=new FormData(form).get('gameType');const mechanics={'Quiz Battle':'Pemain menjawab soal bertahap. Gunakan skor, feedback, progress dan sensasi kompetisi ringan.','Memory Card':'Buat kartu tertutup yang dibuka dua per dua. Pasangan harus mewakili hubungan konsep yang benar.','Matching Game':'Pemain memasangkan dua kelompok item yang berhubungan, misalnya istilah-definisi, gambar-konsep, sebab-akibat.','Drag and Drop Challenge':'Pemain menyeret atau memilih objek lalu menempatkannya ke kategori/target yang sesuai. Sediakan alternatif click-to-select.','Escape Room Edukasi':'Game memiliki beberapa ruang/tahap dengan petunjuk dan kode. Jawaban benar membuka clue atau tahap berikutnya.','Adventure / Mission Game':'Buat perjalanan misi berlevel. Tiap level memiliki narasi singkat, tantangan, feedback dan reward.','Treasure Hunt':'Pemain mencari petunjuk dan mengumpulkan item/reward setelah menyelesaikan tantangan pembelajaran.','Spin Wheel Quiz':'Sediakan roda putar visual yang menentukan kategori/soal. Putaran harus bekerja dengan JavaScript.','Maze Challenge':'Buat jalur/maze sederhana berbasis pilihan. Jawaban menentukan jalur menuju tujuan berikutnya.','Tebak Gambar':'Pemain menebak konsep dari visual CSS/SVG/emoji/petunjuk. Hindari ketergantungan gambar eksternal.','True or False Challenge':'Pemain memutuskan benar/salah secara cepat disertai penjelasan edukatif.','Puzzle Edukatif':'Pemain menyusun urutan, bagian, kategori, atau konsep sehingga membentuk jawaban yang benar.'};return `Bertindaklah sebagai game-based learning designer, instructional designer, UI/UX designer, dan front-end game developer.\n\nBuat langsung GAME EDUKATIF INTERAKTIF dengan format kode sesuai pilihan pengguna.\n\nDATA PEMBELAJARAN\nMata pelajaran: ${d.mapel}\nKelas: ${d.kelas}\nFase: ${d.fase}\nMateri / topik: ${d.materi}\nTujuan pembelajaran:\n${d.tp}\n\nSPESIFIKASI GAME\nJenis game: ${gameType}\nMekanik utama: ${mechanics[gameType]||'Gunakan mekanik yang sesuai dengan tipe game.'}\nJumlah level: ${d.levels}\nJumlah soal/tantangan: ${d.questions}\nFitur game: ${features.length?features.join(', '):'Skor, progress, feedback, hasil akhir, dan main lagi'}\nTarget perangkat: ${d.device}\nMode penggunaan umum: ${d.usage}\nMode pemain khusus game: ${d.gamePlayMode}\nBahasa: ${d.language}\nGaya visual: ${d.style}\nCatatan tambahan: ${clean(d.notes)||'Tidak ada'}\n\nALUR GAME WAJIB\n1. Layar pembuka dengan judul game, topik, deskripsi singkat dan tombol MULAI.\n2. Layar petunjuk singkat tentang cara bermain.\n3. Area permainan utama sesuai mekanik ${gameType}.\n4. Progress level/tantangan harus terlihat.\n5. Setiap jawaban/aksi memberi feedback yang jelas dan edukatif.\n6. Jika fitur skor dipilih, skor harus bertambah/berkurang secara konsisten.\n7. Jika timer dipilih, timer harus benar-benar berjalan dan berhenti dengan benar.\n8. Jika nyawa dipilih, kesalahan mengurangi nyawa dan ada kondisi game over yang masuk akal.\n9. Jika reward/badge dipilih, berikan reward pada pencapaian tertentu.\n10. Setelah seluruh tantangan selesai tampilkan layar hasil akhir berisi skor/pencapaian dan pesan reflektif.\n11. Sediakan tombol MAIN LAGI yang benar-benar mereset state game.\n12. Pertanyaan/tantangan harus bervariasi, tidak monoton, dan sesuai tujuan pembelajaran.\n\n${integrationText(d)}\n\n\n\n${genreText(d)}\n\n${gameParticipationText(d)}\n\n${gamePlayRules(d)}\n\n${baseRules(d)}\n\n${productionRules(d)}\n\nBuat game terasa benar-benar dimainkan, bukan halaman soal biasa yang hanya diberi dekorasi game. Gunakan ${d.style} sebagai identitas visual. Susun sendiri soal, jawaban, tantangan, feedback dan reward berdasarkan materi serta tujuan pembelajaran.`}

function genreText(d){const t=d.gameType||new FormData(form).get('gameType');const a={
'Millionaire Quiz Show':'Format kuis berjenjang 4 pilihan, tangga hadiah berupa poin virtual (bukan uang), 50:50, bantuan audiens simulasi jelas berlabel, dan opsi berhenti; gunakan desain orisinal tanpa logo/musik merek acara TV.',
'Platformer Klasik':'Buat platformer 2D orisinal menggunakan Canvas 2D: gravitasi, lompat, collision, kamera mengikuti karakter, checkpoint, item edukasi dan kontrol sentuh. Jangan pakai karakter, sprite, musik atau nama dari franchise Mario.',
'Endless Runner':'Buat endless runner 2D dengan rintangan, tabrakan, percepatan wajar, soal yang terintegrasi, dan tombol lompat sentuh.',
'Tower Defense Edukasi':'Bangun jalur musuh, tower yang diperkuat dengan jawaban benar, resource skor dan gelombang berbatas.',
'Wordle Edukasi':'Tebak kata target yang relevan materi, feedback tiap huruf, papan keyboard sentuh, jumlah percobaan terbatas.',
'Jeopardy Quiz Board':'Papan kategori x level skor, setiap kotak soal hanya dapat dijawab sekali, total poin dan pembahasan.',
'Rhythm Challenge':'Tombol interaktif sesuai irama, feedback ketepatan timing dan mode tanpa suara.',
'Tarik Tambang Edukatif':'Permainan kompetisi dua tim, posisi tali bergerak real-time, tombol tarik berulang dengan batas kecepatan, kekuatan lawan seimbang, bonus pemahaman konsep dan penanda garis kemenangan. Jangan hasilkan kuis biasa bertema tarik tambang.',
'Panjat Pinang Edukatif':'Karakter memanjat batang dengan naik/turun, stamina, licin, checkpoint dan hadiah berisi konsep pembelajaran. Kemenangan saat mencapai puncak secara fisik di area permainan.',
'Balap Karung Edukatif':'Lomba lari-lompat dalam karung dengan lintasan, rintangan, timing tombol, stamina dan gerakan maju. Jawaban materi memberi booster tanpa menghentikan gerakan utama.',
'Estafet Pengetahuan':'Lomba estafet dengan beberapa pelari, zona serah tongkat, kontrol timing, penalti kegagalan dan tantangan konsep yang berbeda per pos.',
'Space Plane Adventure':'Buat game pesawat terbang 2D dengan gerakan pesawat menggunakan keyboard dan sentuh, scrolling latar, asteroid dan musuh orisinal, deteksi tabrakan, nyawa, power-up, checkpoint misi serta boss stage sederhana. Materi terintegrasi melalui pilihan rute/item dan penguatan daya, bukan mengganti gameplay dengan kuis statis. Gunakan Canvas 2D requestAnimationFrame.',
'Voxel World Adventure 3D':'Buat dunia voxel 3D orisinal yang bisa dijelajahi dengan kamera, kontrol gerak mobile dan desktop, raycast pilih/blok, inventaris dan misi membangun berbasis konsep. Utamakan Three.js dengan dependensi CDN dijelaskan; siapkan fallback 2D jika WebGL tidak tersedia. Jangan menyalin merek, karakter, tekstur, atau aset Minecraft.',
'Adventure Learning Map':'Buat peta dunia dengan node level yang dapat diklik, jalur progres, checkpoint terkunci-terbuka, bintang hasil misi, mini-game berbeda per lokasi dan hadiah akhir. Semua status progres harus benar-benar tersimpan di state aplikasi.',
'Kart Racing Edukatif':'Buat balapan 2D dengan kemudi kiri-kanan, lintasan bergerak, lawan AI sederhana, lap, checkpoint, tabrakan dan power-up sesuai pemahaman konsep. Kontrol touch dan keyboard; hasil akhir berdasarkan posisi balapan nyata.',
'Cooking & Cafe Challenge':'Buat simulasi restoran dengan antrean pesanan, timer, drag-drop bahan, tahapan resep dan penilaian benar berdasarkan materi pembelajaran. Tambahkan skor pelayanan dan level kesulitan meningkat.',
'Pet Simulator Edukatif':'Buat simulasi merawat hewan virtual dengan indikator kebutuhan, aktivitas memelihara, inventaris item dan perkembangan karakter yang terhubung ke pencapaian konsep belajar. Tidak boleh hanya soal dan gambar hewan.',
'Champions Brain Arena':'Buat kompetisi kecerdasan orisinal ala game show edukatif: babak memori visual, logika, numerik, tantangan cepat, papan skor besar, timer yang bekerja dan eliminasi opsional dengan aturan adil. Dukung mode individu/dua kelompok pada satu perangkat dan jangan gunakan logo, judul acara, atau desain resmi Ruangguru.',
'Battle Arena Edukatif':'Buat arena top-down dengan karakter bergerak, musuh sederhana, collision, cooldown serangan, energi, dan perlindungan. Kekuatan serta strategi dikembangkan melalui pencapaian misi pengetahuan; hindari kekerasan realistis.',

};return `\n\nATURAN KHUSUS GENRE: ${a[t]||'Gunakan mekanik terpilih secara fungsional dan relevan dengan pelajaran.'}`}

function generateLab(d){
  const focus=clean(d.labFocus);
  return `Bertindaklah sebagai instructional designer, virtual laboratory designer, guru sains, UI/UX designer, dan front-end developer yang berpengalaman membuat laboratorium maya untuk pembelajaran sekolah.

Buat langsung LAB MAYA / VIRTUAL LAB interaktif dengan format kode sesuai pilihan pengguna berdasarkan spesifikasi berikut.

DATA PEMBELAJARAN
Mata pelajaran: ${d.mapel}
Kelas: ${d.kelas}
Fase: ${d.fase}
Materi / topik: ${d.materi}
Tujuan pembelajaran:
${d.tp}

INTI LAB MAYA
Jenis lab: ${d.labType}
Tingkat simulasi: ${d.labComplexity}
Fenomena / eksperimen: ${clean(d.labExperiment)}
Fokus yang ingin murid ubah/amati: ${focus||'Tentukan otomatis berdasarkan eksperimen dan tujuan pembelajaran.'}

DETAIL OPSIONAL DARI GURU
Alat/bahan virtual: ${clean(d.labTools)||'Tentukan otomatis alat dan bahan virtual yang paling relevan dan sederhana.'}
Variabel yang diubah: ${clean(d.independentVar)||'Tentukan otomatis.'}
Hasil yang diamati: ${clean(d.dependentVar)||'Tentukan otomatis.'}
Variabel yang dijaga tetap: ${clean(d.controlVars)||'Tentukan otomatis bila diperlukan.'}
Prosedur khusus: ${clean(d.labProcedure)||'Susun otomatis langkah praktikum yang singkat, runtut, aman, dan sesuai usia murid.'}
Jumlah percobaan: ${d.labTrials||'3 skenario'}
Output data: ${d.labOutput||'Otomatis sesuai eksperimen'}
Catatan keselamatan/batasan: ${clean(d.labSafety)||'Tentukan otomatis sesuai karakter eksperimen dan jelaskan bahwa simulasi adalah penyederhanaan kondisi nyata.'}

TUGAS ANDA SEBAGAI PERANCANG LAB
- Jangan meminta pengguna menentukan detail tambahan lagi.
- Turunkan sendiri alat dan bahan virtual, variabel, langkah eksperimen, data yang dicatat, tabel/grafik bila relevan, pertanyaan analisis, kesimpulan, refleksi, dan batasan simulasi dari materi serta tujuan pembelajaran.
- Untuk jenjang SD, prioritaskan observasi sederhana, sedikit kontrol, visual ramah anak, dan bahasa konkret.
- Untuk SMP/SMA, boleh gunakan hubungan kuantitatif apabila konsep dan data mendukung.
- Jangan memaksakan grafik jika eksperimen lebih tepat bersifat kualitatif.

STRUKTUR LAB MAYA WAJIB
1. Layar pembuka berisi judul, tujuan, fenomena pemantik, dan tombol MULAI PRAKTIKUM.
2. Petunjuk singkat serta alat/bahan virtual.
3. Area eksperimen utama benar-benar interaktif, bukan gambar statis.
4. Sediakan kontrol yang paling relevan untuk murid (slider, pilihan, tombol, atau input sederhana).
5. Perubahan kontrol harus menghasilkan perubahan keluaran yang logis dan konsisten dengan model konsep.
6. Sediakan tombol MULAI/CATAT DATA/RESET; gunakan JEDA hanya jika memang relevan.
7. Tampilkan nilai variabel dan hasil pengamatan dengan jelas.
8. Sediakan pencatatan hasil pengamatan.
9. Gunakan tabel dan/atau grafik hanya jika membantu memahami pola.
10. Sertakan prediksi sederhana sebelum eksperimen jika relevan.
11. Berikan pertanyaan analisis sesuai usia.
12. Sediakan kesimpulan/refleksi.
13. Jelaskan asumsi dan keterbatasan simulasi.
14. Sertakan keselamatan apabila eksperimen nyata memiliki risiko.
15. Gunakan data contoh yang masuk akal; jangan gunakan angka acak tanpa model.
16. Sediakan tombol ULANGI EKSPERIMEN yang benar-benar mereset state.
17. Akhiri dengan ringkasan konsep singkat.

${integrationText(d)}

${baseRules(d)}

${productionRules(d)}

Target perangkat: ${d.device}
Mode penggunaan: ${d.usage}
Bahasa: ${d.language}
Gaya visual: ${d.style}
Catatan tambahan: ${clean(d.notes)||'Tidak ada'}

Buat tampilan ${d.style} yang modern, jelas, dan terasa seperti laboratorium virtual. Prioritaskan ketepatan konsep, kemudahan penggunaan, dan pengalaman investigasi murid, bukan sekadar dekorasi.`}

const integrationSelect=root.querySelector('#resultIntegration');
if(integrationSelect){integrationSelect.addEventListener('change',updateIntegrationUI);updateIntegrationUI();}
form.addEventListener('submit',e=>{e.preventDefault();validation.textContent='';const d=Object.fromEntries(new FormData(form).entries());if(!clean(d.mapel)||!clean(d.kelas)||!clean(d.materi)||!clean(d.tp)){validation.textContent='Lengkapi Mata Pelajaran, Kelas, Materi/Topik, dan Tujuan Pembelajaran.';return}if(currentMode==='lab'&&!clean(d.labExperiment)){validation.textContent='Untuk Lab Maya, isi Fenomena / Eksperimen yang Disimulasikan.';return}output.value=currentMode==='mpi'?generateMPI(d):currentMode==='game'?generateGame(d):generateLab(d);result.classList.remove('hidden');result.scrollIntoView({behavior:'smooth',block:'start'})});
root.querySelector('#copyBtn').addEventListener('click',async()=>{const status=root.querySelector('#copyStatus');try{await navigator.clipboard.writeText(output.value);status.textContent='✓ Prompt berhasil disalin.'}catch{output.focus();output.select();status.textContent='Prompt sudah dipilih. Gunakan menu Salin/Copy pada perangkat Anda.'}});root.querySelector('#editBtn').addEventListener('click',()=>root.querySelector('#generator').scrollIntoView({behavior:'smooth'}));


// GEMA deep-link mode support
window.addEventListener('DOMContentLoaded', () => {
  const wanted = new URLSearchParams(window.location.search).get('mode');
  if (wanted === 'game' || wanted === 'mpi' || wanted === 'lab') {
    const target = document.querySelector(`.mode-card[data-mode="${wanted}"]`);
    if (target) {
      target.click();
      setTimeout(() => document.querySelector('#generator')?.scrollIntoView({behavior:'smooth'}), 80);
    }
  }
});

// New format selection controls
const formatSelect=root.querySelector('#outputFormat');
if(formatSelect){const sync=()=>{const gas=formatSelect.value==='gas';root.querySelector('#gasFormatInfo')?.classList.toggle('hidden',!gas);const btn=root.querySelector('#generatePromptBtn');if(btn)btn.textContent=gas?'✨ Generate Prompt Code.gs + Index.html':'✨ Generate Prompt HTML All-in-One';};formatSelect.addEventListener('change',sync);sync();}

const repairPrompt=`Bertindak sebagai debugger senior. Saya akan menempelkan kode dan/atau pesan error aplikasi pembelajaran GEMA. Periksa akar masalah secara sistematis. Jangan menghapus fitur atau mengganti mekanisme gameplay menjadi kuis sederhana. Kembalikan file kode lengkap yang sudah diperbaiki (HTML tunggal ATAU Code.gs dan Index.html sesuai proyek asli), bukan potongan kode. Pastikan nama fungsi frontend-backend konsisten, listener tidak rangkap, navigasi dan reset berfungsi, serta output bisa dipakai guru pemula. Berikan daftar penyebab error, perubahan yang dilakukan, dan langkah uji manual. Jangan mengklaim sudah menjalankan tes browser jika belum. Setelah instruksi ini saya akan menempelkan kode dan pesan error.`;
const testPrompt=`Audit kualitas hasil game/media/lab pembelajaran ini. Uji secara logis: 1) tombol Mulai/Berikut/Kembali/Ulang; 2) mekanik utama sungguh bekerja (physics/maze/kartu/roda/tower/lab), bukan hanya soal berkostum; 3) interaksi keyboard, mouse, dan sentuh; 4) skor, feedback, progress, menang/kalah dan reset; 5) responsif HP dan laptop; 6) konten sesuai tujuan pembelajaran; 7) jika GAS: Code.gs, Index.html, google.script.run, header Sheet, validasi, dan status simpan; 8) untuk fitur kamera gunakan generator AR terpisah. Laporkan PASS/FAIL/TIDAK DAPAT DIVERIFIKASI untuk setiap poin, lalu berikan perbaikan kode lengkap hanya untuk temuan nyata. Jangan mengaku telah menguji browser bila tidak ada akses untuk menjalankannya.`;
async function copyHelper(value){const el=root.querySelector('#helperStatus');try{await navigator.clipboard.writeText(value);el.textContent='✓ Instruksi berhasil disalin.'}catch{el.textContent='Gagal menyalin otomatis. Silakan gunakan salin prompt utama sebagai alternatif.'}}
root.querySelector('#repairBtn')?.addEventListener('click',()=>copyHelper(repairPrompt));
root.querySelector('#testBtn')?.addEventListener('click',()=>copyHelper(testPrompt));

// GEMA v5 — tampilkan pengaturan tim hanya ketika diperlukan.
(function initGameParticipation(){
 const select=document.querySelector('#gamePlayMode');if(!select)return;
 const hint=document.querySelector('#gameModeHint');
 const hints={solo:'👤 Individu: satu siswa melawan komputer atau target permainan. Tanpa login.',duel:'👥 Dua pemain: bergantian pada satu perangkat, skor dipisah, ronde adil.',teams:'🏫 Dua kelompok: guru dapat menjadi operator, papan skor besar untuk proyektor, tanpa membutuhkan HP tiap siswa.',cooperative:'🤝 Kolaborasi: anggota menyelesaikan misi bersama dengan target dan refleksi tim.'};
 function sync(){const m=select.value;document.querySelector('#teamCountField')?.classList.toggle('hidden',!['teams','cooperative'].includes(m));document.querySelector('#turnLimitField')?.classList.toggle('hidden',!['teams','duel'].includes(m));if(hint)hint.textContent=hints[m];}
 select.addEventListener('change',sync);sync();
})();


// Penjelasan genre ditampilkan setiap dropdown berubah.
const gameDescriptions = {"Champions Brain Arena":"🧠 Champions Brain Arena|Kompetisi memori, logika dan numerik dengan babak serta papan skor.","Quiz Battle": "🏆 Quiz Battle|Pilih jawaban, skor, combo dan ranking lokal.", "Memory Card": "🧠 Memory Card|Buka kartu dan cari pasangan yang sesuai.", "Matching Game": "🔗 Matching|Pasangkan istilah, gambar, definisi atau konsep.", "Drag and Drop Challenge": "🖐️ Drag &amp; Drop|Seret objek ke kategori atau target yang benar.", "Escape Room Edukasi": "🔐 Escape Room|Pecahkan petunjuk untuk membuka tahap berikutnya.", "Adventure / Mission Game": "🗺️ Adventure|Misi dan level berbasis perjalanan belajar.", "Treasure Hunt": "💎 Treasure Hunt|Cari petunjuk dan kumpulkan reward.", "Spin Wheel Quiz": "🎡 Spin Wheel|Putar roda untuk menentukan soal/tantangan.", "Maze Challenge": "🧩 Maze Challenge|Pilih jalur berdasarkan jawaban yang benar.", "Tebak Gambar": "🖼️ Tebak Gambar|Kenali objek/konsep dari petunjuk visual.", "True or False Challenge": "✅ True / False|Keputusan cepat dengan feedback langsung.", "Puzzle Edukatif": "🧩 Puzzle|Susun urutan, konsep, gambar, atau informasi.", "Millionaire Quiz Show": "💰 Millionaire Quiz Show|Kuis bertingkat, empat pilihan jawaban, bantuan 50:50 dan penonton.", "Platformer Klasik": "🍄 Platformer Klasik|Lari, melompat, koin ilmu dan tantangan ala game platform klasik.", "Endless Runner": "🏃 Endless Runner|Hindari rintangan, kumpulkan poin, selesaikan soal.", "Tower Defense Edukasi": "🏰 Tower Defense|Jawaban benar mengaktifkan pertahanan dan strategi.", "Wordle Edukasi": "🔤 Tebak Kata 5 Huruf|Petunjuk huruf dan kosakata sesuai materi.", "Jeopardy Quiz Board": "🎯 Jeopardy Board|Pilih kategori dan nominal poin untuk menjawab soal.", "Rhythm Challenge": "🎵 Rhythm Challenge|Ikuti irama dan kuis ketepatan waktu.", "Tarik Tambang Edukatif": "🪢 Tarik Tambang|Dua tim menarik tali lewat ritme aksi dan tantangan konsep.", "Panjat Pinang Edukatif": "🌴 Panjat Pinang|Naik bertahap, kelola tenaga, kumpulkan bendera ilmu.", "Balap Karung Edukatif": "🏁 Balap Karung|Lompat berirama, hindari rintangan, capai garis finis.", "Estafet Pengetahuan": "🏃 Estafet Pengetahuan|Oper tongkat melalui beberapa pos dan tantangan berbeda.", "Space Plane Adventure": "🚀 Pesawat luar angkasa|Terbang, menghindari asteroid, energi dan misi pengetahuan.", "Voxel World Adventure 3D": "🧱 Voxel World 3D|Jelajahi dunia blok 3D, bangun objek dan selesaikan misi.", "Adventure Learning Map": "🗺️ Peta Petualangan|Buka lokasi, kumpulkan bintang dan tantangan berjenjang.", "Kart Racing Edukatif": "🏎️ Balap Kart|Kemudikan kart, tikungan, checkpoint dan power-up pembelajaran.", "Cooking & Cafe Challenge": "🍳 Cooking Challenge|Racik pesanan sesuai konsep, kelola waktu dan poin.", "Pet Simulator Edukatif": "🐾 Pet Simulator|Rawat karakter hewan dengan menyelesaikan misi belajar.", "Battle Arena Edukatif": "⚔️ Arena Strategi|Aksi arena, kemampuan, pertahanan dan tantangan konsep."};
const gameSelect = document.getElementById('gameTypeSelect');
function updateGameHint(){if(!gameSelect)return;const detail=gameDescriptions[gameSelect.value]||'';const [title,description]=detail.split('|');document.getElementById('gameTypeTitle').textContent=title||gameSelect.value;document.getElementById('gameTypeDescription').textContent=description||'';}
gameSelect?.addEventListener('change',updateGameHint);updateGameHint();
