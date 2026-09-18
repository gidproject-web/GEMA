// @ts-nocheck
const root=document;const modeButtons=[...root.querySelectorAll('.mode-card')];const mpiOnly=[...root.querySelectorAll('.mpi-only')];const gameOnly=[...root.querySelectorAll('.game-only')];const labOnly=[...root.querySelectorAll('.lab-only')];const form=root.querySelector('#promptForm');const result=root.querySelector('#result');const output=root.querySelector('#promptOutput');const validation=root.querySelector('#validation');const summaryMode=root.querySelector('#summaryMode');let currentMode='mpi';
modeButtons.forEach(btn=>btn.addEventListener('click',()=>{currentMode=btn.dataset.mode;modeButtons.forEach(b=>b.classList.toggle('active',b===btn));mpiOnly.forEach(el=>el.classList.toggle('hidden',currentMode!=='mpi'));gameOnly.forEach(el=>el.classList.toggle('hidden',currentMode!=='game'));labOnly.forEach(el=>el.classList.toggle('hidden',currentMode!=='lab'));summaryMode.textContent=currentMode==='mpi'?'MEDIA INTERAKTIF':currentMode==='game'?'GAME EDUKATIF':'LAB MAYA';result.classList.add('hidden')}));
function checkedValues(name){return [...root.querySelectorAll(`[data-check-group="${name}"] input:checked`)].map(x=>x.value)}function clean(v){return(v||'').trim()}
function baseRules(){return `KETENTUAN TEKNIS WAJIB:\n1. Buat SATU FILE HTML FINAL dan lengkap, dimulai dari <!DOCTYPE html> sampai </html>.\n2. Seluruh CSS wajib berada di dalam tag <style> dan seluruh JavaScript di dalam tag <script>.\n3. Jangan membuat file CSS, JavaScript, JSON, gambar, atau aset lokal terpisah.\n4. Jangan menggunakan backend, database, build tools, framework yang perlu instalasi, atau dependensi yang membuat file tidak dapat langsung dibuka.\n5. Prioritaskan HTML, CSS, dan vanilla JavaScript. Jika ikon diperlukan, gunakan emoji, CSS, SVG inline, atau bentuk sederhana yang tertanam di file.\n6. Media harus tetap dapat digunakan secara offline sejauh memungkinkan dan tidak boleh bergantung pada API eksternal.\n7. Semua tombol, navigasi, kuis, skor, timer, drag-drop, matching, popup, dan fitur yang diminta HARUS benar-benar berfungsi. Jangan membuat mockup palsu.\n8. Responsive untuk layar HP, tablet, laptop, dan desktop. Tidak boleh ada horizontal overflow pada HP.\n9. Ukuran tombol nyaman disentuh, input minimal 16px pada mobile, kontras jelas, dan gunakan semantic HTML serta label yang aksesibel.\n10. Interaksi utama harus dapat digunakan dengan tap/click. Jika memakai drag and drop, sediakan alternatif aksesibel melalui klik/pilih agar tetap bisa digunakan di HP.\n11. Gunakan animasi ringan dan tidak berlebihan.\n12. Jangan meminta pengguna menginstal apa pun.\n13. Jangan menampilkan jawaban benar sebelum siswa menjawab.\n14. Setelah jawaban/tindakan siswa, berikan feedback yang edukatif, bukan hanya benar/salah.\n15. Data skor/progres cukup disimpan selama halaman terbuka. Tidak perlu login.\n16. Isi pembelajaran harus akurat, sesuai usia/kelas, dan mendukung tujuan pembelajaran.\n17. Berikan hanya SATU blok kode HTML lengkap sebagai output utama, siap disalin dan disimpan menjadi file .html.\n18. Pastikan JavaScript valid dan tidak ada tombol atau fitur yang dibiarkan tidak berfungsi.`}
function generateMPI(d){const features=checkedValues('mpiFeatures');return `Bertindaklah sebagai instructional designer, UI/UX designer, dan front-end developer yang berpengalaman membuat media pembelajaran interaktif untuk sekolah.\n\nBuat langsung MEDIA PEMBELAJARAN INTERAKTIF dalam satu file HTML all-in-one berdasarkan spesifikasi berikut.\n\nDATA PEMBELAJARAN\nMata pelajaran: ${d.mapel}\nKelas: ${d.kelas}\nFase: ${d.fase}\nMateri / topik: ${d.materi}\nTujuan pembelajaran:\n${d.tp}\n\nSPESIFIKASI MEDIA\nJenis media: ${d.mpiType}\nJumlah bagian/scene: ${d.mpiScenes}\nInteraksi yang digunakan: ${features.length?features.join(', '):'Tentukan interaksi paling relevan dengan materi'}\nTarget perangkat: ${d.device}\nMode penggunaan: ${d.usage}\nBahasa: ${d.language}\nGaya visual: ${d.style}\nCatatan tambahan: ${clean(d.notes)||'Tidak ada'}\n\nSTRUKTUR YANG DIHARAPKAN\n- Layar pembuka/hero yang menarik dengan judul materi dan tombol Mulai Belajar.\n- Tujuan pembelajaran ditampilkan secara ringkas.\n- Navigasi yang jelas dan konsisten.\n- Materi dibagi menjadi bagian kecil, visual, tidak berupa paragraf panjang.\n- Gunakan kartu, ikon, diagram sederhana, ilustrasi CSS/SVG inline, atau elemen visual yang relevan.\n- Sertakan interaksi sesuai pilihan pengguna.\n- Sertakan minimal satu aktivitas pemahaman/cek pemahaman.\n- Sertakan feedback setelah siswa berinteraksi.\n- Sertakan progress belajar jika relevan.\n- Akhiri dengan rangkuman/refleksi singkat serta tombol ulang/kembali.\n- Jangan menaruh semua materi pada satu layar panjang tanpa struktur.\n\n${baseRules()}\n\nBuat desain ${d.style} yang modern, menarik, ramah siswa, dan profesional. Susun sendiri konten, aktivitas, pertanyaan, dan feedback berdasarkan materi dan tujuan pembelajaran.`}
function generateGame(d){const features=checkedValues('gameFeatures');const gameType=new FormData(form).get('gameType');const mechanics={'Quiz Battle':'Pemain menjawab soal bertahap. Gunakan skor, feedback, progress dan sensasi kompetisi ringan.','Memory Card':'Buat kartu tertutup yang dibuka dua per dua. Pasangan harus mewakili hubungan konsep yang benar.','Matching Game':'Pemain memasangkan dua kelompok item yang berhubungan, misalnya istilah-definisi, gambar-konsep, sebab-akibat.','Drag and Drop Challenge':'Pemain menyeret atau memilih objek lalu menempatkannya ke kategori/target yang sesuai. Sediakan alternatif click-to-select.','Escape Room Edukasi':'Game memiliki beberapa ruang/tahap dengan petunjuk dan kode. Jawaban benar membuka clue atau tahap berikutnya.','Adventure / Mission Game':'Buat perjalanan misi berlevel. Tiap level memiliki narasi singkat, tantangan, feedback dan reward.','Treasure Hunt':'Pemain mencari petunjuk dan mengumpulkan item/reward setelah menyelesaikan tantangan pembelajaran.','Spin Wheel Quiz':'Sediakan roda putar visual yang menentukan kategori/soal. Putaran harus bekerja dengan JavaScript.','Maze Challenge':'Buat jalur/maze sederhana berbasis pilihan. Jawaban menentukan jalur menuju tujuan berikutnya.','Tebak Gambar':'Pemain menebak konsep dari visual CSS/SVG/emoji/petunjuk. Hindari ketergantungan gambar eksternal.','True or False Challenge':'Pemain memutuskan benar/salah secara cepat disertai penjelasan edukatif.','Puzzle Edukatif':'Pemain menyusun urutan, bagian, kategori, atau konsep sehingga membentuk jawaban yang benar.'};return `Bertindaklah sebagai game-based learning designer, instructional designer, UI/UX designer, dan front-end game developer.\n\nBuat langsung GAME EDUKATIF INTERAKTIF dalam SATU FILE HTML all-in-one.\n\nDATA PEMBELAJARAN\nMata pelajaran: ${d.mapel}\nKelas: ${d.kelas}\nFase: ${d.fase}\nMateri / topik: ${d.materi}\nTujuan pembelajaran:\n${d.tp}\n\nSPESIFIKASI GAME\nJenis game: ${gameType}\nMekanik utama: ${mechanics[gameType]||'Gunakan mekanik yang sesuai dengan tipe game.'}\nJumlah level: ${d.levels}\nJumlah soal/tantangan: ${d.questions}\nFitur game: ${features.length?features.join(', '):'Skor, progress, feedback, hasil akhir, dan main lagi'}\nTarget perangkat: ${d.device}\nMode penggunaan: ${d.usage}\nBahasa: ${d.language}\nGaya visual: ${d.style}\nCatatan tambahan: ${clean(d.notes)||'Tidak ada'}\n\nALUR GAME WAJIB\n1. Layar pembuka dengan judul game, topik, deskripsi singkat dan tombol MULAI.\n2. Layar petunjuk singkat tentang cara bermain.\n3. Area permainan utama sesuai mekanik ${gameType}.\n4. Progress level/tantangan harus terlihat.\n5. Setiap jawaban/aksi memberi feedback yang jelas dan edukatif.\n6. Jika fitur skor dipilih, skor harus bertambah/berkurang secara konsisten.\n7. Jika timer dipilih, timer harus benar-benar berjalan dan berhenti dengan benar.\n8. Jika nyawa dipilih, kesalahan mengurangi nyawa dan ada kondisi game over yang masuk akal.\n9. Jika reward/badge dipilih, berikan reward pada pencapaian tertentu.\n10. Setelah seluruh tantangan selesai tampilkan layar hasil akhir berisi skor/pencapaian dan pesan reflektif.\n11. Sediakan tombol MAIN LAGI yang benar-benar mereset state game.\n12. Pertanyaan/tantangan harus bervariasi, tidak monoton, dan sesuai tujuan pembelajaran.\n\n${baseRules()}\n\nBuat game terasa benar-benar dimainkan, bukan halaman soal biasa yang hanya diberi dekorasi game. Gunakan ${d.style} sebagai identitas visual. Susun sendiri soal, jawaban, tantangan, feedback dan reward berdasarkan materi serta tujuan pembelajaran.`}

function generateLab(d){const features=checkedValues('labFeatures');return `Bertindaklah sebagai instructional designer, virtual laboratory designer, guru sains, UI/UX designer, dan front-end developer yang berpengalaman membuat laboratorium maya untuk pembelajaran sekolah.

Buat langsung LAB MAYA / VIRTUAL LAB interaktif dalam SATU FILE HTML all-in-one berdasarkan spesifikasi berikut.

DATA PEMBELAJARAN
Mata pelajaran: ${d.mapel}
Kelas: ${d.kelas}
Fase: ${d.fase}
Materi / topik: ${d.materi}
Tujuan pembelajaran:
${d.tp}

RANCANGAN EKSPERIMEN
Jenis lab maya: ${d.labType}
Tingkat simulasi: ${d.labComplexity}
Fenomena / eksperimen: ${clean(d.labExperiment)||'Tentukan eksperimen yang paling relevan dengan materi dan tujuan pembelajaran'}
Alat dan bahan virtual: ${clean(d.labTools)||'Tentukan alat dan bahan virtual yang relevan'}
Variabel bebas: ${clean(d.independentVar)||'Tentukan variabel bebas yang sesuai'}
Variabel terikat: ${clean(d.dependentVar)||'Tentukan variabel terikat yang sesuai'}
Variabel kontrol: ${clean(d.controlVars)||'Tentukan variabel kontrol yang sesuai'}
Jumlah percobaan/skenario: ${d.labTrials}
Output data utama: ${d.labOutput}
Komponen fitur: ${features.length?features.join(', '):'Kontrol variabel, pengamatan, tabel data, grafik, analisis, kesimpulan, dan reset eksperimen'}
Prosedur yang diinginkan:
${clean(d.labProcedure)||'Susun prosedur praktikum virtual yang runtut, aman, dan sesuai usia murid'}
Catatan keselamatan / batasan konsep:
${clean(d.labSafety)||'Jelaskan bahwa simulasi adalah model penyederhanaan; sertakan catatan keselamatan apabila eksperimen nyata memiliki risiko'}
Target perangkat: ${d.device}
Mode penggunaan: ${d.usage}
Bahasa: ${d.language}
Gaya visual: ${d.style}
Catatan tambahan: ${clean(d.notes)||'Tidak ada'}

STRUKTUR LAB MAYA WAJIB
1. Layar pembuka berisi judul eksperimen, tujuan, fenomena pemantik, dan tombol MULAI PRAKTIKUM.
2. Tampilkan petunjuk singkat serta alat dan bahan virtual.
3. Sediakan area eksperimen utama yang benar-benar interaktif, bukan gambar statis.
4. Murid harus dapat memanipulasi variabel bebas melalui slider, input, pilihan, atau kontrol yang sesuai.
5. Perubahan variabel harus menghasilkan perubahan keluaran simulasi secara logis dan konsisten terhadap model yang digunakan.
6. Sediakan tombol MULAI, JEDA (jika relevan), CATAT DATA, dan RESET yang benar-benar berfungsi.
7. Tampilkan nilai variabel dan hasil pengamatan secara jelas.
8. Sediakan tabel data yang diperbarui dari setiap percobaan/skenario.
9. Jika grafik dipilih, buat grafik hasil menggunakan Canvas/SVG/HTML tanpa ketergantungan library eksternal; grafik harus diperbarui dari data eksperimen.
10. Sertakan tahap PREDIKSI sebelum eksperimen bila fitur tersebut dipilih.
11. Setelah data terkumpul, tampilkan pertanyaan analisis yang mendorong murid membandingkan data, mengenali pola, dan menghubungkan hasil dengan konsep.
12. Sediakan area KESIMPULAN/REFLEKSI agar murid merumuskan temuan.
13. Jangan mengklaim simulasi identik dengan kondisi nyata. Jelaskan asumsi, keterbatasan model, dan faktor yang disederhanakan.
14. Jika eksperimen nyata memiliki risiko, sertakan catatan keselamatan dan jangan mendorong murid melakukan prosedur berbahaya tanpa pengawasan.
15. Jika materi tidak cocok untuk simulasi kuantitatif, buat investigasi virtual berbasis observasi kualitatif yang tetap interaktif dan bermakna.
16. Gunakan data/nilai contoh yang masuk akal secara pedagogis; hindari angka acak yang tidak punya hubungan dengan variabel.
17. Sertakan tombol ULANGI EKSPERIMEN yang mereset seluruh state dengan benar.
18. Akhiri dengan ringkasan konsep dan refleksi singkat.

${baseRules()}

Buat tampilan ${d.style} yang modern, jelas, dan terasa seperti laboratorium virtual. Susun sendiri konteks eksperimen, model hubungan variabel, data, pertanyaan analisis, feedback, dan refleksi berdasarkan materi serta tujuan pembelajaran. Prioritaskan ketepatan konsep dan pengalaman investigasi murid, bukan sekadar dekorasi.`}

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
