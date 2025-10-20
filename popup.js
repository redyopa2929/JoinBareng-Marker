// popup.js — JoinBareng Marker (Firefox/Chrome compatible)
// Fitur: daftar layanan + toggle per layanan, simpan ke storage (sync -> local fallback)

const listEl = document.getElementById("list");
const saveBtn = document.getElementById("saveBtn");

// Pilih storage area (sync bila ada, fallback ke local)
const area = (chrome.storage && chrome.storage.sync) ? chrome.storage.sync : chrome.storage.local;

function render(services, enabledMap) {
  listEl.innerHTML = "";
  services.forEach(s => {
    const row = document.createElement("div");
    row.className = "row";

    const left = document.createElement("div");
    left.className = "name";
    left.textContent = s.displayName;

    const right = document.createElement("div");
    const input = document.createElement("input");
    input.type = "checkbox";
    // default ON (true) — yang disimpan hanya OFF
    input.checked = enabledMap[s.id] !== false;
    input.dataset.sid = s.id;
    right.appendChild(input);

    row.appendChild(left);
    row.appendChild(right);
    listEl.appendChild(row);
  });
}

async function load() {
  const settings = await new Promise(res => {
    try {
      area.get({ jb_settings: {} }, res);
    } catch {
      res({ jb_settings: {} });
    }
  });
  const enabledMap = settings?.jb_settings || {};
  // JB_SERVICES diexpose dari services.js (dimuat di popup.html sebelum popup.js)
  render(globalThis.JB_SERVICES || [], enabledMap);
}

saveBtn.addEventListener("click", async () => {
  const inputs = listEl.querySelectorAll("input[type=checkbox][data-sid]");
  const map = {};
  inputs.forEach(i => {
    const id = i.dataset.sid;
    if (!i.checked) map[id] = false; // simpan hanya yang OFF
  });

  await new Promise(res => {
    try {
      area.set({ jb_settings: map }, res);
    } catch {
      res();
    }
  });

  saveBtn.textContent = "Tersimpan ✓";
  setTimeout(() => (saveBtn.textContent = "Simpan"), 1200);
});

// Inisialisasi
load();
