// content.js — JoinBareng Marker (Firefox/Chrome compatible)
// Fitur: inject banner harga, auto dark/light, SPA aware, storage fallback, Shadow DOM

(() => {
  const log = (...a) => console.log("[JB]", ...a);
  const warn = (...a) => console.warn("[JB]", ...a);

  // ===== Utils =====
  function waitForBody(maxWaitMs = 5000) {
    return new Promise((resolve) => {
      if (document.body) return resolve(document.body);
      const start = performance.now();
      const id = setInterval(() => {
        if (document.body) {
          clearInterval(id); resolve(document.body);
        } else if (performance.now() - start > maxWaitMs) {
          clearInterval(id); resolve(document.body || document.documentElement);
        }
      }, 50);
    });
  }

  function currency(v) {
    try {
      return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", maximumFractionDigits: 0
      }).format(v ?? 0);
    } catch {
      const n = Number(v || 0).toLocaleString("id-ID");
      return `Rp${n}`;
    }
  }

  // Deteksi perubahan URL di SPA
  function observeUrlChange(onChange) {
    let last = location.href;
    const mo = new MutationObserver(() => {
      const now = location.href;
      if (now !== last) { last = now; onChange(now); }
    });
    mo.observe(document, { subtree: true, childList: true });
    return () => mo.disconnect();
  }

  // Dark/light detection
  function parseRGB(s) {
    if (!s) return null;
    const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3] };
  }
  function luminance({ r, g, b }) {
    const toLin = (u) => {
      u /= 255;
      return u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
    };
    const R = toLin(r), G = toLin(g), B = toLin(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B; // 0..1
  }
  function detectTheme() {
    const prefersDark = typeof matchMedia === "function" &&
      matchMedia("(prefers-color-scheme: dark)").matches;

    const docEl = document.documentElement;
    const body = document.body;
    const csDoc = getComputedStyle(docEl);
    const csBody = body ? getComputedStyle(body) : null;

    const bgDoc = parseRGB(csDoc.backgroundColor);
    const bgBody = parseRGB(csBody?.backgroundColor);
    const bg = bgBody || bgDoc || { r: 255, g: 255, b: 255 };
    const lum = luminance(bg);

    const pageLooksDark = lum < 0.25 || docEl.classList.contains("dark") || body?.classList?.contains?.("dark");

    if (prefersDark) return "dark";
    return pageLooksDark ? "dark" : "light";
  }

  // ===== Core =====
  const host = location.hostname;
  const services = globalThis.JB_SERVICES || [];
  log("hostname:", host);
  log("services loaded:", services.map(s => s.id).join(", "));

  const matched = services.find(s => s.match.test(host));
  log("matched service:", matched?.id || "-");
  if (!matched) return;

  // storage fallback (sync -> local)
  const area = (chrome.storage && chrome.storage.sync) ? chrome.storage.sync : chrome.storage.local;

  function getSettings() {
    return new Promise((res) => {
      try {
        area.get({ jb_settings: {} }, (v) => res(v?.jb_settings || {}));
      } catch {
        res({});
      }
    });
  }

  function keyForPath() {
    return `__jb_injected_${matched.id}_${location.pathname}`;
  }

  async function injectBanner() {
    const enabledMap = await getSettings();
    const isEnabled = enabledMap[matched.id] !== false;
    if (!isEnabled) {
      log("disabled for", matched.id);
      return;
    }

    if (sessionStorage.getItem(keyForPath())) {
      log("already injected on this path");
      return;
    }

    const normal = matched.normalPrice;          // boleh null
    const jb = matched.joinBarengPrice;
    const landing = matched.landing || "https://joinbareng.com/id/marketplace";
    const isYearly = matched.billingCycle === "year";

    await waitForBody();

    // Host + Shadow
    const hostEl = document.createElement("div");
    hostEl.id = "jb-banner-host";
    Object.assign(hostEl.style, {
      position: "fixed", bottom: "20px", right: "20px", zIndex: "2147483647"
    });

    const theme = detectTheme(); // "dark" | "light"
    hostEl.setAttribute("data-theme", theme);
    log("theme:", theme);

    const shadow = hostEl.attachShadow({ mode: "open" });

    // ===== Theming via CSS variables =====
    const style = document.createElement("style");
    style.textContent = `
      :host {
        --bg: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06));
        --border: rgba(255,255,255,0.25);
        --text: #0f172a;
        --muted: rgba(15,23,42,0.7);
        --badge-from: #10b981;
        --badge-to: #34d399;
        --cta-from: #f59e0b;
        --cta-to: #fbbf24;
        --cta-text: #111827;
        --shadow: 0 8px 40px rgba(2,6,23,0.25);
      }
      :host([data-theme="dark"]) {
        --bg: linear-gradient(135deg, rgba(15,23,42,0.7), rgba(15,23,42,0.55));
        --border: rgba(255,255,255,0.08);
        --text: #e5e7eb;
        --muted: rgba(229,231,235,0.75);
        --badge-from: #22c55e;
        --badge-to: #16a34a;
        --cta-from: #f59e0b;
        --cta-to: #fbbf24;
        --cta-text: #111827;
        --shadow: 0 12px 50px rgba(0,0,0,0.45);
      }

      .jb-card {
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--text);
        border-radius: 14px;
        box-shadow: var(--shadow);
        padding: 14px 16px;
        min-width: 270px;
        max-width: 360px;
        transition: transform .25s ease, opacity .25s ease;
        transform: translateY(10px);
        opacity: 0;
      }
      .jb-card.show { transform: translateY(0); opacity: 1; }

      .jb-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
      .jb-badge {
        font-size: 12px; font-weight: 800;
        padding: 4px 8px; border-radius: 999px;
        background: linear-gradient(135deg, var(--badge-from), var(--badge-to));
        color: #ffffff;
      }
      .jb-title { font-weight: 800; font-size: 14px; color: var(--text); }

      .jb-prices { margin-top: 4px; font-size: 13px; line-height: 1.35; color: var(--text); }
      .strike { opacity: .7; text-decoration: line-through; }
      .jb-subtle { color: var(--muted); }

      .jb-cta {
        margin-top: 10px;
        display: inline-block;
        padding: 9px 12px;
        font-weight: 800;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--cta-from), var(--cta-to));
        color: var(--cta-text);
        text-decoration: none;
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
      }
      .jb-cta:hover { filter: brightness(0.97); }

      .jb-close {
        position: absolute; top: 6px; right: 8px; cursor: pointer;
        font-size: 16px; line-height: 16px; opacity: .75; color: var(--text);
      }
      .jb-close:hover { opacity: 1; }

      .jb-foot { margin-top: 6px; font-size: 11px; opacity: .75; color: var(--muted); }
    `;

    // copywriting & price lines
    let headerBadge = "Hemat Lebih Irit";
    let headerTitle = `${matched.displayName} — JoinBareng`;

    let priceLines = "";
    if (typeof normal === "number" && typeof jb === "number" && normal > jb) {
      const save = normal - jb;
      const savePct = Math.round((save / normal) * 100);
      headerBadge = `Hemat ${savePct}%`;
      priceLines = `
        <div class="jb-subtle">Harga resmi: <span class="strike">${currency(normal)}${isYearly ? "/thn" : "/bln"}</span></div>
        <div><strong>JoinBareng: ${currency(jb)}${isYearly ? "/thn" : "/bln"}</strong> — selisih ${currency(save)}${isYearly ? "/thn" : "/bln"}</div>
      `;
    } else if (typeof jb === "number") {
      priceLines = `<div><strong>JoinBareng: ${currency(jb)}${isYearly ? "/thn" : "/bln"}</strong></div>`;
    } else {
      // fallback: hanya tampil nama & CTA jika data tidak lengkap
      priceLines = `<div class="jb-subtle">Cek paket hemat di JoinBareng.</div>`;
    }

    const wrap = document.createElement("div");
    wrap.className = "jb-card";
    wrap.innerHTML = `
      <div class="jb-close" title="Tutup">✕</div>
      <div class="jb-head">
        <span class="jb-badge">${headerBadge}</span>
        <div class="jb-title">${headerTitle}</div>
      </div>
      <div class="jb-prices">${priceLines}</div>
      <a class="jb-cta" href="${landing}" target="_blank" rel="noopener noreferrer">
        Lihat paket di JoinBareng
      </a>
      <div class="jb-foot">Patungan legal, aman, tetap full fitur.</div>
    `;

    wrap.querySelector(".jb-close")?.addEventListener("click", () => {
      wrap.classList.remove("show");
      setTimeout(() => hostEl.remove(), 180);
    });

    shadow.appendChild(style);
    shadow.appendChild(wrap);
    document.documentElement.appendChild(hostEl);

    requestAnimationFrame(() => wrap.classList.add("show"));

    // auto-hide 25s
    setTimeout(() => {
      if (!wrap.isConnected) return;
      wrap.classList.remove("show");
      setTimeout(() => hostEl.remove(), 180);
    }, 25000);

    sessionStorage.setItem(keyForPath(), "1");
    log("banner injected ✅");
  }

  // Inject pertama kali
  injectBanner().catch(err => warn("inject error:", err));

  // Re-inject saat SPA route berubah
  observeUrlChange(() => {
    sessionStorage.removeItem(keyForPath());
    injectBanner().catch(err => warn("re-inject error:", err));
  });
})();
