// @ts-nocheck
const root=document;const modeButtons=[...root.querySelectorAll('.mode-card')];const mpiOnly=[...root.querySelectorAll('.mpi-only')];const gameOnly=[...root.querySelectorAll('.game-only')];const labOnly=[...root.querySelectorAll('.lab-only')];const form=root.querySelector('#promptForm');const result=root.querySelector('#result');const output=root.querySelector('#promptOutput');const validation=root.querySelector('#validation');const summaryMode=root.querySelector('#summaryMode');let currentMode='mpi';
modeButtons.forEach(btn=>btn.addEventListener('click',()=>{currentMode=btn.dataset.mode;modeButtons.forEach(b=>b.classList.toggle('active',b===btn));mpiOnly.forEach(el=>el.classList.toggle('hidden',currentMode!=='mpi'));gameOnly.forEach(el=>el.classList.toggle('hidden',currentMode!=='game'));labOnly.forEach(el=>el.classList.toggle('hidden',currentMode!=='lab'));summaryMode.textContent=currentMode==='mpi'?'MEDIA INTERAKTIF':currentMode==='game'?'GAME EDUKATIF':'LAB MAYA';result.classList.add('hidden')}));
function checkedValues(name){return [...root.querySelectorAll(`[data-check-group="${name}"] input:checked`)].map(x=>x.value)}function clean(v){return(v||'').trim()}
function integrationText(d){
  const mode=d.resultIntegration||'screen';
  const fields=checkedValues('resultFields');
  const dataList=fields.length?fields.join(', '):'hasil akhir yang relevan';
  const wa=clean(d.waNumber);
  const url=clean(d.scriptUrl);

  if(mode==='screen'){
    return `\n\nHASIL BELAJAR\n- Tampilkan ringkasan hasil di layar setelah aktivitas selesai.\n- Data yang ditampilkan: ${dataList}.\n- Tidak perlu mengirim data ke layanan eksternal.`;
  }
  if(mode==='download'){
    return `\n\nHASIL BELAJAR & UNDUH\n- Tampilkan ringkasan hasil di layar.\n- Data: ${dataList}.\n- Sediakan tombol UNDUH HASIL yang menghasilkan file teks/CSV sederhana langsung dari browser tanpa library eksternal.`;
  }

  let out=`\n\nHASIL & INTEGRASI\nData yang dicatat: ${dataList}.`;
  if(mode==='whatsapp'||mode==='sheet_whatsapp'){
    out+=`\n- Sediakan tombol “Kirim Hasil ke WhatsApp”. Nomor penerima: ${wa||'[SIAPKAN VARIABEL KONFIGURASI NOMOR_WHATSAPP]'}. Gunakan tautan wa.me / api.whatsapp.com dengan pesan URL-encoded berisi ringkasan hasil. JANGAN mengirim otomatis; pengguna harus menekan tombol dan mengonfirmasi pengiriman di WhatsApp.`;
  }
  if(mode==='sheet'||mode==='sheet_whatsapp'){
    out+=`\n- Simpan hasil ke Google Spreadsheet melalui Google Apps Script Web App menggunakan fetch POST. Endpoint: ${url||'[SIAPKAN VARIABEL KONFIGURASI SCRIPT_URL]'}. Jika URL belum diisi, kode harus tetap valid dan menampilkan petunjuk singkat bahwa guru perlu menempel URL Apps Script pada variabel konfigurasi.`;
    out+=`\n- Tampilkan status “Mengirim hasil...”, “Berhasil disimpan”, dan pesan kesalahan yang ramah. Jika koneksi gagal, jangan hilangkan hasil dari layar.`;
  }
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

function baseRules(){return `KETENTUAN TEKNIS WAJIB:\n1. Buat SATU FILE HTML FINAL dan lengkap, dimulai dari <!DOCTYPE html> sampai </html>.\n2. Seluruh CSS wajib berada di dalam tag <style> dan seluruh JavaScript di dalam tag <script>.\n3. Jangan membuat file CSS, JavaScript, JSON, gambar, atau aset lokal terpisah.\n4. Jangan menggunakan backend/database kecuali pengguna secara eksplisit memilih integrasi Google Spreadsheet. Build tools atau framework yang perlu instalasi tetap dilarang.\n5. Prioritaskan HTML, CSS, dan vanilla JavaScript. Jika ikon diperlukan, gunakan emoji, CSS, SVG inline, atau bentuk sederhana yang tertanam di file.\n6. Media harus tetap dapat digunakan secara offline sejauh memungkinkan. Jika integrasi WhatsApp/Google Spreadsheet dipilih, hanya fitur integrasi tersebut yang boleh memerlukan koneksi internet.\n7. Semua tombol, navigasi, kuis, skor, timer, drag-drop, matching, popup, dan fitur yang diminta HARUS benar-benar berfungsi. Jangan membuat mockup palsu.\n8. Responsive untuk layar HP, tablet, laptop, dan desktop. Tidak boleh ada horizontal overflow pada HP.\n9. Ukuran tombol nyaman disentuh, input minimal 16px pada mobile, kontras jelas, dan gunakan semantic HTML serta label yang aksesibel.\n10. Interaksi utama harus dapat digunakan dengan tap/click. Jika memakai drag and drop, sediakan alternatif aksesibel melalui klik/pilih agar tetap bisa digunakan di HP.\n11. Gunakan animasi ringan dan tidak berlebihan.\n12. Jangan meminta pengguna menginstal apa pun.\n13. Jangan menampilkan jawaban benar sebelum siswa menjawab.\n14. Setelah jawaban/tindakan siswa, berikan feedback yang edukatif, bukan hanya benar/salah.\n15. Tidak perlu login. Jika penyimpanan eksternal tidak dipilih, data cukup disimpan selama halaman terbuka.\n16. Isi pembelajaran harus akurat, sesuai usia/kelas, dan mendukung tujuan pembelajaran.\n17. Berikan hanya SATU blok kode HTML lengkap sebagai output utama, siap disalin dan disimpan menjadi file .html.\n18. Pastikan JavaScript valid dan tidak ada tombol atau fitur yang dibiarkan tidak berfungsi.`}
function generateMPI(d){const features=checkedValues('mpiFeatures');return `Bertindaklah sebagai instructional designer, UI/UX designer, dan front-end developer yang berpengalaman membuat media pembelajaran interaktif untuk sekolah.\n\nBuat langsung MEDIA PEMBELAJARAN INTERAKTIF dalam satu file HTML all-in-one berdasarkan spesifikasi berikut.\n\nDATA PEMBELAJARAN\nMata pelajaran: ${d.mapel}\nKelas: ${d.kelas}\nFase: ${d.fase}\nMateri / topik: ${d.materi}\nTujuan pembelajaran:\n${d.tp}\n\nSPESIFIKASI MEDIA\nJenis media: ${d.mpiType}\nJumlah bagian/scene: ${d.mpiScenes}\nInteraksi yang digunakan: ${features.length?features.join(', '):'Tentukan interaksi paling relevan dengan materi'}\nTarget perangkat: ${d.device}\nMode penggunaan: ${d.usage}\nBahasa: ${d.language}\nGaya visual: ${d.style}\nCatatan tambahan: ${clean(d.notes)||'Tidak ada'}\n\nSTRUKTUR YANG DIHARAPKAN\n- Layar pembuka/hero yang menarik dengan judul materi dan tombol Mulai Belajar.\n- Tujuan pembelajaran ditampilkan secara ringkas.\n- Navigasi yang jelas dan konsisten.\n- Materi dibagi menjadi bagian kecil, visual, tidak berupa paragraf panjang.\n- Gunakan kartu, ikon, diagram sederhana, ilustrasi CSS/SVG inline, atau elemen visual yang relevan.\n- Sertakan interaksi sesuai pilihan pengguna.\n- Sertakan minimal satu aktivitas pemahaman/cek pemahaman.\n- Sertakan feedback setelah siswa berinteraksi.\n- Sertakan progress belajar jika relevan.\n- Akhiri dengan rangkuman/refleksi singkat serta tombol ulang/kembali.\n- Jangan menaruh semua materi pada satu layar panjang tanpa struktur.\n\n${integrationText(d)}\n\n${baseRules()}\n\nBuat desain ${d.style} yang modern, menarik, ramah siswa, dan profesional. Susun sendiri konten, aktivitas, pertanyaan, dan feedback berdasarkan materi dan tujuan pembelajaran.`}
function generateGame(d){const features=checkedValues('gameFeatures');const gameType=new FormData(form).get('gameType');const mechanics={'Quiz Battle':'Pemain menjawab soal bertahap. Gunakan skor, feedback, progress dan sensasi kompetisi ringan.','Memory Card':'Buat kartu tertutup yang dibuka dua per dua. Pasangan harus mewakili hubungan konsep yang benar.','Matching Game':'Pemain memasangkan dua kelompok item yang berhubungan, misalnya istilah-definisi, gambar-konsep, sebab-akibat.','Drag and Drop Challenge':'Pemain menyeret atau memilih objek lalu menempatkannya ke kategori/target yang sesuai. Sediakan alternatif click-to-select.','Escape Room Edukasi':'Game memiliki beberapa ruang/tahap dengan petunjuk dan kode. Jawaban benar membuka clue atau tahap berikutnya.','Adventure / Mission Game':'Buat perjalanan misi berlevel. Tiap level memiliki narasi singkat, tantangan, feedback dan reward.','Treasure Hunt':'Pemain mencari petunjuk dan mengumpulkan item/reward setelah menyelesaikan tantangan pembelajaran.','Spin Wheel Quiz':'Sediakan roda putar visual yang menentukan kategori/soal. Putaran harus bekerja dengan JavaScript.','Maze Challenge':'Buat jalur/maze sederhana berbasis pilihan. Jawaban menentukan jalur menuju tujuan berikutnya.','Tebak Gambar':'Pemain menebak konsep dari visual CSS/SVG/emoji/petunjuk. Hindari ketergantungan gambar eksternal.','True or False Challenge':'Pemain memutuskan benar/salah secara cepat disertai penjelasan edukatif.','Puzzle Edukatif':'Pemain menyusun urutan, bagian, kategori, atau konsep sehingga membentuk jawaban yang benar.'};return `Bertindaklah sebagai game-based learning designer, instructional designer, UI/UX designer, dan front-end game developer.\n\nBuat langsung GAME EDUKATIF INTERAKTIF dalam SATU FILE HTML all-in-one.\n\nDATA PEMBELAJARAN\nMata pelajaran: ${d.mapel}\nKelas: ${d.kelas}\nFase: ${d.fase}\nMateri / topik: ${d.materi}\nTujuan pembelajaran:\n${d.tp}\n\nSPESIFIKASI GAME\nJenis game: ${gameType}\nMekanik utama: ${mechanics[gameType]||'Gunakan mekanik yang sesuai dengan tipe game.'}\nJumlah level: ${d.levels}\nJumlah soal/tantangan: ${d.questions}\nFitur game: ${features.length?features.join(', '):'Skor, progress, feedback, hasil akhir, dan main lagi'}\nTarget perangkat: ${d.device}\nMode penggunaan: ${d.usage}\nBahasa: ${d.language}\nGaya visual: ${d.style}\nCatatan tambahan: ${clean(d.notes)||'Tidak ada'}\n\nALUR GAME WAJIB\n1. Layar pembuka dengan judul game, topik, deskripsi singkat dan tombol MULAI.\n2. Layar petunjuk singkat tentang cara bermain.\n3. Area permainan utama sesuai mekanik ${gameType}.\n4. Progress level/tantangan harus terlihat.\n5. Setiap jawaban/aksi memberi feedback yang jelas dan edukatif.\n6. Jika fitur skor dipilih, skor harus bertambah/berkurang secara konsisten.\n7. Jika timer dipilih, timer harus benar-benar berjalan dan berhenti dengan benar.\n8. Jika nyawa dipilih, kesalahan mengurangi nyawa dan ada kondisi game over yang masuk akal.\n9. Jika reward/badge dipilih, berikan reward pada pencapaian tertentu.\n10. Setelah seluruh tantangan selesai tampilkan layar hasil akhir berisi skor/pencapaian dan pesan reflektif.\n11. Sediakan tombol MAIN LAGI yang benar-benar mereset state game.\n12. Pertanyaan/tantangan harus bervariasi, tidak monoton, dan sesuai tujuan pembelajaran.\n\n${integrationText(d)}\n\n${baseRules()}\n\nBuat game terasa benar-benar dimainkan, bukan halaman soal biasa yang hanya diberi dekorasi game. Gunakan ${d.style} sebagai identitas visual. Susun sendiri soal, jawaban, tantangan, feedback dan reward berdasarkan materi serta tujuan pembelajaran.`}

function generateLab(d){
  const focus=clean(d.labFocus);
  return `Bertindaklah sebagai instructional designer, virtual laboratory designer, guru sains, UI/UX designer, dan front-end developer yang berpengalaman membuat laboratorium maya untuk pembelajaran sekolah.

Buat langsung LAB MAYA / VIRTUAL LAB interaktif dalam SATU FILE HTML all-in-one berdasarkan spesifikasi berikut.

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

${baseRules()}

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
