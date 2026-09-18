(() => {
const cfg = window.GEMA_GALLERY_CONFIG || {};
const configured =
  cfg.SUPABASE_URL &&
  cfg.SUPABASE_ANON_KEY &&
  !cfg.SUPABASE_URL.includes("PASTE_") &&
  !cfg.SUPABASE_ANON_KEY.includes("PASTE_");

const client = configured && window.supabase
  ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
  : null;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const grid = $("#galleryGrid");
const empty = $("#emptyState");
const statusEl = $("#connectionStatus");
const form = $("#workForm");
let works = [];

const demoWorks = [];
function setStatus(){
  if(configured){
    statusEl.className = "status online";
    statusEl.textContent = "● Galeri publik terhubung — karya dapat dilihat lintas perangkat.";
  }else{
    statusEl.className = "status demo";
    statusEl.textContent = "● Mode demo lokal — isi config.js + jalankan supabase-setup.sql agar galeri publik aktif.";
  }
}

function safeHttpUrl(value){
  try{
    const u = new URL(value);
    return ["http:","https:"].includes(u.protocol) ? u.href : "";
  }catch(e){ return ""; }
}
function fallbackIcon(cat){
  return {"Visual Edukatif":"🎨","Media Interaktif":"🖥️","Game Edukatif":"🎮","Lab Maya":"🧪"}[cat] || "✨";
}
function fmtDate(v){
  try{return new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"short",year:"numeric"}).format(new Date(v))}
  catch(e){return ""}
}

function createCard(w){
  const article = document.createElement("article");
  article.className = "work-card";

  const thumb = document.createElement("div"); thumb.className="thumb";
  const pill = document.createElement("span"); pill.className="category-pill"; pill.textContent=w.category || "Karya";
  thumb.appendChild(pill);
  const imgUrl = safeHttpUrl(w.thumbnail_url || "");
  if(imgUrl){
    const img=document.createElement("img"); img.src=imgUrl; img.alt=`Sampul ${w.title}`;
    img.loading="lazy";
    img.onerror=()=>{ img.remove(); const f=document.createElement("div"); f.className="fallback"; f.textContent=fallbackIcon(w.category); thumb.appendChild(f); };
    thumb.appendChild(img);
  }else{
    const f=document.createElement("div"); f.className="fallback"; f.textContent=fallbackIcon(w.category); thumb.appendChild(f);
  }

  const body=document.createElement("div"); body.className="card-body";
  const h3=document.createElement("h3"); h3.textContent=w.title;
  const meta=document.createElement("div"); meta.className="meta";
  meta.textContent=`${w.creator}${w.institution ? " • "+w.institution : ""} • ${fmtDate(w.created_at)}`;
  const desc=document.createElement("p"); desc.className="desc"; desc.textContent=w.description || "";
  const tags=document.createElement("div"); tags.className="tags";
  [w.level,w.subject,w.platform].filter(Boolean).forEach(t=>{
    const x=document.createElement("span"); x.className="tag"; x.textContent=t; tags.appendChild(x);
  });
  body.append(h3,meta,desc,tags);

  const a=document.createElement("a"); a.className="visit";
  const valid=safeHttpUrl(w.work_url || "");
  if(valid){a.href=valid;a.target="_blank";a.rel="noopener noreferrer"}
  else{a.href="javascript:void(0)";a.title="Link demo"}
  const label=document.createElement("span"); label.textContent="Buka Karya";
  const arrow=document.createElement("span"); arrow.textContent="↗";
  a.append(label,arrow);

  article.append(thumb,body,a);
  return article;
}

function applyFilters(){
  const q=$("#searchInput").value.trim().toLowerCase();
  const cat=$("#categoryFilter").value;
  const lvl=$("#levelFilter").value;
  const filtered=works.filter(w=>{
    const hay=[w.title,w.creator,w.institution,w.subject,w.description,w.platform].filter(Boolean).join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (!cat || w.category===cat) && (!lvl || w.level===lvl);
  });
  grid.innerHTML="";
  filtered.forEach(w=>grid.appendChild(createCard(w)));
  empty.hidden=filtered.length>0;

  $("#totalWorks").textContent=works.length;
  $("#totalCreators").textContent=new Set(works.map(w=>w.creator).filter(Boolean)).size;
  $("#totalSubjects").textContent=new Set(works.map(w=>w.subject).filter(Boolean)).size;
}

async function loadWorks(){
  grid.innerHTML='<div style="padding:30px;color:#6e6882">Memuat galeri...</div>';
  if(!client){
    works=[...demoWorks];
    applyFilters();
    return;
  }
  const {data,error}=await client.from("gema_gallery").select("*").eq("is_public",true).order("created_at",{ascending:false});
  if(error){
    console.error(error);
    works=[];
    grid.innerHTML="";
    empty.hidden=false;
    empty.querySelector("h3").textContent="Galeri belum dapat dimuat";
    empty.querySelector("p").textContent="Periksa konfigurasi Supabase atau koneksi internet.";
    return;
  }
  works=data || [];
  applyFilters();
}

function openModal(){
  $("#submitModal").classList.add("open");
  $("#submitModal").setAttribute("aria-hidden","false");
  setTimeout(()=>form.elements.title.focus(),30);
}
function closeModal(){
  $("#submitModal").classList.remove("open");
  $("#submitModal").setAttribute("aria-hidden","true");
}
["#openSubmit","#openSubmitHero","#openSubmitEmpty"].forEach(id=>$(id)?.addEventListener("click",openModal));
$$("[data-close]").forEach(x=>x.addEventListener("click",closeModal));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

form.addEventListener("submit", async e=>{
  e.preventDefault();
  const msg=$("#formMessage"), btn=$("#submitBtn");
  const fd=new FormData(form);
  const payload=Object.fromEntries(fd.entries());
  payload.is_public=true;

  if(!safeHttpUrl(payload.work_url)){
    msg.className="form-message err"; msg.textContent="Link karya harus berupa URL http/https yang valid."; return;
  }
  if(payload.thumbnail_url && !safeHttpUrl(payload.thumbnail_url)){
    msg.className="form-message err"; msg.textContent="Link thumbnail tidak valid. Kosongkan jika tidak digunakan."; return;
  }

  btn.disabled=true; btn.textContent="Mempublikasikan..."; msg.textContent="";
  if(!client){
    payload.id="local-"+Date.now(); payload.created_at=new Date().toISOString();
    works.unshift(payload);
    localStorage.setItem("gema_gallery_demo",JSON.stringify(works.filter(x=>String(x.id).startsWith("local-"))));
    applyFilters();
    msg.className="form-message ok";
    msg.textContent="Tersimpan pada mode demo di browser ini. Hubungkan Supabase agar tampil untuk semua orang.";
    form.reset();
    setTimeout(closeModal,1600);
  }else{
    const {data,error}=await client.from("gema_gallery").insert(payload).select().single();
    if(error){
      console.error(error); msg.className="form-message err"; msg.textContent="Gagal mempublikasikan. Periksa konfigurasi database.";
    }else{
      works.unshift(data); applyFilters(); msg.className="form-message ok"; msg.textContent="Karya berhasil dipublikasikan ke Galeri GEMA!";
      form.reset(); setTimeout(closeModal,1300);
    }
  }
  btn.disabled=false; btn.textContent="Publikasikan Karya";
});

$("#searchInput").addEventListener("input",applyFilters);
$("#categoryFilter").addEventListener("change",applyFilters);
$("#levelFilter").addEventListener("change",applyFilters);
$("#refreshBtn").addEventListener("click",loadWorks);

// Restore local demo submissions
if(!client){
  try{
    const local=JSON.parse(localStorage.getItem("gema_gallery_demo")||"[]");
    if(Array.isArray(local)) demoWorks.unshift(...local);
  }catch(e){}
}
setStatus();
loadWorks();
})();