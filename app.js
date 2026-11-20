/* Servimedin — formularios a WhatsApp, menú y el momento de la frase */
const WA = "593981324701";
const $ = s => document.querySelector(s);
const wa = msg => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
const radio = (form, name) => form.querySelector(`input[name="${name}"]:checked`)?.value || "";

function setErr(input, errEl, msg) {
  errEl.textContent = msg;
  input.classList.toggle("bad", !!msg);
  input.setAttribute("aria-invalid", msg ? "true" : "false");
  if (msg) input.setAttribute("aria-describedby", errEl.id); else input.removeAttribute("aria-describedby");
}

/* ---------- Cita ---------- */
const cita = $("#citaForm"), citaBtn = $("#citaSend");
function citaMsg() {
  const n = $("#cName").value.trim(), r = $("#cReason").value, note = $("#cNote").value.trim();
  let m = `Hola doctor Chamorro, quiero agendar una cita en Servimedin.\n\nPaciente: ${n}\nMotivo: ${r}\nTipo: ${radio(cita, "first")}\nPrefiero: ${radio(cita, "when")}`;
  if (note) m += `\nNota: ${note}`;
  return m;
}
function citaValid(show) {
  const n = $("#cName").value.trim(), r = $("#cReason").value;
  if (show) {
    setErr($("#cName"), $("#cNameErr"), n ? "" : "Escribe el nombre del paciente.");
    setErr($("#cReason"), $("#cReasonErr"), r ? "" : "Elige el motivo de la consulta.");
  }
  return n && r;
}
function updCita() { citaBtn.href = citaValid(false) ? wa(citaMsg()) : "#"; }
cita.addEventListener("input", () => { updCita(); if ($("#cName").value.trim()) setErr($("#cName"), $("#cNameErr"), ""); if ($("#cReason").value) setErr($("#cReason"), $("#cReasonErr"), ""); });
citaBtn.addEventListener("click", e => {
  if (!citaValid(true)) { e.preventDefault(); (cita.querySelector(".bad") || cita).focus(); }
});

/* ---------- Farmacia ---------- */
const far = $("#farForm"), farBtn = $("#farSend");
const isHome = () => radio(far, "entrega") === "Entrega a domicilio";
function farMsg() {
  const n = $("#fName").value.trim(), meds = $("#fMeds").value.trim(), z = $("#fZone").value.trim();
  let m = `Hola ${radio(far, "sede")}, quiero cotizar mi receta.\n\nNombre: ${n}`;
  if (meds) m += `\nMedicinas: ${meds}`;
  m += `\nEntrega: ${radio(far, "entrega")}${isHome() && z ? " (" + z + ")" : ""}`;
  m += `\n\nTe envío la foto de la receta en el siguiente mensaje.`;
  return m;
}
function farValid(show) {
  const n = $("#fName").value.trim(), z = $("#fZone").value.trim();
  if (show) {
    setErr($("#fName"), $("#fNameErr"), n ? "" : "Escribe tu nombre.");
    setErr($("#fZone"), $("#fZoneErr"), !isHome() || z ? "" : "Escribe tu barrio para la entrega.");
  }
  return n && (!isHome() || z);
}
function updFar() {
  $("#fZoneWrap").hidden = !isHome();
  farBtn.href = farValid(false) ? wa(farMsg()) : "#";
}
far.addEventListener("input", () => { updFar(); if ($("#fName").value.trim()) setErr($("#fName"), $("#fNameErr"), ""); if ($("#fZone").value.trim()) setErr($("#fZone"), $("#fZoneErr"), ""); });
far.addEventListener("change", updFar);
farBtn.addEventListener("click", e => {
  if (!farValid(true)) { e.preventDefault(); (far.querySelector(".bad") || far).focus(); }
});
[cita, far].forEach(f => f.addEventListener("submit", e => e.preventDefault()));
updCita(); updFar();

/* ---------- Nav y menú ---------- */
const nav = $(".nav"), menuBtn = $("#menuBtn");
addEventListener("scroll", () => nav.classList.toggle("solid", scrollY > 8), { passive: true });
function closeMenu() { nav.classList.remove("menu-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.querySelector(".sr").textContent = "Abrir menú"; }
menuBtn.addEventListener("click", () => {
  const open = !nav.classList.contains("menu-open");
  nav.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.querySelector(".sr").textContent = open ? "Cerrar menú" : "Abrir menú";
});
document.querySelectorAll("#menu a").forEach(a => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

/* ---------- Barra fija en el celular: aparece tras el hero, se oculta en la sección de cita ---------- */
const mbar = $(".mbar");
if ("IntersectionObserver" in window) {
  let pastHero = false, atCita = false;
  const upd = () => mbar.classList.toggle("show", pastHero && !atCita);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; upd(); }).observe($(".hero"));
  new IntersectionObserver(([e]) => { atCita = e.isIntersecting; upd(); }, { threshold: 0.05 }).observe($("#cita"));
}

/* ---------- Momento: las palabras de la frase se encienden con el avance dentro de su sección ---------- */
const say = $("#say");
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  say.innerHTML = say.textContent.split(" ").map(w => `<span class="w">${w}</span>`).join(" ");
  const words = [...say.querySelectorAll(".w")];
  say.classList.add("armed");
  let ticking = false;
  const paint = () => {
    ticking = false;
    const r = say.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < n));
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  paint();
}
