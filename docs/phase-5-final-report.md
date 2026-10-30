# Texas Smile Studio — Phase 5: Final QA & Engineering Report

**Date:** 2026-10-30  
**Project Root:** `C:\learning\websites\texas-smile-studio`  
**Automated QA Runner:** [tools/phase5_full_qa.py](../tools/phase5_full_qa.py)  
**Machine-Verified QA Output:** [docs/phase-5-qa/qa-report.json](phase-5-qa/qa-report.json)

---

## 1. Executive Summary & Comparison Against Previous Projects

| Metric / Engineering Gate | Project 1: Watch (`rolex-calibre-horology`) | Project 2: Ferrari (`car-engineering-3d`) | Project 3: **Texas Smile Studio** (This Build) |
|---|---|---|---|
| **Rendering & SEO** | Client-only SPA (`<div id="root"></div>`), 0 JSON-LD | Client-only SPA (`<div id="root"></div>`), 0 JSON-LD | **Next.js 15 Prerendered Static HTML**, OpenGraph, `robots.txt`, `sitemap.xml`, `Dentist` + `FAQPage` JSON-LD |
| **First-Load JS Bundle** | `132.9 KB` gzip (`414.5 KB` raw, no splitting) | `333 KB` gzip (`1,225 KB` raw) | **`189 KB` First Load JS** (`86.4 KB` route bundle) |
| **Desktop Sequence Size** | `94.71 MB` (v1) → `20.70 MB` (720p upscaled blur) | `27.01 MB` uncompressed GLB (`31.6 MB` initial) | **Native `1920×1080` (`10.64 + 6.09 + 14.71 = 31.44 MB` across 3 scenes, lazy-loaded per section)** |
| **Mobile Sequence Tier** | None (loaded desktop frames; tiny `320×180` box) | None (`587k` tris on mobile, broken header) | **Dedicated `960×720` (`4:3`) Mobile Tier (`3.68 + 1.89 + 3.40 = 8.97 MB` total; `0` desktop leaks)** |
| **Canvas-to-Page Seam** | Visible rectangle (`RGB 68,44,23` on `#050706`) | Flat plastic look (HDRI removed) | **Zero visible box** (quadratic border normalization + `#0A1C24` border-text crop + 360° elliptical radial feather on Chromium-calibrated `#135865`, `#E6DFD1`, `#010304`) |
| **Scroll Hot-Path State** | `setScrollProgress` every tick (60 Hz React re-render) | `setScrollProgress` every tick (60 Hz React re-render) | **Imperative ref-driven canvas scrub (`0` per-frame React re-renders; React updates only on discrete Act change)** |
| **Reduced Motion (`prefers-reduced-motion`)** | None | CSS transitions only; WebGL still spun | **Full OS `prefers-reduced-motion: reduce` support** (disables Lenis & scroll-pinning, exposes accessible `Stage 1 / 2 / 3` switcher) |
| **Form / Conversion** | Fake commission form (no submit, no validation) | No conversion form | **Working 3-step HIPAA-safe scheduler** (`POST /api/bookings`, shared client/server Zod schema, honeypot + IP rate limit, confirmation code `TSS-XXXXXX`) |
| **Dead Code / Unused Assets** | `4.76 MB` unused PNGs + dead modal | `~83%` of `src/` unrendered + `8.9 MB` unused assets | **`0` unused files in `public/`, `0` unrendered components, `0` `TODO`/`console.log` in `src/`** |

---

## 2. Bugs Caught & Fixed During Phase 5 Multi-Viewport QA

Every defect below was discovered by inspecting Playwright renders across `1440×900`, `768×1024`, `390×844`, `375×812`, and `prefers-reduced-motion: reduce`, then fixed and re-verified:

1. **Mobile (`390×844`) & Tablet (`768×1024`) Hero Card Overlap:**
   - *Symptom:* On initial build, the absolute-positioned 3D dental arch overlapped the `01 / FULL-ARCH HARMONY` card on screens `< 1024px`, and the mobile navbar wrapped `Texas Smile Studio` onto two lines.
   - *Fix:* Converted the 3D stage wrapper into a single responsive node (`in-flow` dedicated height on `< 1024px`, `lg:absolute lg:inset-0` on desktop) and compacted the mobile header (`Book ↗` pill on `< 640px`).
2. **Mobile Pinned Viewport Clipping on Scene 02 & Scene 03 (`390×844`):**
   - *Symptom:* Stacking all 3 Act cards vertically inside a `pin: true` container made Scene 02 and Scene 03 `~1,150px` tall on an `844px` phone screen, pushing the top of the 3D canvas behind the fixed `80px` header.
   - *Fix:* Added `pt-22` navbar clearance and responsive active-act card display (`ACT 01 / 02 / 03` compact tab bar + active card on `< 1024px`; full 3-card stack on `lg+`), bringing total pinned height inside `100svh` (`844px`) with zero clipping.
3. **Reduced-Motion Pointer Interception & Grid Column Drift (`1440×900`):**
   - *Symptom:* In `prefers-reduced-motion: reduce`, the stage switcher at `bottom-4` sat behind the `<h1>` row inside a `pointer-events-none` parent, and removing the middle spacer shifted the right Act card into columns `5..8`.
   - *Fix:* Locked the right Act card with `lg:col-start-9`, moved `pointer-events-none` strictly onto `<canvas>`, and placed the `pointer-events-auto` Reduced-Motion stage bar cleanly at `top-3`.
4. **Mobile Tier Asset Isolation (`BeforeAfterAndDoctorsSection.tsx` & `ScrollSequenceStage.tsx`):**
   - *Symptom:* Automated network tracking caught 2 desktop `1920×1080` WebP images loading on mobile from the Before/After comparator and Frame 0 preloading before `IntersectionObserver` entry.
   - *Fix:* Wrapped the Before/After images in `<picture>` with `<source media="(max-width: 767px)">` pointing to the mobile tier + `loading="lazy"`, and gated Frame 0 behind `IntersectionObserver` (`rootMargin: "125% 0px"`), achieving **`0` desktop frames loaded on mobile** and **`0` Scene 03 requests on initial Hero load**.

---

## 3. Final Automated QA Scorecard (`qa-report.json`)

- **Runtime Cleanliness:** `0` console errors · `0` uncaught page errors · `0` failed `4xx/5xx` asset requests
- **Cumulative Layout Shift (CLS):** **`0.0136`** (Target `< 0.10` — Good)
- **Desktop (`1440×900` @ 2× DPR) Real Scroll-Scrub Sync:**
  - `scene-01-hero`: **PASS** (`3/3` distinct canvas frame hashes across `0% → 50% → 95%`)
  - `scene-02-implant`: **PASS** (`3/3` distinct canvas frame hashes across `0% → 50% → 95%`)
  - `scene-03-scan-whitening`: **PASS** (`3/3` distinct canvas frame hashes across `0% → 50% → 95%`)
- **Tablet (`768×1024` @ 2× DPR):** **PASS** (`horizontal_overflow: false`, all 3 scenes scrub cleanly)
- **Mobile (`390×844` @ 2× DPR & `375×812`):** **PASS** (`horizontal_overflow: false` at both `390px` & `375px`, mobile drawer opens & closes on `Escape`, `desktop_frames_loaded_on_mobile: 0`, all 3 scenes scrub cleanly)
- **Accessibility & Keyboard:**
  - Single `<h1>`, `<main>` landmark, skip-to-content link, `Dentist` + `FAQPage` JSON-LD schemas
  - Before/After comparator keyboard `ArrowRight` × 2 moves `aria-valuenow` `52 → 62`: **PASS**
  - FAQ accordion `aria-expanded` toggle: **PASS**
  - OS `prefers-reduced-motion: reduce` stage controls visible & functional: **PASS**
- **Booking API & Security (`POST /api/bookings`, `GET /api/health`):**
  - Health check `200 OK`: **PASS**
  - Valid booking `201 Created` (`TSS-311F90`): **PASS**
  - Malformed email `400 Bad Request` (Zod): **PASS**
  - Honeypot bot fill `400 Bad Request`: **PASS**

---

## 4. What Remains Before Production Clinical Launch

1. **Real Clinical Content Swap (TSBDE & FTC Compliance):**
   - Replace the 3 clearly marked `[Placeholder Profile]` doctor entries in `src/data/clinicData.ts` with your real Dallas clinicians' names, portraits, degrees, and Texas Dental Board license numbers.
   - Replace the Before/After 3D optical simulation frames with real, written-consent patient photography.
   - Connect your live Google Business Profile reviews in place of the 3 labeled review placeholders, and verify exact street suite number, phone number, and hours.
2. **Production Credentials (`.env.local` / Vercel Environment Variables):**
   - Add `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (with an `appointment_requests` table having RLS enabled) and `RESEND_API_KEY` + `CLINIC_NOTIFICATION_EMAIL` so bookings write to PostgreSQL and notify the front desk by email in addition to returning the confirmation code.
3. **Optional Future Enhancements:**
   - **Real Physical Phone Pass:** Open `http://<your-LAN-IP>:3020` on a physical iPhone (Safari) and Android phone (Chrome) to feel touch scroll-scrub inertia firsthand.
   - **CDN Immutable Caching Headers:** When deploying to Vercel, add `Cache-Control: public, max-age=31536000, immutable` on `/frames/*` in `next.config.mjs` so repeat visits load all 3D sequences in `0 ms` from browser disk cache.
