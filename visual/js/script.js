/**
 * @typedef {Object} FieldConfig
 * @property {string=} name
 * @property {string=} label
 * @property {'text'|'textarea'|'select'=} type
 * @property {string=} placeholder
 * @property {boolean=} required
 * @property {boolean=} full
 * @property {string[]=} options
 * @property {string=} section
 * @property {string=} help
 */

/** @typedef {Record<string, string>} FormDataMap */

/**
 * @typedef {Object} GeneratorConfig
 * @property {string} title
 * @property {string} icon
 * @property {string} desc
 * @property {FieldConfig[]} fields
 * @property {(data: FormDataMap) => string} build
 */

/** @type {HTMLElement} */
const toast = /** @type {HTMLElement} */ (document.getElementById('toast'));
/** @type {HTMLElement} */
const modal = /** @type {HTMLElement} */ (document.getElementById('generatorModal'));
/** @type {HTMLFormElement} */
const form = /** @type {HTMLFormElement} */ (document.getElementById('generatorForm'));
/** @type {HTMLElement} */
const modalTitle = /** @type {HTMLElement} */ (document.getElementById('modalTitle'));
/** @type {HTMLElement} */
const modalDesc = /** @type {HTMLElement} */ (document.getElementById('modalDesc'));
/** @type {HTMLElement} */
const modalIcon = /** @type {HTMLElement} */ (document.getElementById('modalIcon'));
/** @type {HTMLElement} */
const result = /** @type {HTMLElement} */ (document.getElementById('promptResult'));
/** @type {HTMLTextAreaElement} */
const output = /** @type {HTMLTextAreaElement} */ (document.getElementById('promptOutput'));
/** @type {string|null} */
let activeGenerator = null;
let toastTimer = 0;

/** @param {string} message */
function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

/** @type {FieldConfig[]} */
const commonFields = [
  {name:'mapel',label:'Mata Pelajaran',type:'text',placeholder:'Contoh: Pendidikan Agama Islam dan Budi Pekerti',required:true},
  {name:'kelas',label:'Kelas',type:'select',required:true,options:['Kelas I','Kelas II','Kelas III','Kelas IV','Kelas V','Kelas VI','Kelas VII','Kelas VIII','Kelas IX','Kelas X','Kelas XI','Kelas XII','Lainnya']},
  {name:'fase',label:'Fase',type:'select',options:['Tidak digunakan','Fase A','Fase B','Fase C','Fase D','Fase E','Fase F']},
  {name:'materi',label:'Materi / Topik',type:'text',placeholder:'Contoh: Cabang-Cabang Iman',required:true,full:true},
  {name:'tp',label:'Tujuan Pembelajaran',type:'textarea',placeholder:'Contoh: Peserta didik mampu menganalisis...',required:true,full:true}
];

const designOptions = ['Doodle Education','Modern Classroom','Editorial Education','Notebook Style','Colorful Classroom','Minimalist Clean','Comic Education','Islamic Modern','Nature Learning','Gamified Worksheet','Cute Education','Professional Academic'];

/** @type {Record<string, GeneratorConfig>} */
const generators = {
  lkm:{title:'Generator LKM',icon:'fa-clipboard-list',desc:'Buat prompt konsep Lembar Kerja Murid lengkap dengan aktivitas, layout, dan desain visual.',fields:[
    {section:'Pengaturan LKM'},
    {name:'alokasi',label:'Alokasi Waktu',type:'select',options:['Tidak ditentukan','1 × 35 menit','2 × 35 menit','1 × 40 menit','2 × 40 menit','1 × 45 menit','2 × 45 menit','3 × 45 menit','Lainnya']},
    {name:'tujuan',label:'Tujuan Penggunaan LKM',type:'select',options:['Eksplorasi awal materi','Memahami konsep','Latihan setelah belajar','Diskusi kelompok','Pemecahan masalah','Pendalaman materi','Asesmen formatif','Refleksi','Proyek','Belajar mandiri','Campuran']},
    {name:'aktivitas',label:'Jenis Aktivitas',type:'select',options:['Biarkan AI memilih yang paling sesuai','Studi kasus','Analisis gambar','Matching / menjodohkan','Klasifikasi','Benar-Salah + alasan','Problem solving','Literasi','Numerasi','HOTS','Word search','Crossword','Mind map mini','Reflection card','Campuran aktivitas']},
    {name:'halaman',label:'Jumlah Halaman',type:'select',options:['Otomatis sesuai kebutuhan','1 halaman','2 halaman','3 halaman','4 halaman','5 halaman','6 halaman']},
    {name:'pengerjaan',label:'Cara Mengerjakan',type:'select',options:['Individu - langsung di LKM','Individu - jawaban di buku catatan','Berpasangan','Kelompok','Diskusi kelas','Campuran']},
    {name:'level',label:'Tingkat Kesulitan',type:'select',options:['Bertahap','Dasar','Dasar-Sedang','Sedang','Sedang-Menantang','Menantang']},
    {section:'Desain Visual'},
    {name:'desain',label:'Gaya Desain',type:'select',options:designOptions},
    {name:'warna',label:'Palet Warna',type:'select',options:['Otomatis sesuai desain','Ungu / Lavender','Biru','Navy','Hijau','Pastel','Earth tone','Monokrom']},
    {name:'ukuran',label:'Ukuran',type:'select',options:['A4 Portrait','A4 Landscape','A5 Portrait','4:5 Portrait']},
    {name:'catatan',label:'Preferensi Tambahan',type:'textarea',placeholder:'Opsional. Contoh: sediakan kolom nama, kelas, nomor halaman; teks jangan kecil.',full:true}
  ],build:d=>basePrompt(d,'Lembar Kerja Murid',`LKM digunakan untuk: ${d.tujuan}.\nJenis aktivitas: ${d.aktivitas}.\nJumlah halaman: ${d.halaman}.\nCara mengerjakan: ${d.pengerjaan}.\nTingkat kesulitan: ${d.level}.\nGaya desain: ${d.desain}.\nPalet warna: ${d.warna}.\nUkuran: ${d.ukuran}.\nPreferensi tambahan: ${d.catatan||'Tidak ada.'}`,`Untuk SETIAP halaman tuliskan: nomor dan judul halaman; fungsi halaman; tujuan aktivitas; petunjuk final untuk murid; seluruh isi soal/aktivitas yang benar-benar akan digunakan; ruang kerja/jawaban yang dibutuhkan; konsep visual; layout; ilustrasi/ikon; warna dan hierarki; seluruh teks final yang harus tampil; serta catatan konsistensi antarhalaman. Aktivitas harus mendorong murid berpikir, tidak monoton, dan sesuai tujuan pembelajaran. Jika jawaban ditulis di buku, jangan sediakan ruang kosong berlebihan. Jika konten terlalu banyak, pecah ke halaman berikutnya daripada memperkecil teks.`)},

  slide:{title:'Generator Slide Materi',icon:'fa-display',desc:'Buat prompt konsep presentasi pembelajaran visual, bukan sekadar memindahkan buku ke slide.',fields:[
    {section:'Pengaturan Slide'},
    {name:'jumlah',label:'Jumlah Slide',type:'select',options:['Otomatis sesuai keluasan materi','5 slide','8 slide','10 slide','12 slide','15 slide','20 slide']},
    {name:'model',label:'Model Penyajian',type:'select',options:['Pembuka - Materi - Latihan - Refleksi','Berkesadaran - Memahami - Mengaplikasi - Merefleksi','Storytelling','Problem Based Learning','Project Based Learning','Eksplorasi Konsep','Ringkas untuk presentasi guru']},
    {name:'teks',label:'Kepadatan Teks',type:'select',options:['Ringkas','Seimbang','Detail secukupnya']},
    {section:'Desain Visual'},
    {name:'desain',label:'Gaya Desain',type:'select',options:designOptions},
    {name:'rasio',label:'Rasio Slide',type:'select',options:['16:9 Landscape','4:3 Landscape']},
    {name:'catatan',label:'Preferensi Tambahan',type:'textarea',placeholder:'Opsional. Contoh: visual dominan, gunakan diagram bila lebih efektif.',full:true}
  ],build:d=>basePrompt(d,'Slide Materi',`Jumlah slide: ${d.jumlah}.\nModel penyajian: ${d.model}.\nKepadatan teks: ${d.teks}.\nGaya desain: ${d.desain}.\nRasio: ${d.rasio}.\nPreferensi tambahan: ${d.catatan||'Tidak ada.'}`,`Untuk SETIAP slide tuliskan: nomor slide; judul; tujuan slide; isi inti; teks final yang tampil; contoh/aktivitas bila perlu; konsep visual; ilustrasi/diagram; layout dan komposisi; warna; serta hubungan dengan slide sebelum/sesudahnya. Satu slide harus fokus pada satu gagasan utama. Hindari paragraf panjang. Jika konsep lebih efektif dijelaskan lewat visual, prioritaskan visual tersebut.`)},

  infografis:{title:'Generator Infografis',icon:'fa-chart-column',desc:'Buat prompt konsep infografis edukatif yang ringkas, terstruktur, dan mudah divisualkan.',fields:[
    {section:'Pengaturan Infografis'},
    {name:'jenis',label:'Jenis Infografis',type:'select',options:['Ringkasan konsep','Fakta penting','Proses / langkah','Timeline','Perbandingan','Sebab - akibat','Klasifikasi','Do & Don’t','Data / statistik']},
    {name:'bagian',label:'Jumlah Bagian',type:'select',options:['Otomatis','3 bagian','4 bagian','5 bagian','6 bagian','7 bagian']},
    {name:'orientasi',label:'Orientasi',type:'select',options:['4:5 Portrait','A4 Portrait','A4 Landscape','16:9 Landscape']},
    {name:'desain',label:'Gaya Desain',type:'select',options:designOptions},
    {name:'catatan',label:'Preferensi Tambahan',type:'textarea',placeholder:'Opsional. Contoh: utamakan ikon, teks sangat ringkas.',full:true}
  ],build:d=>basePrompt(d,'Infografis Pembelajaran',`Jenis infografis: ${d.jenis}.\nJumlah bagian: ${d.bagian}.\nOrientasi: ${d.orientasi}.\nGaya desain: ${d.desain}.\nPreferensi tambahan: ${d.catatan||'Tidak ada.'}`,`Susun konsep infografis dari headline, subheadline singkat, urutan section, isi ringkas setiap section, data/fakta yang perlu tampil, ikon atau ilustrasi, hierarki visual, layout, warna, dan footer jika diperlukan. Teks harus sangat mudah dibaca dan tidak padat. Semua teks final yang akan tampil pada infografis harus sudah ditentukan pada konsep.`)},

  rangkuman:{title:'Generator Rangkuman Visual',icon:'fa-book-open',desc:'Buat prompt konsep rangkuman visual untuk membantu murid mengingat poin penting materi.',fields:[
    {section:'Pengaturan Rangkuman'},
    {name:'jenis',label:'Jenis Rangkuman',type:'select',options:['One Page Summary','Visual Notes','Sketchnote','Cheat Sheet','Tabel Ringkasan','Konsep + Contoh','Ringkasan untuk Ujian']},
    {name:'panjang',label:'Kedalaman Materi',type:'select',options:['Sangat ringkas','Ringkas','Sedang','Cukup detail']},
    {name:'halaman',label:'Jumlah Halaman',type:'select',options:['1 halaman','2 halaman','3 halaman','Otomatis']},
    {name:'desain',label:'Gaya Desain',type:'select',options:designOptions},
    {name:'ukuran',label:'Ukuran',type:'select',options:['A4 Portrait','A4 Landscape','4:5 Portrait']},
    {name:'catatan',label:'Preferensi Tambahan',type:'textarea',placeholder:'Opsional. Contoh: akhiri dengan 5 poin “Yang Harus Kamu Ingat”.',full:true}
  ],build:d=>basePrompt(d,'Rangkuman Materi Visual',`Jenis rangkuman: ${d.jenis}.\nKedalaman: ${d.panjang}.\nJumlah halaman: ${d.halaman}.\nGaya desain: ${d.desain}.\nUkuran: ${d.ukuran}.\nPreferensi tambahan: ${d.catatan||'Tidak ada.'}`,`Untuk setiap halaman/bagian tentukan judul, poin inti, istilah kunci, contoh, fakta atau rumus penting bila relevan, struktur informasi, visual/ikon, layout, dan teks final yang akan tampil. Hindari paragraf panjang. Rangkuman harus membantu murid menangkap inti materi tanpa kehilangan ketepatan konsep.`)},

  komik:{title:'Generator Komik Pembelajaran',icon:'fa-comments',desc:'Buat prompt konsep komik pembelajaran lengkap per halaman dan per panel.',fields:[
    {section:'Pengaturan Komik'},
    {name:'jenis',label:'Jenis Cerita',type:'select',options:['Kehidupan sekolah','Studi kasus','Humor edukatif','Konflik nilai','Dialog konsep','Petualangan edukatif']},
    {name:'halaman',label:'Jumlah Halaman',type:'select',options:['1 halaman','2 halaman','3 halaman','4 halaman','5 halaman','6 halaman','Otomatis']},
    {name:'panel',label:'Panel per Halaman',type:'select',options:['Otomatis','3 panel','4 panel','6 panel']},
    {name:'karakter',label:'Karakter Utama',type:'text',placeholder:'Contoh: dua siswa SMA dan seorang guru'},
    {name:'desain',label:'Gaya Ilustrasi',type:'select',options:['Comic Education','Cartoon modern','Manga ringan','3D cartoon','Editorial comic']},
    {name:'catatan',label:'Preferensi Tambahan',type:'textarea',placeholder:'Opsional. Contoh: dialog singkat, humor ringan, tetap sopan.',full:true}
  ],build:d=>basePrompt(d,'Komik Pembelajaran',`Jenis cerita: ${d.jenis}.\nJumlah halaman: ${d.halaman}.\nPanel per halaman: ${d.panel}.\nKarakter utama: ${d.karakter||'Tentukan yang sesuai materi.'}.\nGaya ilustrasi: ${d.desain}.\nPreferensi tambahan: ${d.catatan||'Tidak ada.'}`,`Susun konsep per HALAMAN dan per PANEL. Untuk setiap panel tuliskan: lokasi/adegan, karakter yang muncul, aksi, ekspresi, dialog atau caption final, sudut pandang visual, latar, dan fungsi panel dalam alur pembelajaran. Jaga konsistensi penampilan karakter dari awal sampai akhir. Dialog harus singkat dan mudah dibaca.`)},

  cerita:{title:'Generator Cerita Bergambar',icon:'fa-book',desc:'Buat prompt konsep cerita bergambar edukatif per halaman dengan alur yang jelas.',fields:[
    {section:'Pengaturan Cerita'},
    {name:'genre',label:'Genre',type:'select',options:['Petualangan','Kehidupan sehari-hari','Inspiratif','Moral / karakter','Islami','Sains','Sejarah']},
    {name:'halaman',label:'Jumlah Halaman',type:'select',options:['4 halaman','6 halaman','8 halaman','10 halaman','12 halaman','Otomatis']},
    {name:'target',label:'Target Pembaca',type:'select',options:['SD kelas rendah','SD kelas tinggi','SMP','SMA / SMK']},
    {name:'karakter',label:'Karakter Utama',type:'text',placeholder:'Contoh: Aisyah, siswi kelas X yang suka mengamati alam'},
    {name:'desain',label:'Gaya Ilustrasi',type:'select',options:['Children Storybook','Cartoon modern','Watercolor soft','3D soft','Editorial illustration']},
    {name:'catatan',label:'Pesan / Nilai Utama',type:'textarea',placeholder:'Opsional. Contoh: tanggung jawab menjaga lingkungan sebagai bagian dari iman.',full:true}
  ],build:d=>basePrompt(d,'Cerita Bergambar Edukatif',`Genre: ${d.genre}.\nJumlah halaman: ${d.halaman}.\nTarget pembaca: ${d.target}.\nKarakter utama: ${d.karakter||'Tentukan yang sesuai.'}.\nGaya ilustrasi: ${d.desain}.\nPesan/nilai utama: ${d.catatan||'Sesuaikan dengan tujuan pembelajaran.'}`,`Susun konsep per halaman. Untuk setiap halaman tuliskan: fungsi dalam alur, narasi final, dialog jika ada, adegan, karakter, emosi, lokasi, komposisi visual, ilustrasi utama, warna/suasana, serta konsistensi karakter. Cerita harus memiliki pembuka, perkembangan, titik penting, dan penutup/refleksi yang alami.`)},

  poster:{title:'Generator Poster Edukasi',icon:'fa-image',desc:'Buat prompt konsep poster edukasi dengan hierarki pesan dan visual yang kuat.',fields:[
    {section:'Pengaturan Poster'},
    {name:'jenis',label:'Jenis Poster',type:'select',options:['Kampanye','Ajakan','Peringatan','Motivasi','Fakta pendidikan','Tata tertib','Nilai karakter','Hari besar / peringatan']},
    {name:'pesan',label:'Pesan Inti / CTA',type:'text',placeholder:'Contoh: Jaga bumi mulai dari kebiasaan kecil'},
    {name:'ukuran',label:'Ukuran',type:'select',options:['4:5 Portrait','A4 Portrait','A3 Portrait','16:9 Landscape']},
    {name:'desain',label:'Gaya Desain',type:'select',options:designOptions},
    {name:'catatan',label:'Preferensi Tambahan',type:'textarea',placeholder:'Opsional. Contoh: headline besar, isi sangat singkat, satu visual utama.',full:true}
  ],build:d=>basePrompt(d,'Poster Edukasi',`Jenis poster: ${d.jenis}.\nPesan inti / CTA: ${d.pesan||'Tentukan yang paling sesuai dengan materi.'}.\nUkuran: ${d.ukuran}.\nGaya desain: ${d.desain}.\nPreferensi tambahan: ${d.catatan||'Tidak ada.'}`,`Tentukan headline, subheadline bila perlu, isi pendukung singkat, CTA, visual utama, ikon/elemen tambahan, layout, warna, hierarki tipografi, dan footer bila diperlukan. Poster harus bisa dipahami dalam beberapa detik dan tidak penuh teks.`)},

  flashcard:{title:'Generator Flashcard',icon:'fa-layer-group',desc:'Buat prompt konsep satu set kartu belajar yang konsisten dan mudah dipakai.',fields:[
    {section:'Pengaturan Flashcard'},
    {name:'jenis',label:'Jenis Flashcard',type:'select',options:['Istilah - definisi','Soal - jawaban','Gambar - nama','Konsep - contoh','Dalil - makna','Tokoh - informasi','Vocabulary']},
    {name:'jumlah',label:'Jumlah Kartu',type:'select',options:['6 kartu','8 kartu','10 kartu','12 kartu','16 kartu','Otomatis']},
    {name:'sisi',label:'Format Kartu',type:'select',options:['Dua sisi: depan-belakang','Satu sisi lengkap']},
    {name:'desain',label:'Gaya Desain',type:'select',options:designOptions},
    {name:'ukuran',label:'Ukuran',type:'select',options:['A6 Portrait','A7 Portrait','1:1 Square','4:5 Portrait']},
    {name:'catatan',label:'Preferensi Tambahan',type:'textarea',placeholder:'Opsional. Contoh: gunakan warna kategori berbeda tetapi tetap konsisten.',full:true}
  ],build:d=>basePrompt(d,'Flashcard / Kartu Belajar',`Jenis flashcard: ${d.jenis}.\nJumlah kartu: ${d.jumlah}.\nFormat kartu: ${d.sisi}.\nGaya desain: ${d.desain}.\nUkuran: ${d.ukuran}.\nPreferensi tambahan: ${d.catatan||'Tidak ada.'}`,`Susun konsep untuk setiap kartu: nomor kartu; isi sisi depan; isi sisi belakang jika ada; teks final; ikon/ilustrasi; warna kategori; layout; dan elemen konsisten. Pastikan setiap kartu hanya memuat satu konsep utama dan mudah dibaca.`)},

  mindmap:{title:'Generator Mind Map',icon:'fa-diagram-project',desc:'Buat prompt konsep peta pikiran yang jelas, hierarkis, dan mudah divisualkan.',fields:[
    {section:'Pengaturan Mind Map'},
    {name:'jenis',label:'Jenis Struktur',type:'select',options:['Radial Mind Map','Hierarki / Tree Map','Flow Concept','Sebab - Akibat','Perbandingan','Konsep utama + cabang']},
    {name:'cabang',label:'Jumlah Cabang Utama',type:'select',options:['Otomatis','3 cabang','4 cabang','5 cabang','6 cabang','8 cabang']},
    {name:'kedalaman',label:'Kedalaman',type:'select',options:['Ringkas','Sedang','Detail secukupnya']},
    {name:'desain',label:'Gaya Desain',type:'select',options:designOptions},
    {name:'ukuran',label:'Ukuran',type:'select',options:['A4 Landscape','A3 Landscape','16:9 Landscape','1:1 Square']},
    {name:'catatan',label:'Preferensi Tambahan',type:'textarea',placeholder:'Opsional. Contoh: satu warna per cabang, gunakan ikon sederhana.',full:true}
  ],build:d=>basePrompt(d,'Mind Map / Peta Konsep',`Jenis struktur: ${d.jenis}.\nJumlah cabang utama: ${d.cabang}.\nKedalaman: ${d.kedalaman}.\nGaya desain: ${d.desain}.\nUkuran: ${d.ukuran}.\nPreferensi tambahan: ${d.catatan||'Tidak ada.'}`,`Tentukan konsep pusat, cabang utama, subcabang, kata kunci pada setiap node, hubungan antaride, urutan/hierarki, ikon, kode warna, dan layout. Gunakan frasa pendek, bukan paragraf. Pastikan hubungan konsep benar dan mudah dipahami.`)}
};

/**
 * @param {FormDataMap} d
 * @param {string} product
 * @param {string} settings
 * @param {string} specific
 * @returns {string}
 */
function basePrompt(d,product,settings,specific){return `Bertindaklah sebagai instructional designer dan visual learning designer yang membantu guru merancang ${product} yang akurat, menarik, sesuai tujuan pembelajaran, dan nantinya dapat divisualisasikan menggunakan AI pembuat gambar.\n\nDATA PEMBELAJARAN\nMata pelajaran: ${d.mapel}\nKelas: ${d.kelas}\nFase: ${d.fase||'Tidak digunakan'}\nMateri / topik: ${d.materi}\nTujuan pembelajaran: ${d.tp}${d.alokasi ? `\nAlokasi waktu: ${d.alokasi}` : ''}\n\nPENGATURAN MEDIA\n${settings}\n\nTUGAS ANDA\nBuat terlebih dahulu KONSEP ${product.toUpperCase()} secara lengkap dan terstruktur. JANGAN membuat gambar pada tahap ini.\n\n${specific}\n\nATURAN KUALITAS\n- Isi harus sesuai dengan kelas, materi, dan tujuan pembelajaran.\n- Gunakan Bahasa Indonesia yang jelas dan ramah siswa.\n- Semua teks penting yang nantinya harus tampil pada visual harus sudah ditentukan dalam konsep.\n- Jaga keterbacaan; hindari teks terlalu kecil dan desain terlalu ramai.\n- Visual harus mendukung pembelajaran, bukan sekadar dekorasi.\n- Pertahankan gaya visual yang konsisten pada seluruh halaman/slide/kartu/panel.\n- Jika konten terlalu padat, pecah menjadi bagian tambahan daripada memperkecil tulisan.\n- Jangan menampilkan kunci jawaban atau informasi yang seharusnya tidak terlihat oleh murid kecuali memang diminta.\n\nSetelah konsep selesai, berhenti. Saya akan meninjau konsep tersebut terlebih dahulu. Setelah disetujui, saya akan meminta Anda membuat visual satu per satu berdasarkan konsep yang sudah dibuat dalam percakapan ini.`}

/** @param {FieldConfig} f */
function fieldHTML(f){
  if (f.section) return `<div class="form-section-title">${f.section}</div>`;
  const cls = `field${f.full ? ' full' : ''}`;
  const req = f.required ? ' required' : '';
  const name = f.name || '';
  const label = f.label || '';
  const options = f.options || [];
  let control = '';

  if (f.type === 'textarea') {
    control = `<textarea name="${name}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}></textarea>`;
  } else if (f.type === 'select') {
    control = `<select name="${name}" ${f.required ? 'required' : ''}>${options.map((o) => `<option value="${o}">${o}</option>`).join('')}</select>`;
  } else {
    control = `<input type="${f.type || 'text'}" name="${name}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}/>`;
  }

  return `<div class="${cls}"><label class="${req}">${label}</label>${control}${f.help ? `<small>${f.help}</small>` : ''}</div>`;
}

/** @param {string} key */
function openGenerator(key){
  const g = generators[key];
  if (!g) return;

  activeGenerator = key;
  modalTitle.textContent = g.title;
  modalDesc.textContent = g.desc;
  modalIcon.innerHTML = `<i class="fa-solid ${g.icon}"></i>`;
  form.innerHTML = commonFields.map(fieldHTML).join('') + g.fields.map(fieldHTML).join('') + `<div class="form-actions"><button class="btn btn-primary" type="submit"><i class="fa-solid fa-wand-magic-sparkles"></i> Generate Prompt Konsep</button></div>`;
  result.hidden = true;
  form.hidden = false;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  window.setTimeout(() => {
    const firstField = /** @type {HTMLElement|null} */ (form.querySelector('input,select,textarea'));
    firstField?.focus();
  }, 100);
}

function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('.generator-card').forEach((card) => {
  const element = /** @type {HTMLElement} */ (card);
  element.addEventListener('click', () => openGenerator(element.dataset.generator || ''));
});

document.querySelectorAll('[data-close-modal]').forEach((el) => el.addEventListener('click', closeModal));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!activeGenerator) return;

  const fd = new FormData(form);
  /** @type {FormDataMap} */
  const data = {};
  fd.forEach((value, key) => {
    data[key] = String(value);
  });

  const prompt = generators[activeGenerator].build(data);
  output.value = prompt;
  form.hidden = true;
  result.hidden = false;
  result.scrollIntoView({behavior:'smooth', block:'start'});
  showToast('Prompt konsep berhasil dibuat.');
});

document.getElementById('copyPromptBtn').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard || !window.isSecureContext) {
      output.focus();
      output.select();
      showToast('Prompt sudah dipilih. Silakan tekan Salin/Copy.');
      return;
    }
    await navigator.clipboard.writeText(output.value);
    showToast('Prompt berhasil disalin.');
  } catch (error) {
    console.error('Gagal menyalin prompt:', error);
    output.focus();
    output.select();
    showToast('Prompt sudah dipilih. Silakan tekan Salin/Copy.');
  }
});
document.getElementById('editFormBtn').addEventListener('click',()=>{result.hidden=true;form.hidden=false;form.scrollIntoView({behavior:'smooth',block:'start'})});
document.getElementById('newPromptBtn').addEventListener('click',()=>{form.reset();result.hidden=true;form.hidden=false;output.value='';form.scrollIntoView({behavior:'smooth',block:'start'})});
