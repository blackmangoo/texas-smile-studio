# Texas Smile Studio — Phase 3: Forensic Video Analysis, Border Cleanup & Asset Pipeline Report

**Script:** [tools/build_frame_sequences.py](../tools/build_frame_sequences.py)  
**Generated Manifest:** [public/frames/manifest.json](../public/frames/manifest.json)  
**Visual Seam Proof:** [docs/video-audit/seam-proof.png](video-audit/seam-proof.png)

---

## 1. Forensic Analysis of the 3 Raw Videos

All 3 input MP4s (`1920×1080`, H.264 `yuv420p`, `24 fps`, `239 frames` / `9.96s`, tagged `smpte170m / iec61966-2-1 / bt709`) were inspected frame-by-frame:

| Scene | Source File | What We Found in Raw Frames | How the Pipeline Fixes It |
|---|---|---|---|
| **01 — Hero** (`scene-01-hero.mp4`) | `Dental_arch_commercial_film_e94a9473_1080p.mp4` (`3.07 MB`) | Consistent Deep Lagoon outer border (`#145664` raw / `#135865` Chromium-decoded) with a circular cyan-teal studio spotlight (`#3E98A8`) centered behind the dental arch. Because `1080px` height is narrower than `1920px` width, the circular spotlight reaches `#307781` at top-center (`y=0`) and bottom-center (`y=1080`), which would create a visible horizontal clip line if drawn unmasked. Also, in frames `180..238`, the bottom tip of the titanium implant reaches `y ≈ 1048`. | 1. Background-color-gated border lock (`\|\|rgb - #145664\|\| < 32`) snaps outer background pixels without ever touching the titanium implant threads.<br>2. Pairs the `<canvas>` with a 360° elliptical radial mask (`radial-gradient(49% 49% at 50% 50%, #000 66%, rgba(0,0,0,0.55) 83%, transparent 98%)`) over exact CSS `#135865`. |
| **02 — Implant** (`scene-02-implant.mp4`) | `Dental_implant_assembly_macro_film_4a8159f1_1080p.mp4` (`2.21 MB`) | Frames `0..165` (`0.0s–6.9s`) have a warm stone-porcelain outer border (`#E7DFD2`) with a soft warm-ivory center spotlight (`#F7F3EB`). In frames `170..238` (`7.1s–9.96s`), the background brightens from `#E7DFD2` to `#F2EEE8` (`+11 RGB` drift), which would cause the background to shift mid-scroll. | Fits a 2D quadratic surface (`1, x, y, r²`) to the outer `52px` border of each frame and normalizes the background field back to Frame 0's exact `#E7DFD2` field across all 239 frames while leaving the central teeth and titanium implant 100% untouched. Decodes in Chromium to exact `#E6DFD1` from Frame 1 to Frame 180. |
| **03 — Scan & Whitening** (`scene-03-scan-whitening.mp4`) | `Dental_scan_and_aligner_film_0356f6d3_1080p.mp4` (`4.51 MB`) | Contains an outer `#091A1E` passepartout border frame (`x < 242` / `146`, `x > 1677` / `1773`, `y < 43` / `107`, `y > 1035` / `971`) with unwanted **`#0A1C24` text printed on all four margins** (top `y=37..61`, bottom `y=1013..1037`, left `x=52..74`, right `x=1846..1869`), plus a visible inner rectangle step around the dark stage (`#020506`). | 1. Masks out the `#091A1E` passepartout border and all `#0A1C24` text on all 4 sides while preserving the bright cyan laser lines (`G > 50, B - R > 25`) in `0.0s–3.3s`.<br>2. Crops the clean `16:9` inner stage (`x=[160..1760], y=[90..990]`, `1600×900` → `1920×1080` Lanczos) with zero tooth clipping.<br>3. Locks the outer border to `#020506`, which decodes in Chromium to exact `#010304`. |

---

## 2. Calibrated Website Section Backgrounds (Derived from the Videos)

To guarantee a zero-step blend between each canvas sequence and its surrounding section:

| Scene | Section Theme | Exact Chromium CSS Section Background Hex | Center Studio Spotlight Hex | Canvas Radial Feather Mask |
|---|---|---|---|---|
| **Scene 01 (Hero)** | Deep Lagoon Studio | **`#135865`** (`RGB 19, 88, 101`) | `#3E98A8` (`RGB 62, 152, 168`) | `radial-gradient(49% 49% at 50% 50%, #000 66%, rgba(0,0,0,0.55) 83%, transparent 98%)` |
| **Scene 02 (Implant)** | Warm Stone Porcelain | **`#E6DFD1`** (`RGB 230, 223, 209`) | `#F7F3EB` (`RGB 247, 243, 235`) | `radial-gradient(49% 49% at 50% 50%, #000 68%, rgba(0,0,0,0.55) 84%, transparent 98%)` |
| **Scene 03 (Scan & Whitening)** | Deep Obsidian Midnight | **`#010304`** (`RGB 1, 3, 4`) | `#092C36` (`RGB 9, 44, 54`) | `radial-gradient(50% 49% at 50% 50%, #000 72%, rgba(0,0,0,0.5) 86%, transparent 98%)` |

---

## 3. WebP Quality Benchmark & Final Sequence Sizes

We benchmarked `quality = 78, 82, 86, 90, 92` across all 3 scenes using `PSNR` and `SSIM`.
- **Desktop selected setting:** `1920×1080` (full native 1080p, zero downscaling), `180 frames`, WebP `quality = 86` (`PSNR 44.37–47.07 dB`, `SSIM 0.9808–0.9924` — visually indistinguishable from lossless PNG).
- **Mobile selected setting:** `960×720` (`4:3` portrait-friendly framing — 50% taller on mobile screens than `16:9` while covering `390–430 CSS px × DPR 2` without upscaling), `120 frames`, WebP `quality = 82`.

| Scene | Desktop (`1920×1080`, 180f, q86) | Desktop Avg / Frame | Desktop PSNR / SSIM | Mobile (`960×720`, 120f, q82) | Mobile Avg / Frame |
|---|---|---|---|---|---|
| **`scene-01-hero`** | **10.64 MB** | `60.5 KB` | `44.89 dB` / `0.9896` | **3.68 MB** | `31.4 KB` |
| **`scene-02-implant`** | **6.09 MB** | `34.7 KB` | `47.07 dB` / `0.9924` | **1.89 MB** | `16.2 KB` |
| **`scene-03-scan-whitening`** | **14.71 MB** | `83.7 KB` | `44.37 dB` / `0.9808` | **3.40 MB** | `29.0 KB` |
| **TOTAL (All 3 Scenes)** | **31.44 MB** (vs. 94.71 MB for 1 scene in Watch v1) | `59.6 KB` | `45.44 dB` / `0.9876` | **8.97 MB** (all 3 scenes combined) | `25.5 KB` |

### How Preloading & Section Lazy-Loading Works in Phase 4
- **On initial page load:** Only Scene 01's poster (`~62 KB`) + 18 keyframe stride frames (`~1.05 MB`) load immediately so the Hero is interactive in `< 0.5s`, while the remaining Scene 01 frames stream in a scroll-priority concurrency pool (`maxConcurrency = 6`).
- **Per-section lazy loading (`IntersectionObserver` with `rootMargin: "120% 0px"`):** Scene 02 (`6.09 MB` desktop / `1.89 MB` mobile) and Scene 03 (`14.71 MB` desktop / `3.40 MB` mobile) only begin fetching their frame sequences when the visitor scrolls within 1.2 viewports of that section.
- **Decoded memory cap:** Decoded `ImageBitmap` objects are managed in a windowed cache around the current scroll frame so mobile Safari never exceeds memory limits.
- **Re-running the pipeline:**
  ```bash
  python tools/build_frame_sequences.py --desktop-frames 180 --mobile-frames 120
  ```
