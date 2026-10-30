# Texas Smile Studio — Phase 1: Concept & Design Debate

**Brief (confirmed):** Texas Smile Studio, Dallas TX. English only. Six services: implants, braces/aligners, whitening, root canal, pediatric, cosmetic. Tone: **premium and calm**.

**Visual reference:** [phase-1-board.html](phase-1-board.html), rendered to [phase-1-board.png](phase-1-board.png).

---

## 0. Constraints that shape every option

These come from the Phase 0 lessons and from how dental patients behave.

1. **Dental anxiety is the main emotional barrier.** Up to a third of adults avoid the dentist out of fear. Visuals that feel clinical, cold or "inside the mouth" make bookings drop. The design's first job is to lower the visitor's heart rate. Its second job is to prove competence.

2. **Source resolution limits layout.** Google Flow exports 1080p, plus a 4K upscale on some plans.
   - A 1920 px frame stays sharp (no upscaling) only up to 960 CSS px wide on a 2× retina screen.
   - So, with a 1080p source, scrubbed scenes must sit in **split or contained layouts** (about 55–65% of the viewport width on desktop), not full-bleed.
   - Full-bleed is only allowed for scenes we get in 4K.
   - This rule prevents the watch-project blur bug.

3. **Healthcare advertising rules.**
   - The Texas State Board of Dental Examiners and the FTC regulate this.
   - The FTC's 2024 fake-review rule bans invented testimonials.
   - Before/after images must be real, consented patient photos. **No AI-generated "results".**
   - Only real doctor credentials can be shown.
   - We build these sections with clearly marked placeholders that you replace with real content.

4. **HIPAA.** The booking form must not collect medical history. It takes name, contact details, preferred time and a reason category only. Anything clinical happens at the clinic.

5. **No trademarks.** Write "clear aligners", not Invisalign®. Don't use brand names for scanners or lasers.

---

## 1. Three creative directions

### Direction A: "Porcelain Light" (editorial calm, light-first)

**Concept.** The site feels like a quiet, sunlit Dallas studio at golden hour. The visual hero is one sculptural porcelain tooth, rendered as a beautiful object (like a ceramic or museum piece), never as anatomy. Scenes are product films of that object: it forms, a crown floats into place, an aligner glides on, a glow sweeps across it.

**Emotional arc.**
- **Dawn (calm):** warm light. The tooth forms out of soft light.
- **Descent (precision):** the page sinks into deep lagoon and then midnight for the technology chapter, with scans, light and exact detail.
- **Rise (warmth):** back to warm light for people, kids and results.
- **Golden hour (commitment):** a warm blush-honey wash around booking.

Light → depth → light. The colour transition *is* the story.

**Pros**
- It looks like nothing else in the category, where competitors use stock-photo blue or neon dark tech.
- The calm tone fits the brief directly.
- The light base gives the best text readability.
- Product-film scenes are the kind of footage Flow produces most reliably: one subject, a studio, a slow camera.

**Cons**
- A light background is unforgiving. Any video background that doesn't match the page shows as a box (watch-project bug #10). The fix is to specify the exact background colour in every prompt, plus a feathered canvas mask.
- It needs restraint to avoid looking bland. The rich accents and the midnight chapter carry the "pop".

**Risk:** low to medium. The main risk is matching video backgrounds, which can be fixed in the pipeline.

**Performance cost:** low. Canvas frame sequences only, no WebGL. Light scenes compress well because they have big smooth gradients.

### Direction B: "Clinical Futurism" (dark-first, holographic lab)

**Concept.** A dark interface with aqua holograms, X-ray style scans, wireframe teeth and HUD readouts. Think Apple product page meets a sci-fi medical bay.

**Arc:** it starts dark, scans are revealed, and it stays dark throughout, which is high impact.

**Pros**
- Immediate "wow".
- Glow colours really pop on dark.
- Dark backgrounds hide the video frame edges easily.

**Cons**
- **It works against "calm".** Dark, clinical, X-ray imagery raises anxiety in exactly the patients we want.
- It reads as "AI generated" and repeats the look of the two earlier projects, which you criticised.
- Dark-mode healthcare sites tend to convert worse with older and family audiences.
- Pediatric content clashes with it badly.
- Dark gradients in video show banding and compression artefacts more, which pushes the quality settings, and so file size, up.

**Risk:** high, both for brand fit and for visible compression.

**Performance cost:** medium. Higher bitrate is needed to hide banding.

### Direction C: "Real-time Atelier" (interactive WebGL tooth)

**Concept.** A live Three.js tooth and jaw model that the visitor rotates. Scroll explodes it into layers (enamel, dentin, pulp, implant post) and morphs between treatments.

**Pros**
- True interactivity.
- Unlimited camera angles.
- Sharp at any resolution.
- No video asset pipeline.

**Cons**
- **This is the Ferrari project again.** Real-time materials only look premium with a licensed, high-quality model, proper environment lighting, tuned PBR materials and quality tiers. Without them we got "looks AI generated" and "not like a real car".
- A licensed, anatomically good dental model has to be found or paid for.
- Payload and battery cost on phones.
- Much more engineering for a less cinematic result than filmed scenes.

**Risk:** high. This is the failure we already know.

**Performance cost:** high on mobile. It needs Draco or meshopt compression, an environment map and adaptive quality from day one.

### Debate summary

| | A: Porcelain Light | B: Clinical Futurism | C: Real-time Atelier |
|---|---|---|---|
| Fits "premium calm" | ★★★★★ | ★★ | ★★★ |
| Visual "pop" | ★★★★ (via accents and the midnight chapter) | ★★★★★ | ★★★ |
| Trust and conversion for dental patients | ★★★★★ | ★★ | ★★★ |
| Fits Flow video generation | ★★★★★ | ★★★★ | n/a |
| Avoids past mistakes | ★★★★ | ★★ (repeats the dark tech look) | ★ (repeats Ferrari) |
| Mobile performance | ★★★★ | ★★★ | ★★ |
| Build risk | Low–medium | Medium–high | High |

### ✅ Recommendation: Direction A, "Porcelain Light"

It takes Direction B's strength in one place: the **midnight technology chapter**, where glow is allowed. That gives the site its moment of contrast and drama without making the whole experience feel clinical.

C's interactivity is replaced by cheap, robust interactions in the DOM:
- a draggable before/after slider
- service cards with depth on hover
- magnetic buttons
- a clickable treatment timeline

---

## 2. Storytelling arc (top to bottom)

| # | Beat | Visitor should feel | Light / colour |
|---|---|---|---|
| 1 | **Hero: "Calm, precise dentistry in Dallas."** A porcelain tooth forms out of soft light as you scroll. | Exhale. "This is different." | Dawn: blush to porcelain to seafoam wash |
| 2 | **Philosophy: "Unhurried by design."** Three promises: no rush, no surprises (transparent pricing), no pain-first approach. | Reassured | Porcelain |
| 3 | **Services:** six treatments. Each card has its own short scrubbed scene or ambient loop. | "They do everything I need" | Porcelain and ivory cards with accent tags |
| 4 | **Descent → Technology:** the page sinks into midnight. Intraoral scan light sweep, CBCT-style layers, guided-implant precision. | Confidence, awe | Descent gradient into midnight, aqua glow |
| 5 | **Whitening glow → rise:** a pearl-white glow sweeps the tooth and the page lightens back up. | Uplift | Midnight to pearl to porcelain |
| 6 | **Smile transformations:** before/after slider (real consented photos). | Proof | Ivory |
| 7 | **Doctors:** portraits, credentials, one human sentence each. | Trust in people | Porcelain, champagne details |
| 8 | **Kids & family:** the pediatric band. Warmer and playful, still calm. | "My kids would be okay here" | Honey and coral wash |
| 9 | **Testimonials:** real Google reviews with rating and count. | Social proof | Porcelain |
| 10 | **Insurance & financing + FAQ** *(recommended addition)* | Barriers removed | Ivory |
| 11 | **Booking:** a 3-step booking form. | Easy commitment | Golden hour: blush to honey wash |
| 12 | **Contact & footer:** map, hours, phone, parking, accessibility notes. | Practical | Midnight footer (bookends the tech chapter) |

**Why an FAQ and an insurance section?**
- Insurance and cost are the top reasons people don't book.
- The FAQ gives us `FAQPage` structured data, which is a direct SEO win for searches like "dentist Dallas".

---

## 3. Colour system

The colour roles follow a 60-30-10 split: 60% foundation, 30% primary and secondary, 10% accents. Glow colours are limited to the midnight chapter. Every text pairing was checked with a WCAG contrast calculator.

### Foundation (60%)
| Name | Hex | Used for | Contrast |
|---|---|---|---|
| Porcelain | `#F6F3EE` | Page background (a warm off-white, never sterile pure white) | n/a |
| Ivory | `#FFFDFA` | Cards, form surfaces, raised panels | n/a |
| Hairline | `#E6E0D6` | Borders, dividers | n/a |
| Ink | `#13232C` | Headings and body text | 14.5:1 on Porcelain (AAA) |
| Slate | `#4B5D66` | Secondary text, captions | 6.2:1 (AA) |

### Primary and secondary (30%)
| Name | Hex | Used for | Contrast |
|---|---|---|---|
| **Lagoon** (primary) | `#0F5F6E` | Brand colour, main buttons, links, active states, emphasised headline words | White on Lagoon 7.3:1 (AAA); Lagoon text on Porcelain 6.6:1 |
| Deep Lagoon | `#0B3A45` | Middle of the descent gradient, hover state for main buttons | n/a |
| **Midnight** (secondary) | `#0A1C24` | Technology chapter background, footer | n/a |

### Accents (10%)
| Name | Hex | Used for | Rule |
|---|---|---|---|
| Champagne | `#C8A26B` | Fine lines, large stat numbers, premium details | Text only on dark backgrounds (7.3:1 on Midnight); on light backgrounds use Bronze for text |
| Bronze | `#8A6631` | Champagne's text version on light backgrounds (eyebrow labels, "Same-day crowns" tag) | 4.7:1 (AA) |
| Coral | `#EE8A6F` | Warmth: pediatric highlights, decorative dots, the hero blush. Never as text on light | Used as a fill; Ink on Coral 6.5:1 |
| Terracotta | `#A84A33` | Coral's text version: tags, form error messages | 5.1:1 (AA) |
| Seafoam | `#8CCBC3` | Calm tags, aligner scene tint, the cool end of the hero wash | Ink on Seafoam 8.8:1 |
| Blush | `#F7E4D8` | The warm end of the dawn and golden-hour washes, pediatric chips | n/a |
| Honey | `#F2C38B` | **Pediatric section only**, so the kids' band feels distinct but related | Ink on Honey 9.9:1 |

### Glow (midnight chapter only)
| Name | Hex | Used for |
|---|---|---|
| Aqua Glow | `#63E6D9` | Scan light lines, focus rings on dark, small labels (11.5:1) |
| Pearl | `#EAF7FA` | Headings on dark, centre of the whitening glow |
| Mist | `#9FB7BE` | Body text on dark (8.3:1) |

### Gradients
| Name | Definition | Where |
|---|---|---|
| Dawn | `160deg, #F7E4D8 → #F6F3EE 45% → #DCEFEC` | Hero background and wash behind the hero canvas |
| Descent | `180deg, #F6F3EE → #0F5F6E 45% → #0B3A45 70% → #0A1C24` | Scroll-linked transition into technology |
| Whitening sweep | `radial, Pearl 95% → Aqua 35% → Midnight` | Glow behind the whitening scene, and the rise back to light |
| Golden hour | `Blush → Honey 40% opacity → Porcelain` | Booking section |
| Champagne line | `90deg, #8A6631 → #C8A26B → #8A6631` | 1 px rules, the active step in the booking progress bar |

**Glow and shadow tokens**
- Card shadow: `0 30px 60px -30px rgba(15,95,110,.25)`. A long shadow tinted lagoon, never grey-black.
- Scene halo: a radial aqua at 28% opacity, used only on midnight.
- Focus ring: 2 px Lagoon on light backgrounds, 2 px Aqua on dark.

**Rules**
- Accents never appear as large fills except in Honey's pediatric band.
- At most two accents per viewport.
- No neon. Aqua glow is the brightest colour and lives only on midnight.

---

## 4. Typography, spacing, components

### Type
**Display: Fraunces** (open licence, variable font).
- A soft optical-size serif. Its `SOFT` axis rounds the letter terminals, so it reads warm and caring, not cold-luxury.
- Both earlier projects used Cormorant. Fraunces keeps them visually separate.

**Body: Instrument Sans** (open licence, variable font).
- Modern and slightly humanist. Very readable at 17–18 px.

**No monospace "tech" font.** Both previous sites used JetBrains Mono, which is part of the "AI template" look. Numbers in the tech chapter use Fraunces lining figures in Champagne.

**Loading:** both fonts are self-hosted through `next/font`, subset, preloaded and use matched fallback metrics. This fixes the render-blocking Google Fonts and the reflow from Phase 0.

**Fluid size scale:**

| Style | Size |
|---|---|
| Display | `clamp(44px, 6vw, 88px)` with -2% letter spacing |
| H2 | `clamp(34px, 4vw, 56px)` |
| H3 | 24–28 px |
| Body | 17–18 px, line height 1.6, 60–72 characters per line |
| Small | **15 px minimum** |
| Eyebrow labels | 13 px, uppercase, +14% letter spacing, Bronze or Slate (labels only, never body text) |

### Spacing and layout
- 8 pt grid.
- Section padding `clamp(96px, 12vw, 192px)`.
- 12-column grid with a 1280 px max width; scenes may break out of it.
- Desktop scene layout follows the resolution rule in §0.2: a split with the scene at about 58% width and text at about 42%, alternating sides between sections.
- Mobile: the scene sits above, the text card scrolls over it, and the scene uses portrait-safe framing.

### Components
| Component | Style |
|---|---|
| Buttons | Pill-shaped, 52 px tall (touch target ≥ 44 px). Primary is solid Lagoon; secondary is a 1.5 px Ink outline. A subtle magnetic pull on hover (desktop only), and press scales to 0.98. |
| Cards | Ivory background, 24 px corner radius, Hairline border, lagoon-tinted long shadow. On hover they lift 4 px and tilt in 3D (±3°, desktop only). |
| Tags | Pill-shaped, tinted background with the accent's text version (Lagoon on `#DCEFEC`, Terracotta on Blush, Bronze on `#F3EBDD`). |
| Icons | **A custom set of six line icons** (one per service), 1.5 px stroke, drawn as SVG, with a draw-on animation when they enter view. No lucide shields, sparkles or ticks. |
| Before/after | A draggable slider with a keyboard-controllable handle (`role="slider"`, arrow keys). |
| Booking | A 3-step form (treatment → time → details) with a progress bar in the champagne line style, inline validation and a confirmation screen. |

### Things deliberately not used
Glassmorphism, neon, gradient text, emoji, stock "smiling family" photos, and parallax on every element.

---

## 5. Pinned vs. inline scenes (a key design decision)

Phase 2 will have 6–10 scenes. **If every one is a long pinned scrub, the page becomes tiring**: the visitor scrolls through 3,000 px per section and loses track of where they are.

**Proposal:**
- **3 hero-grade pinned scrubs:**
  - Hero (tooth forming)
  - Technology (scan sweep, in midnight)
  - Whitening glow (the rise back to light)
  These run 150–250% of the viewport height each.
- **4–6 short scenes** that scrub while their section passes through the viewport, with no pinning. These are the service micro-scenes (aligner, implant, crown, root-canal glow, pediatric).
- **On mobile and with reduced motion:**
  - Short scenes become a single poster image or a short muted loop.
  - Pinned scenes keep scrubbing, with fewer frames on mobile.
  - With reduced motion turned on, pinned scenes jump between three keyframe images instead of scrubbing.

---

## 6. Tech stack (debated)

| Decision | Options | Choice | Why |
|---|---|---|---|
| Framework | Vite + React (used in both previous projects) vs **Next.js 15 App Router** vs Astro | **Next.js**, static-first, deployed on Vercel | Both previous sites were client-rendered single-page apps with an empty page for search engines. Next gives fully rendered HTML, a metadata API, OG images, a sitemap, `Dentist` and `FAQPage` structured data, `next/font`, `next/image`, and a server route for booking, all in one deploy. Astro would also be excellent for static pages, but the booking flow and the React interaction components fit Next more naturally. |
| Scroll | Native vs **Lenis** | **Lenis 1.x**, driven by `gsap.ticker` with `lagSmoothing(0)` | Proven in the watch project. One smoothing layer only, with a small scrub value. All programmatic scrolling goes through Lenis. |
| Animation | GSAP vs Framer Motion vs both | **GSAP + ScrollTrigger only** (via `@gsap/react` `useGSAP`) | One animation engine, not two. `gsap.matchMedia` gives clean branches for reduced motion and mobile. GSAP plugins are now all free. |
| Scenes | `<video>` scrub vs **canvas frame sequence** vs WebGL | **Canvas 2D frame sequence** with an `ImageBitmap` cache | Scrubbing a `<video>` element with `currentTime` stutters (keyframe seeking) and has Safari quirks. Frame sequences give exact sync. The format (AVIF vs WebP) and resolution are decided by measurement in Phase 3. |
| Three.js | Use it vs not | **Not in v1** | Nothing in Direction A needs real-time 3D. The "3D feel" comes from filmed scenes plus CSS 3D transforms. That avoids about 250 KB gzipped of runtime JS and the Ferrari failure modes. We'll reconsider only if a later scene truly needs interactivity. |
| Styling | **Tailwind CSS v4** with design tokens as CSS variables | ✓ | The palette above becomes `@theme` tokens, so there are no stray hex values. Animations come from GSAP, not plugin classes (fixes the watch bug #32). |
| Scroll state | React state vs **a ref-based progress bus** | ✓ ref-based bus | Scroll never causes a React re-render. React updates only when the active chapter changes. |
| Booking backend | Email via Resend · Supabase table · embed (Calendly, NexHealth, a practice-management system) | **Decision needed from you (see §8)** | For all options: Zod validation on both client and server, a honeypot field, IP-based rate limiting, and no clinical data collected. |
| Testing | Vitest for logic, **Playwright** for E2E and screenshots, Lighthouse CI | ✓ | Tests cover only code that actually ships. |
| Budgets (enforced in CI) | | Initial JS ≤ 120 KB gzipped · LCP ≤ 2.0 s on mobile 4G · CLS = 0 · first scene poster ≤ 120 KB · per-scene budgets set in Phase 3 | |

---

## 7. What's in it for each past mistake

| Past mistake | How this plan prevents it |
|---|---|
| Blurry, upscaled frames | Layout is derived from source resolution (§0.2). Full-bleed only for 4K. |
| Visible video box | Exact background hex values in every Flow prompt (Phase 2), plus a feathered canvas mask. |
| Search engines saw an empty single-page app | Pages are rendered as full HTML in advance by Next.js, with structured data. |
| Two-tone palette | 18 tokens across 4 tiers, all contrast-checked. |
| AI clichés | Custom icons, no mono font, no glass or neon, no invented reviews or results. |
| Fake forms | A working, validated booking flow. |
| Dark tech look repeated | Light-first. Midnight is a single chapter. |
| WebGL realism failure | No WebGL in v1. |

---

## 8. Decisions I need from you

1. **Approve Direction A, "Porcelain Light"**, or pick B, C or a mix.
2. **Booking destination.** My recommendation is option (a), because it's real, free at this volume and needs no third party.
   - **(a)** Our own form → Next server route → save to a Supabase table and send an email notification to the clinic through Resend. Needs your Resend and Supabase keys. The clinic confirms bookings manually.
   - **(b)** Email notification only (Resend), no database.
   - **(c)** Embed an existing scheduler if the clinic uses one (NexHealth, Zocdoc, Calendly).
3. **Real content.** Do you have real doctor names, photos and credentials, before/after photos, Google reviews, address and neighbourhood (e.g. Uptown, Preston Hollow, Plano), phone number and hours? If not, I'll build with **clearly labelled placeholders**. I won't use fabricated testimonials or AI-generated "results" (FTC rules and Texas dental advertising rules).
4. **Optional sections.** Keep "Insurance & financing" and "FAQ"? I recommend yes.
5. **Flow resolution.** Does your Flow plan offer a 4K upscale? If yes, the hero and technology scenes can go full-bleed. If not, we keep the split layouts.
