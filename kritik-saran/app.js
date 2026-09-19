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

const form = document.querySelector("#feedbackForm");
const btn = document.querySelector("#submitBtn");
const msg = document.querySelector("#message");
const status = document.querySelector("#connectionStatus");

status.textContent = configured
  ? "Terhubung ke database GEMA."
  : "Mode demo: hubungkan Supabase agar masukan tersimpan untuk admin.";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());

  btn.disabled = true;
  btn.textContent = "Mengirim...";
  msg.textContent = "";
  msg.className = "message";

  if (!client) {
    try {
      const existing = JSON.parse(localStorage.getItem("gema_feedback_demo") || "[]");
      existing.push({...payload, created_at:new Date().toISOString()});
      localStorage.setItem("gema_feedback_demo", JSON.stringify(existing));
      msg.className = "message ok";
      msg.textContent = "Tersimpan dalam mode demo di browser ini. Hubungkan Supabase agar masuk ke database admin.";
      form.reset();
    } catch (err) {
      msg.className = "message err";
      msg.textContent = "Masukan belum dapat disimpan.";
    }
  } else {
    const { error } = await client.from("gema_feedback").insert({
      name: payload.name || null,
      role: payload.role,
      institution: payload.institution || null,
      feature: payload.feature,
      rating: Number(payload.rating),
      positive: payload.positive || null,
      criticism: payload.criticism || null,
      suggestion: payload.suggestion,
      contact: payload.contact || null
    });

    if (error) {
      console.error(error);
      msg.className = "message err";
      msg.textContent = "Gagal mengirim. Pastikan tabel kritik & saran sudah dibuat di Supabase.";
    } else {
      msg.className = "message ok";
      msg.textContent = "Terima kasih. Kritik dan saran berhasil dikirim.";
      form.reset();
    }
  }

  btn.disabled = false;
  btn.textContent = "Kirim Kritik & Saran";
});
})();