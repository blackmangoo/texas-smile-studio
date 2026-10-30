# Texas Smile Studio — Phase 2 (Revised): Reference Analysis & Ultra-Realistic Master Prompts

**Reference Analyzed:** `Oralxe` Hero Screenshot (`1.png`) + `rolex-calibre-horology/PROMPTS_GOOGLE_WHISK_FLOW.md`  
**Strategy Shift:** **Quality over Quantity** — **3 Flagship 10-Second Master Sequences** (Start Keyframe + End Keyframe + Time-Coded 10s Video Prompt), engineered with real prosthodontic anatomy, wet-enamel optical physics, Hasselblad macro studio lighting, and exact perimeter hex matching.

---

## 1. Forensic Analysis: Why the `Oralxe` Reference Works vs. Why the Previous Prompts Failed

### A. What makes the `Oralxe` screenshot look real and high-end
1. **Full Anatomical Subject, Not an Abstract Blob:** The centerpiece is a **complete, hyper-realistic upper and lower human dental arch (28–32 teeth with sculpted, high-gloss studio gingiva)** occupying ~45% of the viewport width dead-center. Every tooth has real anatomical morphology: central and lateral incisors, canines, premolars, and molars with accurate cervical margins, interproximal embrasures, developmental grooves, and subtle vertical perikymata surface texture.
2. **Wet Specular Enamel + Subsurface Scattering (SSS):** Real teeth are not matte chalk. In the reference, the labial surfaces have **crisp, wet-gloss studio softbox window reflections** layered over **translucent hydroxyapatite enamel** that lets warm dentin show through the body while the incisal edges stay slightly opalescent blue-white.
3. **High-Gloss Prosthodontic Gingiva:** The gums are rendered like a **master dental laboratory acrylic/silicone study model** — mirror-polished, sculpted festooned contours with sharp studio highlights, giving strong color contrast against the pearlescent white teeth without looking gory or surgical.
4. **Radial Studio Spotlight Backdrop (Not Dead-Flat Paint):** Behind the dental arch is a **soft radial studio spotlight** (brighter in the center behind the teeth, smoothly graduating to a deeper solid tone at the outer edges). That radial light falloff is what convinces the human eye the 3D object sits in a real physical studio.
5. **Editorial Grid Around the Centerpiece:** The 3D model sits centered while typography frames the four corners (top nav, left value prop + pill button, bottom-left bold display headline, bottom-right caption), followed by a crisp white 4-column clinical metrics strip below the fold.

### B. Why my previous prompts produced simple, unrealistic videos in Flow
1. **Forbidding anatomy ("abstract ceramic sculpture, no gums, single tooth")** stripped away the exact visual cues Veo relies on to render realistic dental refraction, leaving a generic white shape.
2. **Asking for a "flat shadowless void with zero lighting falloff"** forced the video model to turn off studio key-light gradients and specular softbox reflections, making the object look flat and pasted-on.
3. **9 short prompts instead of 3 deep, time-coded master sequences:** In the Rolex project (`PROMPTS_GOOGLE_WHISK_FLOW.md`), realism came from **dense 250–300 word prompts** specifying exact materials, camera optics (`Hasselblad H6D-100c, 85mm–100mm f/4 macro`), a **Start Frame + End Frame**, and **4 time-coded motion beats (`[0.0s–2.5s]`, `[2.5s–5.5s]`, `[5.5s–8.5s]`, `[8.5s–10.0s]`)**.

---

## 2. How We Solve Seamless Background Blending WITHOUT Killing Studio Realism

To get **both** the realistic studio depth of the `Oralxe` screenshot **and** a 100% invisible blend into the website:
1. **Center Spotlight + Exact Perimeter Hex Lock:** Each prompt specifies a **soft studio spotlight glow directly behind the teeth** that smoothly settles into a **locked, uniform solid hex color across the outer 18% perimeter of the 16:9 frame**:
   - **Sequence 01 (Hero Masterpiece):** Center warm radial glow (`#177A8C`) graduating smoothly into exact **Lagoon `#0F5F6E` (`RGB 15, 95, 110`)** on all outer edges (giving the exact bold, high-contrast full-bleed stage of the `Oralxe` reference, in our calm luxury Lagoon palette — plus an optional Coral-Rose `#9E2A3B` variant if you want the exact red-rose studio stage from the screenshot).
   - **Sequence 02 (Implant & Crown Macro Deconstruction):** Center warm ivory spotlight (`#FFFDFA`) settling into exact **Warm Porcelain `#F6F3EE` (`RGB 246, 243, 238`)** on all outer edges.
   - **Sequence 03 (3D Optical Laser Scan, Aligner & Whitening Sweep):** Center deep teal spotlight (`#123847`) settling into exact **Midnight `#0A1C24` (`RGB 10, 28, 36`)** on all outer edges.
2. **Matching CSS Radial Stage + Phase 3 Outer Alpha Feather:** The website section background uses the exact same `radial-gradient(...)` ending in `#0F5F6E` / `#F6F3EE` / `#0A1C24`, and our Phase 3 script feathers the outer 8% of every frame to `alpha = 0` so the video edge dissolves invisibly into the page.

---

## 3. The 3 Flagship Master Sequences (Quality Over Quantity)

| # | Filename | Role on Website | Scroll Runway | Outer Perimeter Hex Lock | Center Studio Spotlight |
|---|---|---|---|---|---|
| **01** | `scene-01-hero.mp4` | **Hero Masterpiece (Oralxe-Style Full Arch → Precision Deconstruction)** | Pinned `320vh` | **Lagoon `#0F5F6E`** (`RGB 15, 95, 110`) | Soft Teal-Pearl Halo (`#177A8C`) |
| **02** | `scene-02-implant.mp4` | **Services Flagship (Macro Implant, Gold Abutment & Veneer/Crown Assembly)** | Pinned `260vh` | **Porcelain `#F6F3EE`** (`RGB 246, 243, 238`) | Soft Warm Ivory Studio Key (`#FFFDFA`) |
| **03** | `scene-03-scan-whitening.mp4` | **Technology & Whitening Flagship (3D Laser Scan + Clear Aligner + Enamel Radiance)** | Pinned `260vh` | **Midnight `#0A1C24`** (`RGB 10, 28, 36`) | Deep Lagoon Studio Halo (`#0B3A45`) |

---

## SEQUENCE 01 — `scene-01-hero.mp4`
### "The Architectural Smile: Full Dental Arch & Precision Restoration"
- **Section:** Hero (`"DENTAL CARE ENGINEERED FOR CALM PRECISION"`) — directly inspired by the `Oralxe` reference composition, upgraded with scroll-driven mechanical articulation.
- **Website Outer Background Hex:** **`#0F5F6E` (`RGB 15, 95, 110` — Deep Lagoon)** with center spotlight **`#177A8C` (`RGB 23, 122, 140`)**.

#### PART 1A — Start Frame Prompt (For Google Whisk / Flow Start Keyframe)
```text
Hyper-realistic commercial macro studio product photography of a complete, anatomically accurate human upper and lower dental arch (28 pristine adult teeth set in sculpted, mirror-polished coral-rose prosthodontic gingiva), suspended weightlessly at the exact center of the frame in a front-facing symmetrical hero composition. The upper and lower teeth are gently parted by 6 millimeters in a relaxed natural occlusion. Every tooth exhibits true anatomical morphology: maxillary central and lateral incisors with delicate vertical perikymata micro-texture, natural developmental lobes, and semi-translucent opalescent blue-white incisal edges (#EAF7FA); sculpted canines and premolars; and first and second molars with crisp cuspal ridges. The enamel surface has a realistic wet-gloss studio finish with sharp dual-softbox window specular reflections and physical subsurface scattering revealing warm ivory dentin (#FFFDFA) beneath translucent hydroxyapatite enamel. The sculpted gingival cuffs feature realistic festooned architecture and clean, glossy studio specular highlights — like a $15,000 Swiss master prosthodontic showcase model, completely clean, dry-studio aesthetic, zero saliva strings, zero blood, zero instruments.

CAMERA & OPTICS:
Shot on Hasselblad H6D-100c medium format camera, HC Macro 120mm f/4 II lens at f/8 for deep edge-to-edge sharpness across the entire dental curve, ISO 64, studio strobe key light + overhead strip softbox + subtle warm champagne (#C8A26B) rim light grazing the molar cusps.

BACKGROUND COLOR LOCK (CRITICAL):
The dental arch floats in an infinite seamless studio cyclorama with no floor plane and no stand. Directly behind the center of the dental arch is a soft circular studio spotlight glow in muted Lagoon Teal (#177A8C, RGB 23, 122, 140) that transitions smoothly and evenly outward into a completely uniform, solid matte Deep Lagoon Teal with exact hex code #0F5F6E (RGB 15, 95, 110) across the entire outer 20% border of the 16:9 frame. Zero dark black vignette in the corners, zero horizon line, zero text, zero watermarks, 8k photorealistic editorial render.
```

#### PART 1B — End Frame Prompt (For Google Whisk / Flow End Keyframe)
```text
Extreme macro exploded prosthodontic engineering photograph of the same hyper-realistic upper and lower human dental arch rotated 25 degrees into a commanding three-quarter hero perspective, suspended in micro-gravity. The jaws are articulated smoothly open by 22 millimeters, showcasing precision restorative dental engineering levitating in mid-air along clean architectural axes:
(1) Hovering 12 millimeters above the upper anterior teeth is a crystal-clear, thermoformed optical polymer aligner shell catching razor-sharp turquoise-seafoam (#8CCBC3) and white softbox edge refractions;
(2) Floating 10 millimeters forward along the Z-axis in front of the two upper central incisors are two paper-thin (0.3mm), semi-translucent lithium-disilicate porcelain laminate veneers (#FFFDFA) glowing with warm champagne (#C8A26B) backlight through their translucent incisal edges;
(3) On the lower right first molar site, the sculpted porcelain molar crown levitates 14 millimeters upward, revealing a precision-machined Grade-5 titanium helical dental implant fixture and a mirror-beveled 18k champagne-gold (#C8A26B) hexagonal prosthetic abutment seated cleanly in the gingival socket below.
Every enamel surface, titanium thread, gold bevel, and clear polymer edge renders with physical ray-traced accuracy and wet-gloss studio specular highlights.

CAMERA & OPTICS:
Hasselblad H6D-100c, 120mm f/4 Macro lens at f/8, razor-sharp focus across all levitating components, studio softbox reflections.

BACKGROUND COLOR LOCK (CRITICAL):
Infinite seamless studio cyclorama with no floor or horizon. A soft central spotlight glow in #177A8C (RGB 23, 122, 140) directly behind the arch, graduating smoothly into a completely uniform, solid matte Deep Lagoon Teal with exact hex code #0F5F6E (RGB 15, 95, 110) across the entire outer 20% border on all four sides of the 16:9 frame. Zero dark corner vignette, no text, no UI labels, 8k photorealistic render.
```

#### PART 1C — Ready-to-Paste 10-Second Google Flow Video Prompt (`scene-01-hero.mp4`)
```text
A smooth, majestic 10-second cinematic macro commercial product film in 16:9 aspect ratio, 24fps, interpolating with physical mechanical precision between a closed hyper-realistic full human dental arch (28 wet-gloss porcelain-enamel teeth in sculpted glossy coral-rose prosthodontic gingiva) and its three-quarter exploded restorative engineering view.

[0.0s - 2.5s]: The complete, symmetrical upper and lower dental arch floats weightlessly at the center of the frame. Studio softbox light glides across the wet-gloss translucent enamel incisors (#FFFDFA) and glossy sculpted gingiva as the camera begins a slow, damped 25-degree orbital push-in toward a three-quarter hero angle.

[2.5s - 5.5s]: Smooth, zero-gravity prosthodontic articulation begins without any digital morphing or warping. The upper and lower arches gently hinge open by 22 millimeters in slow motion. Simultaneously, a crystal-clear thermoformed optical polymer aligner tray cleanly elevates 12 millimeters upward off the upper arch, catching crisp seafoam (#8CCBC3) and white studio edge refractions.

[5.5s - 8.5s]: Two paper-thin 0.3mm translucent porcelain laminate veneers (#FFFDFA) glide smoothly forward along the Z-axis from the upper central incisors, backlit by a warm champagne-gold (#C8A26B) rim light that reveals their delicate opalescent incisal translucency. On the lower molar site, the ceramic molar crown elevates vertically in micro-gravity, unveiling the precision-machined Grade-5 silver-titanium helical implant threads and mirror-polished 18k champagne-gold (#C8A26B) hexagonal abutment beneath.

[8.5s - 10.0s]: All levitating components — the articulated dental arches, floating clear aligner shell, twin porcelain veneers, and titanium-gold implant assembly — settle into poised architectural suspension in mid-air as a final specular light sweep travels across the enamel cusps.

OPTICS & PHYSICS:
Shot on Hasselblad H6D-100c with 120mm f/4 macro lens, physically accurate subsurface scattering in hydroxyapatite enamel, crisp metallic reflections on titanium and gold, rigid-body mechanical kinematics, zero rubbery deformation, zero morphing artifacts.

BACKGROUND COLOR LOCK (CRITICAL):
The entire scene is set in an infinite shadowless studio cyclorama with NO floor plane, NO stand, and NO horizon line. Directly behind the centered dental arch is a soft circular studio spotlight glow (#177A8C, RGB 23, 122, 140) that blends smoothly into a completely uniform, solid matte Deep Lagoon Teal with exact hex code #0F5F6E (RGB 15, 95, 110) covering the entire outer 20% border of the 16:9 frame from start to finish. Zero black corner vignette, zero text, zero watermarks, zero logos.
```

> **Note if you prefer the exact Coral-Rose Backdrop from the `Oralxe` screenshot for Sequence 01:** Simply swap `#177A8C` → `#C84B59 (RGB 200, 75, 89)` for the center spotlight and `#0F5F6E` → `#9E2A3B (RGB 158, 42, 59)` for the outer perimeter hex lock. Our pipeline supports either one automatically.

---

## SEQUENCE 02 — `scene-02-implant.mp4`
### "Horological Prosthodontics: Titanium Implant, Gold Abutment & Porcelain Crown"
- **Section:** Services & Craftsmanship Chapter (Covers Implants, Cosmetic Veneers/Crowns, and Restorative Root/Core Precision in one ultra-detailed macro sequence).
- **Website Outer Background Hex:** **`#F6F3EE` (`RGB 246, 243, 238` — Warm Porcelain)** with center spotlight **`#FFFDFA` (`RGB 255, 253, 250` — Warm Ivory)**.

#### PART 2A — Start Frame Prompt (Google Whisk / Flow Start Keyframe)
```text
Extreme macro engineering photograph of a deconstructed, vertically aligned Swiss-precision dental implant and porcelain molar crown assembly levitating in mid-air at the center of the frame, flanked slightly out-of-focus by two adjacent pristine anatomical porcelain premolar teeth that establish real dental scale. Along the central vertical axis, four hyper-detailed components float in exploded suspension:
(1) At the bottom, a CNC-machined Grade-5 Ti-6Al-4V medical titanium endosseous implant fixture featuring razor-sharp double-lead helical macro-threads, micro-grooved laser-etched collar, and internal conical connection;
(2) Above it, a mirror-beveled 18k champagne-gold (#C8A26B) anatomic titanium-base prosthetic abutment with precision anti-rotation hex facets;
(3) Above the abutment, a tiny satin-finished titanium prosthetic retaining screw;
(4) At the top, a hand-layered, high-translucency lithium-disilicate porcelain molar crown (#FFFDFA) with realistic anatomical occlusal fissures, warm cervical dentin gradation, opalescent enamel cusps, and wet-gloss studio softbox reflections.
Shot on Hasselblad H6D-100c, 120mm f/4 macro lens, high-horology commercial product lighting, razor-sharp focus on metal threads and ceramic translucency.

BACKGROUND COLOR LOCK (CRITICAL):
Infinite studio cyclorama with no floor or pedestal. Center behind the assembly has a soft warm-ivory studio key glow (#FFFDFA, RGB 255, 253, 250) that transitions seamlessly into a completely uniform, flat matte Warm Porcelain with exact hex code #F6F3EE (RGB 246, 243, 238) across the entire outer 20% border on all four sides of the 16:9 frame. Zero corner darkening, zero vignette, zero text, 8k photorealistic render.
```

#### PART 2B — End Frame Prompt (Google Whisk / Flow End Keyframe)
```text
Extreme macro commercial studio photograph of the fully assembled, seamlessly locked dental implant and porcelain molar crown unit suspended in mid-air at the center of the frame between the two adjacent anatomical premolar crowns. The multilayered porcelain molar crown (#FFFDFA) is seated flush onto the 18k champagne-gold (#C8A26B) abutment collar and Grade-5 titanium helical implant post below, forming a single continuous biomechanical structure. A delicate hairline specular reflection of Lagoon Teal (#0F5F6E) and warm Champagne Gold (#C8A26B) catches the precision micro-junction where the porcelain margin meets the polished gold collar. Wet-gloss studio softbox highlights gleam across the anatomical occlusal cusps. Shot on Hasselblad H6D-100c, 120mm f/4 Macro lens.

BACKGROUND COLOR LOCK (CRITICAL):
Infinite studio cyclorama, no floor, no horizon. Soft center studio glow (#FFFDFA) graduating smoothly into a completely uniform, solid matte Warm Porcelain with exact hex code #F6F3EE (RGB 246, 243, 238) across the entire outer 20% border of the 16:9 frame. Zero corner vignette, no text, 8k photorealistic render.
```

#### PART 2C — Ready-to-Paste 10-Second Google Flow Video Prompt (`scene-02-implant.mp4`)
```text
A smooth, 10-second extreme-macro commercial engineering film in 16:9 aspect ratio, 24fps, capturing the watchmaking-level assembly of a four-part luxury dental implant and translucent porcelain molar crown in mid-air.

[0.0s - 2.5s]: Four deconstructed components float in vertical alignment at the center of the frame: a CNC-machined Grade-5 silver-titanium helical implant fixture at the base, a mirror-beveled 18k champagne-gold (#C8A26B) hex abutment in the middle, a precision retaining screw, and a translucent anatomical porcelain molar crown (#FFFDFA) at the top. Soft studio light glints off the sharp metal threads and wet-gloss ceramic cusps as the camera performs a slow 15-degree orbital push-in.

[2.5s - 5.5s]: With rigid-body mechanical accuracy and zero morphing, the 18k champagne-gold hex abutment descends smoothly along the vertical axis and engages the internal conical connection of the titanium implant fixture, while the retaining screw rotates and seats cleanly inside the abutment channel.

[5.5s - 8.5s]: The translucent multilayered porcelain molar crown (#FFFDFA) glides downward in slow motion over the gold abutment. Subsurface studio light scatters through the warm ivory porcelain walls as the crown seats with micron-level precision onto the bevelled gold margin.

[8.5s - 10.0s]: As the crown locks flush into final occlusion, a crisp hairline specular reflection in Lagoon Teal (#0F5F6E) and Champagne Gold (#C8A26B) traces the cervical collar seam, and the completed biomechanical tooth holds steady in poised macro focus.

OPTICS & PHYSICS:
Shot on Hasselblad H6D-100c with 120mm f/4 macro lens, physically accurate metallic anisotropic reflections on brushed titanium and polished 18k gold, realistic subsurface scattering in dental porcelain, rigid mechanical motion, zero warping.

BACKGROUND COLOR LOCK (CRITICAL):
Infinite shadowless studio cyclorama with NO floor, NO table, and NO horizon line. Directly behind the centered subject is a soft Warm Ivory studio glow (#FFFDFA, RGB 255, 253, 250) that settles smoothly into a completely flat, solid matte Warm Porcelain with exact hex code #F6F3EE (RGB 246, 243, 238) across the entire outer 20% border on all four sides of the 16:9 frame. Zero corner vignette, zero text, zero logos.
```

---

## SEQUENCE 03 — `scene-03-scan-whitening.mp4`
### "Digital Optical Topography, Clear Aligner Seating & Luminous Enamel Sweep"
- **Section:** Technology, Orthodontics & Whitening Chapter (Midnight Stage).
- **Website Outer Background Hex:** **`#0A1C24` (`RGB 10, 28, 36` — Deep Midnight Teal)** with center spotlight **`#0B3A45` (`RGB 11, 58, 69` — Deep Lagoon)**.

#### PART 3A — Start Frame Prompt (Google Whisk / Flow Start Keyframe)
```text
Hyper-realistic commercial macro studio photograph of a complete, anatomically accurate upper human dental arch (14 sculpted porcelain-enamel teeth in sleek dark-slate translucent prosthodontic gingiva) floating at a dramatic three-quarter angle in the center of a dark luxury studio stage. Sweeping across the left half of the dental arch is a razor-thin, luminous Aqua Cyan (#63E6D9) optical structured-light laser curtain. Where the laser ribbon touches the teeth, it projects a crisp, ultra-fine geometric contour lattice of micro-topography lines and tiny Champagne Gold (#C8A26B) precision vertex points onto the wet-gloss enamel surface. Hovering 15 millimeters above the dental arch is a crystal-clear, thermoformed optical polyurethane aligner tray catching sharp aqua (#63E6D9) and pearl-white (#EAF7FA) edge refractions. Shot on Hasselblad H6D-100c, 100mm f/4 Macro lens, controlled chiaroscuro studio lighting.

BACKGROUND COLOR LOCK (CRITICAL):
Infinite dark studio cyclorama with no floor grid and no horizon. Behind the center of the dental arch is a subtle, controlled Deep Lagoon radial glow (#0B3A45, RGB 11, 58, 69) that fades smoothly into a completely uniform, solid matte Deep Midnight Teal-Black with exact hex code #0A1C24 (RGB 10, 28, 36) — NOT pure black #000000 — across the entire outer 20% border on all four sides of the 16:9 frame. Zero light spill reaching the frame borders, zero text, zero HUD numbers, 8k photorealistic render.
```

#### PART 3B — End Frame Prompt (Google Whisk / Flow End Keyframe)
```text
Hyper-realistic commercial macro studio photograph of the same complete upper dental arch in three-quarter hero perspective, now aligned in ideal symmetrical occlusion with the crystal-clear optical polymer aligner seated seamlessly and almost invisibly over the teeth. The enamel beneath the glass-clear aligner radiates a natural, vibrant Pearl-White B1 shade (#EAF7FA) with realistic blue-white incisal opalescence, wet-gloss softbox specular reflections, and delicate subsurface depth. A faint, refined halo of Aqua (#63E6D9) and Champagne Gold (#C8A26B) specular rim light traces the cusp tips and incisal edges. Shot on Hasselblad H6D-100c, 100mm f/4 Macro lens.

BACKGROUND COLOR LOCK (CRITICAL):
Infinite dark studio cyclorama with no floor or horizon. Subtle central Deep Lagoon studio glow (#0B3A45, RGB 11, 58, 69) directly behind the arch, transitioning smoothly into a completely uniform, solid matte Deep Midnight Teal-Black with exact hex code #0A1C24 (RGB 10, 28, 36) across the entire outer 20% border of the 16:9 frame. Zero light flares near edges, no text, no logos, 8k photorealistic render.
```

#### PART 3C — Ready-to-Paste 10-Second Google Flow Video Prompt (`scene-03-scan-whitening.mp4`)
```text
A smooth, 10-second cinematic macro dental technology film in 16:9 aspect ratio, 24fps, combining a 3D optical structured-light arch scan, precision clear aligner seating, and a luminous enamel whitening transformation in one continuous shot.

[0.0s - 3.0s]: A complete, hyper-realistic upper dental arch of 14 anatomical teeth floats at a three-quarter angle in a deep Midnight studio stage. A razor-sharp curtain of luminous Aqua Cyan (#63E6D9) optical laser light sweeps smoothly from left to right across the wet-gloss enamel surfaces, briefly illuminating a jewel-like micro-topography contour mesh with tiny Champagne Gold (#C8A26B) vertex nodes that map every cusp and groove.

[3.0s - 6.5s]: As the optical scan completes and dissolves cleanly, a crystal-clear, thermoformed optical polymer aligner shell hovering above the arch descends smoothly in slow motion and seats with physical precision onto the teeth. Crisp glass caustics and seafoam-aqua (#8CCBC3) edge refractions ripple along the arch as the anterior incisors glide subtly into harmonious symmetry.

[6.5s - 10.0s]: A silky crescent wave of pure Pearl-White (#EAF7FA) and soft Aqua (#63E6D9) light sweeps across the seated arch from canine to canine. Everywhere the light wave passes, the enamel shade lifts effortlessly into a radiant, natural, translucent Pearl-White (#EAF7FA) with opalescent incisal edges and mirror-crisp studio softbox reflections, holding steady in a luminous final hero pose.

OPTICS & PHYSICS:
Shot on Hasselblad H6D-100c with 100mm f/4 macro lens, physically accurate glass refraction through the clear polymer aligner, realistic hydroxyapatite enamel subsurface scattering, smooth damped camera orbit (15 degrees), zero cartoon sparkles, zero HUD text.

BACKGROUND COLOR LOCK (CRITICAL):
Infinite dark studio cyclorama with NO floor grid, NO background dust, and NO horizon line. Directly behind the centered dental arch is a subtle Deep Lagoon spotlight glow (#0B3A45, RGB 11, 58, 69) that settles smoothly into a completely uniform, solid matte Deep Midnight Teal-Black with exact hex code #0A1C24 (RGB 10, 28, 36) — NOT pure black #000000 — across the entire outer 20% border on all four sides of the 16:9 frame. Zero light spill at the frame borders, zero text, zero logos.
```

---

## 4. Recommended Workflow (Same Proven Pipeline as Rolex Calibre 3235)

1. **Generate Start & End Keyframes first (in Google Whisk / Imagen / Flow Image):**
   - For each of the 3 sequences, paste **Part A (Start Frame)** and **Part B (End Frame)** at `16:9`.
   - Optional: run `python tools/bgfix.py <frame.png> --bg <HEX>` to lock the outer border of your Start & End frames to exact `#0F5F6E`, `#F6F3EE`, and `#0A1C24` before uploading them to Flow.
2. **Generate the 3 Videos in Google Flow (`Frames to Video` mode):**
   - Upload the Start Keyframe + End Keyframe, paste **Part C (10-Second Video Prompt)**, and render.
3. **Drop the 3 MP4s into `C:\learning\websites\texas-smile-studio\assets\raw\`:**
   - `scene-01-hero.mp4`
   - `scene-02-implant.mp4`
   - `scene-03-scan-whitening.mp4`
4. **How the other sections get 3D motion without needing 9 separate videos:**
   - We can also slice sub-chapters from the 3 master sequences (e.g., the aligner & veneer beats in Sequence 01 and the scan vs. whitening acts in Sequence 03) AND pair them with interactive DOM 3D tilt, SVG path-draw schematics, and the interactive Before/After slider in Phase 4.
