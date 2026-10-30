# Texas Smile Studio — 3D Scroll-Animated Architectural Dental Studio (Dallas, TX)

Next-generation scroll-driven 3D website for **Texas Smile Studio** in Uptown Dallas, engineered with Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, GSAP ScrollTrigger, Lenis smooth scrolling, a custom scroll-priority Canvas 2D frame-scrubbing engine, and a Zod-validated HIPAA-safe appointment booking API.

---

## Key Architectural Highlights

1. **Zero-Seam Video-to-Section Calibration:**
   - **`scene-01-hero`** (*Full 28-Tooth Arch & Restorative Articulation*): Calibrated Deep Lagoon `#135865` (`RGB 19, 88, 101`) + 360° elliptical radial spotlight feather.
   - **`scene-02-implant`** (*Grade-5 Titanium Implant, 18k Gold Abutment & Porcelain Crown*): Temporal quadratic border normalization across all frames, locked to Warm Stone Porcelain `#E6DFD1` (`RGB 230, 223, 209`).
   - **`scene-03-scan-whitening`** (*60-Second Optical Scan, Clear Aligner Seating & B1 Pearl Whitening*): Automated border-text removal (`#0A1C24` margins cropped and masked while preserving cyan structured-light laser beams), locked to Deep Obsidian Midnight `#010304` (`RGB 1, 3, 4`).
2. **High-Sharpness Dual-Tier Frame Sequences (`public/frames/manifest.json`):**
   - **Desktop (`1920×1080` WebP `q=86`):** `180 frames/scene` (`PSNR 44.37–47.07 dB`, `SSIM 0.9808–0.9924`), displayed inside split/contained stages (`≤ 960 CSS px` on 2× retina) so frames are **never upscaled**.
   - **Mobile (`960×720` `4:3` WebP `q=82`):** `120 frames/scene` (`8.97 MB` total across all 3 scenes), giving 50% taller framing on portrait phones with zero clipping.
3. **Zero React State in the Scroll Hot Path:**
   - GSAP ScrollTrigger drives canvas frame indices imperatively via refs; React state only updates on discrete chapter boundary transitions (`Act 01`, `Act 02`, `Act 03`).
   - Scroll-priority concurrency pool (`6 workers` desktop / `4 workers` mobile) loads frames closest to the visitor's current scroll position and redraws immediately upon `img.decode()`.
   - Full `prefers-reduced-motion: reduce` support with accessible keyframe tabs.
4. **HIPAA-Safe Appointment Booking API (`POST /api/bookings` & `GET /api/health`):**
   - Shared client/server **Zod** schema (`src/lib/bookingSchema.ts`), honeypot bot rejection, IP rate limiting, local JSON ledger (`.data/bookings.json`), plus ready-to-activate **Supabase** + **Resend** connectors via `.env.local`.

---

## Commands

```bash
# Start local development server on dedicated port 3020
npm run dev
```

```bash
# Type-check & build production static + dynamic routes
npm run lint
npm run build
```

```bash
# Regenerate all Desktop (1920x1080) & Mobile (960x720) WebP sequences from assets/raw/*.mp4
npm run frames
```

```bash
# Run automated Playwright Desktop / Tablet / Mobile + Booking E2E verification
python tools/qa_verify.py
```
