// === Harga hardfile & landing CTA ===
// Jika kamu tahu harga resmi bulanan, isi normalPrice (IDR).
// Jika tidak tahu, set null agar banner menampilkan hanya harga JoinBareng.
const __JB_SERVICES = [
  {
    id: "netflix",
    match: /(^|\.)netflix\.com$/i,
    displayName: "Netflix",
    normalPrice: 186000,          // opsional
    joinBarengPrice: 59150,       // ✅ dari kamu
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "youtube",
    match: /(^|\.)youtube\.com$/i,
    displayName: "YouTube Premium",
    normalPrice: 79000,           // opsional
    joinBarengPrice: 36704,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "primevideo",
    match: /(^|\.)primevideo\.com$/i,
    displayName: "Prime Video",
    normalPrice: 74000,           // opsional
    joinBarengPrice: 36967,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "max",
    match: /(^|\.)max\.com$/i,
    displayName: "Max (HBO)",
    normalPrice: 149000,          // opsional
    joinBarengPrice: 44325,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "disneyhotstar",
    // Indonesia sering pakai disneyplus.com & hotstar.com
    match: /(^|\.)(disneyplus\.com|hotstar\.com)$/i,
    displayName: "Disney+ Hotstar",
    normalPrice: 119000,          // opsional
    joinBarengPrice: 51634,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "spotify",
    match: /(^|\.)spotify\.com$/i,
    displayName: "Spotify Premium",
    normalPrice: 54999,           // opsional
    joinBarengPrice: 32597,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "applemusic",
    match: /(^|\.)(music\.apple\.com|apple\.com)$/i,
    displayName: "Apple Music",
    normalPrice: null,            // tidak ditampilkan jika null
    joinBarengPrice: 26700,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "capcut",
    match: /(^|\.)capcut\.com$/i,
    displayName: "CapCut Pro",
    normalPrice: null,
    joinBarengPrice: 54067,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "canva",
    match: /(^|\.)canva\.com$/i,
    displayName: "Canva",
    normalPrice: null,
    joinBarengPrice: 87800,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "microsoft365",
    match: /(^|\.)(microsoft365\.com|office\.com|microsoft\.com)$/i,
    displayName: "Microsoft 365",
    normalPrice: null,
    joinBarengPrice: 45400,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "gramedia",
    match: /(^|\.)gramedia\.com$/i,
    displayName: "Gramedia Digital",
    normalPrice: null,
    joinBarengPrice: 34950,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "appleone",
    match: /(^|\.)(apple\.com|one\.apple\.com)$/i,
    displayName: "Apple One",
    normalPrice: null,
    joinBarengPrice: 51780,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "googleone",
    match: /(^|\.)(one\.google\.com|google\.com)$/i,
    displayName: "Google One",
    normalPrice: null,
    joinBarengPrice: 40967,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "chatgpt",
    match: /(^|\.)(chat\.openai\.com|openai\.com)$/i,
    displayName: "ChatGPT",
    normalPrice: null,
    joinBarengPrice: 45400,       // ✅
    landing: "https://joinbareng.com/id/marketplace"
  },
  {
    id: "duolingo",
    match: /(^|\.)duolingo\.com$/i,
    displayName: "Duolingo (tahunan)",
    normalPrice: null,
    joinBarengPrice: 152776,      // ✅ per tahun
    landing: "https://joinbareng.com/id/marketplace",
    billingCycle: "year"          // penanda khusus (opsional)
  }
];

// expose ke content-script
globalThis.JB_SERVICES = __JB_SERVICES;
