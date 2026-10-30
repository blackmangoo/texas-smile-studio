# Texas Smile Studio — Phase 0: Self-check & Retrospective

Date: 2026-10-29. Sources: full read of `rolex-calibre-horology` and `car-engineering-3d` (code, git history incl. fix-commit diffs, assets measured with ffprobe/SSIM/PSNR) and the Claude session transcripts for both projects.

Tags: **[C]** confirmed by code/commit/measurement/transcript, **[I]** inference from code review.

---

## 1. Environment

| Tool | Status | What it enables |
|---|---|---|
| ffmpeg / ffprobe 9.0.1 (full build) | ✅ | Frame extraction; encoders: libwebp, libaom-av1, libsvtav1 (AVIF), libjxl, x264/x265, VP9; quality metrics **libvmaf, SSIM, PSNR, XPSNR** → quality settings chosen by measurement, not by eye |
| Node 24.14, npm 10.9, pnpm 10.12 | ✅ | Vite/Next.js builds |
| Python 3.12 + Pillow, pillow-avif, NumPy, OpenCV, scikit-image | ✅ | Image pipeline, edge-masking, contact sheets, metrics |
| Playwright (Python 1.52) + cached Chromium builds | ✅ | Screenshots, console-error capture, scroll-sync checks. Node Playwright will be installed per project |
| Vercel CLI 62.5, gh 2.99, git 2.53 | ✅ | Preview deploys, repo |
| Hardware: Intel UHD 620 iGPU, 16 GB RAM, 8 threads | ⚠️ | Good proxy for a **low-end laptop** (useful for perf testing). AVIF encoding with libaom will be slow here; SVT-AV1 is faster |
| ImageMagick, cwebp, avifenc | ❌ | Not needed — ffmpeg + Pillow cover everything |
| Podman | ⚠️ binary installed, **no WSL distro → no podman machine** | Containers can't run. Not needed for a static site |
| Playwright WebKit / Firefox | ❌ not installed | Needed to approximate Safari/iOS behaviour |

**I can't:**
- Generate the Google Flow videos. You do that in Phase 2.
- Test on a real iPhone or Android device. Playwright WebKit is only an approximation. I'll give you a LAN URL so you can check on your phone.
- Run Lighthouse against a real 4G phone. I'll use Lighthouse's mobile throttling instead.

**Suggested installs:**

```bash
npx playwright install webkit firefox
```

Optional, only if you want container parity: `wsl --install -d Ubuntu`, then `podman machine init && podman machine start`.

---

## 2. Retrospective

### 2.1 What each project actually was

**Watch (`rolex-calibre-horology`)**
- Pipeline: one Google Flow video (1920×1080, 24 fps, 240 frames) → OpenCV → WebP frames, scrubbed on a canvas with GSAP ScrollTrigger and Lenis.
- Stack: Vite, React 19, Tailwind 4.
- About 21 hours, 6 commits.

**Ferrari (`car-engineering-3d`)**
- This one did **not** use video frames. It ended as real-time WebGL: a 27 MB Sketchfab GLB model, React Three Fiber, rotating as you scroll.
- It got there after abandoned attempts: procedural Three.js parts ("resolution and details are really bad"), then Spline and Framer.
- 12 commits.

Together they cover both approaches, so we know the failure modes of each.

### 2.2 Problems we ran into

#### A. File size & loading
1. **[C] Watch: the first deploy shipped 94.7 MB of frames.** That was 240 × 1920×1080 WebP at q95 (about 404 KB each), with all 240 requests fired at once behind a blocking overlay. You reported "taking forever to load" on Vercel.
2. **[C] Watch: the fix was never written into the pipeline.** Frames were re-encoded to 1280×720 q75 (20.7 MB) by a one-off inline Python snippet.
   - `extract_frames.py` still defaults to 1920/q95.
   - The local checkout sits on the pre-fix commit.
   - Rebuilding today would ship the 95 MB version again.
3. **[C] Watch: loading ignored scroll position.**
   - Frames loaded in index order, in rigid batches of 6, where each batch waited for its slowest request.
   - A newly arrived frame never redrew the canvas.
   - If you jumped ahead, you saw a stale or wrong frame, and hotspots appeared over it.
4. **[C] Ferrari: about 31.6 MB on first visit.**
   - 27 MB uncompressed GLB (587k triangles, no Draco or meshopt).
   - 2.5 MB of floor textures.
   - Audio preloaded before the user enabled sound.
   - No loading screen: `Suspense fallback={null}`, so the car just popped in.
5. **[C] Both: dead weight shipped to production.**
   - Watch: 4.8 MB of unused configurator PNGs.
   - Ferrari: 8.9 MB of unused HDRIs, an unused model, unused audio and duplicate textures.
6. **[C] Watch: the repo grew to 152 MB.** Frames were committed three times, with no LFS and no gitignore for generated assets.
7. **[C] Both: render-blocking Google Fonts** (3 families, about 15 weights) caused a font-swap reflow.

#### B. Frame / visual quality loss
8. **[C] Watch: the shipped frames were upscaled on screen.** This was the real cause of the blur.
   - 1280 px frames were drawn about 1574 CSS px wide: 1.23× upscale at DPR 1, about 2.5× on retina.
   - A commit claimed integer pixel alignment "eliminates blur". It didn't, because resolution was the bottleneck.
9. **[C] Watch: compressed four times over.** H.264 → unsharp mask (which sharpens the H.264 block artifacts) → WebP q95 → Lanczos downscale → WebP q75.
10. **[C] Watch: the video showed as a visible box.** Early frames have a lit slab with corners at around RGB(68,44,23), sitting on a `#050706` page. There was no edge mask or vignette.
11. **[I] Watch: possible BT.601/709 colour shift.** The video was untagged and decoded by OpenCV.
12. **[C] Ferrari: the environment map was removed to fix loading.** With nothing to reflect, the paint and glass looked like plastic. That is the likely root of your five or more "AI generated looking" complaints.
13. **[C] Ferrari: the canvas was locked to `dpr={1}`**, so everything looked soft on retina screens and phones.
14. **[C] Ferrari: wrong colour space on the floor's normal and roughness maps.**

#### C. Scroll sync & runtime performance
15. **[C] Both: React state updated on every scroll frame.**
    - Watch: `setScrollProgress` was called from the ScrollTrigger `onUpdate`.
    - Ferrari: the 10 → 60 FPS fix from day 1 (removing per-frame `setState`) was **undone** in the final code.
    - Ferrari's own design doc said "no React state in the scroll hot path".
16. **[C] Watch: the main thread did extra work during scroll.**
    - No `decode()` or `createImageBitmap`, so each first-time `drawImage` decoded the frame synchronously while scrolling.
    - `getBoundingClientRect` was called and the canvas resized inside every draw.
17. **[I] Watch: decoded-memory risk on iOS.** It kept 240 decoded 720p images alive (about 885 MB in theory) with no cap or eviction.
18. **[I] Watch: double smoothing.** Lenis (1.2 s) plus `scrub: 0.8` likely made scrolling feel floaty or laggy.
19. **[C] Watch: the last frame was only reached at exactly p = 1** (`Math.floor`).
20. **[C] Watch: the manifest was ignored.** Scroll length was hardcoded (`+=350%`) instead of derived from the frame count.
21. **[C] Ferrari: camera moves didn't line up with the text.** The camera switched at fixed fractions of the total scroll, not at section boundaries.
22. **[C] Ferrari: the 3D scene was drawn about 4× per frame.** That's the shadow pass on all 85 meshes, ContactShadows, the transmission pass on the headlights and the main pass. There were also material leaks and shader recompiles on every paint change.
23. **[C] Ferrari: frame-rate-dependent smoothing and per-frame allocations.** The `lerp(delta*k)` smoothing behaves differently at different frame rates, and a `new Vector3` was allocated every frame.
24. **[C] Watch: native `scrollIntoView` fought with Lenis.** The configurator also probed image URLs at runtime, which hung on Vercel. Fixed later.

#### D. Mobile
25. **[C] Neither project had a mobile asset tier.** No smaller frames or model, no DPR strategy, no quality tiers. Ferrari's `QualityGate` was written but never mounted.
26. **[I] Watch: tiny on portrait phones.** A 16:9 frame contained on a portrait phone was about 320×180 px.
27. **[C] Mobile navigation.**
    - Watch: no menu at all.
    - Ferrari: an inline `display:flex` overrode `hidden md:flex`, so all 7 links were crammed into the mobile header.
28. **[C] Watch: hover-only tooltips.** Hotspots were at fixed percentages and drifted off their targets at other aspect ratios.
29. **[I] Ferrari: likely overflow and overlap on phones.** The bottom bar likely overflowed at 375 px, the text likely sat on the car, and the iOS address bar likely triggered per-frame `setSize` jank.
30. **[I] Ferrari: OrbitControls captured the scroll wheel** in atelier mode (scroll trap).

#### E. Design & content weaknesses
31. **[C] Watch: generic AI-looking UI.**
    - You asked twice to remove the green ShieldCheck and Sparkles icons. One still shipped after a commit claiming they were removed.
    - The AI prompts were pasted into the website itself, which you rightly hated.
32. **[C] Watch: entrance animations never ran.** `animate-in` classes were used, but `tailwindcss-animate` was never installed.
33. **[C] Ferrari: visuals tuned by trial and error.** Car yaw changed 4 times, the camera 3 times and light tints 3 times, all by guessing from screenshots.
34. **[C] Both: palettes were two-tone** (black plus one accent).
35. **[C] Both: tiny low-contrast text.** Body copy was 8–12 px in muted greys, failing WCAG AA.
36. **[C] Watch: the configurator showed the wrong images** for 2 combinations, the bracelet choice never changed the image, and the form was fake (no submit).

#### F. Accessibility, SEO, legal
37. **[C] Both: accessibility.**
    - No reduced-motion handling in the code that actually ran.
    - Clickable `div`s that can't be reached by keyboard.
    - No canvas labels and no `<main>` landmark.
    - Modals without dialog semantics or a focus trap.
38. **[C] Both: SEO.** Client-only SPA with an empty `#root`, no Open Graph or meta tags, no structured data, no sitemap.
39. **[C] Both: brand and licence risk.** Rolex coronet and wordmark; Ferrari logo; an unlicensed model and audio; "official" spec claims invented by AI.

#### G. Process failures (the most expensive ones)
40. **[C] Ferrari: about 83% of `src/` was never rendered.**
    - All 154 tests covered dead code.
    - The good architecture (`ScrollRig`, `CameraRig`, `QualityGate`) was written but not wired in.
    - Commit messages saying "all tests pass" were meaningless.
41. **[C] Both: commit messages overclaimed.** "Verified 60 FPS", "zero stutter" and "resolve all overlapping" were never measured. One commit described a feature a later commit had already replaced.
42. **[C] Watch: placeholder content shipped first.** Procedurally generated frames were the first thing on screen.
43. **[C] Ferrari: about 1 hour spent looking at the wrong dev server** (a sibling folder's Vite server held port 5173). Code was then synced into a folder you'd said not to touch.
44. **[C] Both: commits carried a `Co-Authored-By: Claude` line.** Watch: all 6. Ferrari: 9 of 12. That breaks your CLAUDE.md rule.
45. **[C] Both: the docs drifted from reality.** For example, the watch README says "160 frames, WebP 90%, dual-buffer", but none of that is true.

---

## 3. DO NOT REPEAT

**Assets & pipeline**
- [ ] No hand-run, uncommitted re-encodes. **One script, one config file, reproducible**, and the build fails if frames are missing or stale.
- [ ] Never ship frames smaller than their drawn size × DPR (capped at 2). Resolution is chosen from the display math, not guessed.
- [ ] Don't stack lossy encodes. Decode the source once, with no sharpening of compression artifacts, and encode once.
- [ ] Don't pick quality by eye. Use a **VMAF/SSIM gate on worst-case frames** and report sizes per scene.
- [ ] No blocking "load everything" overlay, and no loading in index order. Load the **frames nearest the current scroll position first**, with a concurrency pool, and redraw when a frame arrives.
- [ ] Don't keep every decoded frame in memory. Cap it with an LRU window of decoded `ImageBitmap`s.
- [ ] No hard rectangle edges. Frames must dissolve into the page background (matched background colour in the prompts, plus a feathered mask).
- [ ] Explicit colour handling: tag/convert BT.709 → sRGB in ffmpeg.
- [ ] Don't commit generated frames to git. Gitignore raw and generated assets and document how to regenerate them.
- [ ] Don't ship unused assets. Run a build-time check that every file in `public/` is referenced.

**Runtime**
- [ ] **No React state in the scroll hot path.** Scroll progress goes to refs and the canvas only; React updates only when the chapter changes.
- [ ] No `getBoundingClientRect`/canvas resize inside draw calls. Resize only on a debounced `ResizeObserver`, ignoring height-only changes from the mobile address bar.
- [ ] No double smoothing. Use one smoothing layer (Lenis), with scrub tuned to match.
- [ ] Scroll length comes from the frame count and manifest, not hardcoded. Camera and scene progress map to **section boundaries**.
- [ ] No frame-rate-dependent `lerp(delta*k)`; use exponential damping. No per-frame allocations.
- [ ] No native `scrollIntoView` alongside Lenis. All programmatic scroll goes through Lenis.
- [ ] No 27 MB uncompressed models. If WebGL is used at all, it must be meshopt/Draco compressed, have an environment map and have quality tiers.

**Mobile**
- [ ] No desktop-only build. A **portrait asset tier**, a mobile menu, touch-friendly hotspots, tap targets of at least 44 px, and testing at 375/768/1440 from day 1.
- [ ] No class/inline-style conflicts like `hidden md:flex` overridden by inline styles.

**Design & content**
- [ ] No AI-looking icon clichés (shields, sparkles, neon-green ticks) and no generic glassmorphism.
- [ ] No prompts, debug counters or `console.log`s on the site.
- [ ] No body text under 16 px and no contrast failures. Text is checked against WCAG AA.
- [ ] No two-tone palettes.
- [ ] No animation classes from plugins that aren't installed. Every animation is verified in a screenshot or video.
- [ ] No fake forms. Booking must validate, submit and confirm.
- [ ] No trademarks, logos or unlicensed assets, and no invented medical claims. For example, say "clear aligners", not "Invisalign".

**Process**
- [ ] No dead architecture. Only build what's rendered, and **tests cover the code that ships**.
- [ ] No unmeasured claims in commits or reports. FPS, bytes and Lighthouse numbers are always measured.
- [ ] No placeholder content shipped as if real.
- [ ] Dev server on a **unique port** (e.g. 3020), verified to be serving this project before any visual review.
- [ ] **No AI attribution lines** in commits or PRs (your CLAUDE.md rule overrides tool defaults).
- [ ] No docs that drift. The README and pipeline docs are regenerated or verified at each phase.

---

## 4. KEEP DOING

- [x] **Canvas `drawImage` scrubbing** driven by GSAP ScrollTrigger, with Lenis on `gsap.ticker` and `lagSmoothing(0)`, and `ScrollTrigger.refresh()` after `document.fonts.ready`. This is the right core.
- [x] Progressive loading (first frame immediately, then keyframes, then the rest) plus a **nearest-loaded-frame fallback**. Upgrade it to be scroll-aware.
- [x] Frame count read from a manifest file.
- [x] Lanczos resampling, and WebP around q75 at the *right* resolution: the watch fix cut size by 78% at SSIM 0.98.
- [x] Static asset maps instead of probing URLs at runtime.
- [x] A `smoothScrollTo` helper that routes through Lenis and targets the pinned section's spacer element (`.pin-spacer`).
- [x] Ferrari's design-doc architecture: a non-reactive progress bus, `gsap.matchMedia` reduced-motion branches, a GPU quality gate, `PerformanceMonitor` + `AdaptiveDpr`, and mounting each section's scene lazily when its chapter is entered and keeping it mounted afterwards. This time we wire it in.
- [x] An asset **MANIFEST with licence, size and budget per asset**, from the Ferrari project.
- [x] Geometry and asset fixtures in tests (the technique is good; point it at real code).
- [x] Sound off until the user turns it on (if we use sound at all).
- [x] Editorial restraint you approved: hotspots appear late, no frame counters, refined serif/sans/mono type pairing, near-neutral stage colours.
- [x] Strong source video: coherent motion, stable subject, an end state that blends into the page background.
- [x] Phased delivery with approval gates (this project).
