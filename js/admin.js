/* ============================================================
   ADMIN DASHBOARD — renders an edit form from window.__CONTENT__
   (set by functions/admin.js) and saves back to PUT /api/content.
   ============================================================ */

const content = window.__CONTENT__;

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function set(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] == null) cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---- schema describing every editable field, grouped into sections ----
const SCHEMA = [
  { title: "Hero", fields: [
    { path: "hero.eyebrow", label: "Eyebrow tag", type: "text" },
    { path: "hero.heading", label: "Heading", type: "text" },
    { path: "hero.highlight", label: "Highlighted word/phrase (must appear in heading, shown in teal)", type: "text" },
    { path: "hero.lede", label: "Subheading paragraph", type: "textarea" },
    { path: "hero.ticketTitle", label: "Ticket card title", type: "text" },
    { path: "hero.ticketNumber", label: "Ticket card number", type: "text" },
    { path: "hero.ticketStamp", label: "Ticket card stamp text", type: "text" },
    { path: "hero.ticketPriceLabel", label: "Ticket price label", type: "text" },
    { path: "hero.ticketPrice", label: "Ticket price value", type: "text" }
  ]},
  { title: "Hero stats", repeat: { path: "hero.stats", fields: [
    { key: "value", label: "Value", type: "text" },
    { key: "label", label: "Label", type: "text" }
  ]}},
  { title: "Pricing section intro", fields: [
    { path: "pricing.eyebrow", label: "Eyebrow tag", type: "text" },
    { path: "pricing.heading", label: "Heading", type: "text" },
    { path: "pricing.body", label: "Description", type: "textarea" }
  ]},
  { title: "What's included in every detail", fields: [
    { path: "detailIncludes", label: "One item per line", type: "list" }
  ]},
  { title: "Vehicle sizes & pricing", repeat: { path: "vehicleSizes", fields: [
    { key: "name", label: "Name", type: "text" },
    { key: "examples", label: "Examples", type: "text" },
    { key: "price", label: "Price ($)", type: "number" },
    { key: "duration", label: "Duration (minutes)", type: "number" }
  ]}},
  { title: "Add-ons section intro", fields: [
    { path: "addonsSection.eyebrow", label: "Eyebrow tag", type: "text" },
    { path: "addonsSection.heading", label: "Heading", type: "text" },
    { path: "addonsSection.body", label: "Description", type: "textarea" }
  ]},
  { title: "Add-ons", repeat: { path: "addons", fields: [
    { key: "name", label: "Name", type: "text" },
    { key: "desc", label: "Description", type: "text" },
    { key: "price", label: "Price ($)", type: "number" }
  ]}},
  { title: "Photo banner", fields: [
    { path: "photoBand.eyebrow", label: "Eyebrow tag", type: "text" },
    { path: "photoBand.heading", label: "Heading", type: "text" },
    { path: "photoBand.body", label: "Description", type: "textarea" }
  ]},
  { title: "Gallery", fields: [
    { path: "gallery.eyebrow", label: "Eyebrow tag", type: "text" },
    { path: "gallery.heading", label: "Heading", type: "text" },
    { path: "gallery.body", label: "Description", type: "textarea" },
    { path: "gallery.captions", label: "Photo captions — one per line, same order as the gallery photos", type: "list" }
  ]},
  { title: "Why us", fields: [
    { path: "why.eyebrow", label: "Eyebrow tag", type: "text" },
    { path: "why.heading", label: "Heading", type: "text" },
    { path: "why.items", label: "Bullet points — one per line", type: "list" }
  ]},
  { title: "Ready-to-book banner", fields: [
    { path: "cta.heading", label: "Heading", type: "text" },
    { path: "cta.body", label: "Description", type: "textarea" }
  ]},
  { title: "Footer", fields: [
    { path: "footer.tagline", label: "Tagline", type: "textarea" },
    { path: "footer.email", label: "Contact email", type: "text" },
    { path: "footer.serviceArea", label: "Service area lines — one per line", type: "list" },
    { path: "footer.hours", label: "Hours — one per line", type: "list" }
  ]},
  { title: "Booking page intro", fields: [
    { path: "booking.eyebrow", label: "Eyebrow tag", type: "text" },
    { path: "booking.heading", label: "Heading", type: "text" },
    { path: "booking.body", label: "Description", type: "textarea" }
  ]}
];

function fieldHtml(path, label, type, value) {
  const id = `f_${path.replace(/\./g, "_")}`;
  if (type === "textarea") {
    return `<label class="admin-field" for="${id}"><span>${esc(label)}</span>
      <textarea id="${id}" data-path="${path}" rows="3">${esc(value ?? "")}</textarea></label>`;
  }
  if (type === "list") {
    const text = Array.isArray(value) ? value.join("\n") : "";
    return `<label class="admin-field" for="${id}"><span>${esc(label)}</span>
      <textarea id="${id}" data-path="${path}" data-list="1" rows="4">${esc(text)}</textarea></label>`;
  }
  if (type === "number") {
    return `<label class="admin-field admin-field-sm" for="${id}"><span>${esc(label)}</span>
      <input id="${id}" data-path="${path}" type="number" value="${esc(value ?? 0)}"></label>`;
  }
  return `<label class="admin-field" for="${id}"><span>${esc(label)}</span>
    <input id="${id}" data-path="${path}" type="text" value="${esc(value ?? "")}"></label>`;
}

function renderSection(section) {
  if (section.repeat) {
    const items = get(content, section.repeat.path) || [];
    const groups = items.map((item, i) => `
      <fieldset class="admin-repeat-item">
        <legend>${esc(item.name || item.label || `Item ${i + 1}`)}</legend>
        <div class="admin-field-grid">
          ${section.repeat.fields.map(f => fieldHtml(`${section.repeat.path}.${i}.${f.key}`, f.label, f.type, item[f.key])).join("")}
        </div>
      </fieldset>`).join("");
    return `<section class="admin-section"><h2>${esc(section.title)}</h2>${groups}</section>`;
  }
  return `<section class="admin-section"><h2>${esc(section.title)}</h2>
    <div class="admin-field-grid">
      ${section.fields.map(f => fieldHtml(f.path, f.label, f.type, get(content, f.path))).join("")}
    </div>
  </section>`;
}

const form = document.getElementById("contentForm");
form.innerHTML = SCHEMA.map(renderSection).join("") +
  `<div class="admin-save-bar"><button class="btn btn-primary" type="submit">Save changes</button></div>`;

const working = JSON.parse(JSON.stringify(content));

form.addEventListener("input", e => {
  const el = e.target;
  const path = el.dataset.path;
  if (!path) return;
  if (el.dataset.list) {
    set(working, path, el.value.split("\n").map(s => s.trim()).filter(Boolean));
  } else if (el.type === "number") {
    set(working, path, Number(el.value) || 0);
  } else {
    set(working, path, el.value);
  }
});

const status = document.getElementById("saveStatus");

form.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  status.textContent = "Saving…";
  try {
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(working)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Save failed.");
    status.textContent = `Saved ✓ ${new Date().toLocaleTimeString()}`;
  } catch (err) {
    status.textContent = `⚠ ${err.message}`;
  } finally {
    btn.disabled = false;
  }
});
