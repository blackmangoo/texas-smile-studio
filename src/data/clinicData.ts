import type { ServiceId } from "@/lib/bookingSchema";

export interface SceneChapterAct {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  metricValue: string;
  metricLabel: string;
  range: [number, number];
}

export interface ScrollSceneConfig {
  id: "scene-01-hero" | "scene-02-implant" | "scene-03-scan-whitening";
  title: string;
  eyebrow: string;
  sectionBgHex: string;
  spotlightHex: string;
  canvasMaskCss: string;
  scrollLengthVh: number;
  mobileScrollLengthVh: number;
  desktop: {
    width: number;
    height: number;
    frameCount: number;
    poster: string;
    dir: string;
  };
  mobile: {
    width: number;
    height: number;
    frameCount: number;
    poster: string;
    packBin: string;
    packJson: string;
  };
  acts: [SceneChapterAct, SceneChapterAct, SceneChapterAct];
}

export const SCROLL_SCENES: Record<ScrollSceneConfig["id"], ScrollSceneConfig> = {
  "scene-01-hero": {
    id: "scene-01-hero",
    title: "Dental Care Engineered for Calm Precision",
    eyebrow: "TEXAS SMILE STUDIO · UPTOWN DALLAS",
    sectionBgHex: "#135865",
    spotlightHex: "#3E98A8",
    canvasMaskCss:
      "radial-gradient(49% 49% at 50% 50%, #000 66%, rgba(0,0,0,0.55) 83%, transparent 98%)",
    scrollLengthVh: 300,
    mobileScrollLengthVh: 240,
    desktop: {
      width: 1920,
      height: 1080,
      frameCount: 180,
      poster: "/frames/scene-01-hero/poster-desktop.webp",
      dir: "/frames/scene-01-hero/desktop",
    },
    mobile: {
      width: 854,
      height: 480,
      frameCount: 144,
      poster: "/frames/scene-01-hero/poster-mobile-v3.webp",
      packBin: "/frames/scene-01-hero/mobile-pack-v3.bin",
      packJson: "/frames/scene-01-hero/mobile-pack-v3.json",
    },
    acts: [
      {
        id: "hero-act-1",
        badge: "01 / FULL-ARCH HARMONY",
        title: "Natural Enamel Architecture",
        subtitle:
          "Every restoration begins with full-arch occlusal balance, preserving natural hydroxyapatite translucency and unhurried comfort.",
        metricValue: "28",
        metricLabel: "Point Occlusal Balance",
        range: [0.0, 0.33],
      },
      {
        id: "hero-act-2",
        badge: "02 / ORTHODONTIC CLARITY",
        title: "Laser-Trimmed Clear Aligners",
        subtitle:
          "Scalloped along your exact gingival contour from a 60-second optical scan — zero putty impressions, zero bracket friction.",
        metricValue: "0.02 mm",
        metricLabel: "Optical Fit Tolerance",
        range: [0.34, 0.67],
      },
      {
        id: "hero-act-3",
        badge: "03 / RESTORATIVE MASTERY",
        title: "0.3mm Veneers & Titanium Implants",
        subtitle:
          "Hand-layered lithium disilicate veneers and Grade-5 titanium implants with 18k gold-hue abutments engineered to last decades.",
        metricValue: "0.3 mm",
        metricLabel: "Minimal-Prep Porcelain Veil",
        range: [0.68, 1.0],
      },
    ],
  },
  "scene-02-implant": {
    id: "scene-02-implant",
    title: "Watchmaking Tolerances in Restorative Dentistry",
    eyebrow: "PROSTHODONTIC CRAFTSMANSHIP",
    sectionBgHex: "#E6DFD1",
    spotlightHex: "#F7F3EB",
    canvasMaskCss:
      "radial-gradient(49% 49% at 50% 50%, #000 68%, rgba(0,0,0,0.55) 84%, transparent 98%)",
    scrollLengthVh: 250,
    mobileScrollLengthVh: 210,
    desktop: {
      width: 1920,
      height: 1080,
      frameCount: 180,
      poster: "/frames/scene-02-implant/poster-desktop.webp",
      dir: "/frames/scene-02-implant/desktop",
    },
    mobile: {
      width: 854,
      height: 480,
      frameCount: 144,
      poster: "/frames/scene-02-implant/poster-mobile-v3.webp",
      packBin: "/frames/scene-02-implant/mobile-pack-v3.bin",
      packJson: "/frames/scene-02-implant/mobile-pack-v3.json",
    },
    acts: [
      {
        id: "implant-act-1",
        badge: "ACT I · TITANIUM FOUNDATION",
        title: "Grade-5 Ti-6Al-4V Helical Fixture",
        subtitle:
          "3D-guided placement positions the micro-threaded titanium root with sub-millimeter accuracy for gentle, predictable osseointegration.",
        metricValue: "98.6%",
        metricLabel: "Clinical Integration Benchmark*",
        range: [0.0, 0.35],
      },
      {
        id: "implant-act-2",
        badge: "ACT II · WARM EMERGENCE",
        title: "18k Champagne-Gold Hex Abutment",
        subtitle:
          "Unlike grey metal posts that cast a dark shadow through the gumline, warm gold-anodized titanium preserves natural pink tissue esthetics.",
        metricValue: "5 µm",
        metricLabel: "Conical Seal Precision",
        range: [0.36, 0.70],
      },
      {
        id: "implant-act-3",
        badge: "ACT III · ENAMEL BIOMIMICRY",
        title: "Multilayered Porcelain Molar Crown",
        subtitle:
          "Custom-milled and hand-glazed to match the exact fluorescence, cuspal anatomy, and light scatter of your neighboring teeth.",
        metricValue: "480 MPa",
        metricLabel: "Flexural Ceramic Strength",
        range: [0.71, 1.0],
      },
    ],
  },
  "scene-03-scan-whitening": {
    id: "scene-03-scan-whitening",
    title: "60-Second Optical Scan to Radiant Pearl Enamel",
    eyebrow: "DIGITAL DIAGNOSTICS & WHITENING",
    sectionBgHex: "#010304",
    spotlightHex: "#092C36",
    canvasMaskCss:
      "radial-gradient(50% 49% at 50% 50%, #000 72%, rgba(0,0,0,0.5) 86%, transparent 98%)",
    scrollLengthVh: 250,
    mobileScrollLengthVh: 210,
    desktop: {
      width: 1920,
      height: 1080,
      frameCount: 180,
      poster: "/frames/scene-03-scan-whitening/poster-desktop.webp",
      dir: "/frames/scene-03-scan-whitening/desktop",
    },
    mobile: {
      width: 854,
      height: 480,
      frameCount: 144,
      poster: "/frames/scene-03-scan-whitening/poster-mobile-v3.webp",
      packBin: "/frames/scene-03-scan-whitening/mobile-pack-v3.bin",
      packJson: "/frames/scene-03-scan-whitening/mobile-pack-v3.json",
    },
    acts: [
      {
        id: "scan-act-1",
        badge: "STEP 01 · STRUCTURED-LIGHT TOPOGRAPHY",
        title: "A 3D Digital Twin in Under 60 Seconds",
        subtitle:
          "Radiation-free optical laser triangulation captures 6,000 frames per second — replacing gag-inducing impression trays forever.",
        metricValue: "6,000 fps",
        metricLabel: "Optical Surface Capture",
        range: [0.0, 0.34],
      },
      {
        id: "scan-act-2",
        badge: "STEP 02 · ORTHODONTIC KINEMATICS",
        title: "Micro-Calibrated Clear Aligner Seating",
        subtitle:
          "Every stage applies gentle, continuous biological force calculated from your 3D root and crown model for faster, calmer alignment.",
        metricValue: "0.25 mm",
        metricLabel: "Controlled Movement / Stage",
        range: [0.35, 0.66],
      },
      {
        id: "scan-act-3",
        badge: "STEP 03 · COLD-LIGHT ENAMEL LIFT",
        title: "Desensitized B1 Pearl Radiance",
        subtitle:
          "pH-balanced hydroxyapatite conditioning paired with cold-spectrum optical activation lifts deep intrinsic staining without nerve zings.",
        metricValue: "Up to 8",
        metricLabel: "VITA Shade Steps Brighter",
        range: [0.67, 1.0],
      },
    ],
  },
};

export interface DentalServiceItem {
  id: ServiceId;
  number: string;
  title: string;
  tagline: string;
  description: string;
  duration: string;
  comfortNote: string;
  accentTag: string;
  accentTone: "lagoon" | "bronze" | "terracotta";
  linkedSceneAnchor: string;
  highlights: [string, string, string];
}

export const DENTAL_SERVICES: DentalServiceItem[] = [
  {
    id: "implants",
    number: "01",
    title: "Guided Dental Implants",
    tagline: "Biomechanical permanence engineered to feel like your own tooth.",
    description:
      "3D CBCT-guided Grade-5 titanium fixtures paired with warm gold-hue abutments and hand-layered porcelain crowns for lifelong function.",
    duration: "60–90 min guided visit",
    comfortNote: "Computer-guided keyhole placement · IV or oral sedation available",
    accentTag: "3D Guided Precision",
    accentTone: "bronze",
    linkedSceneAnchor: "#craftsmanship",
    highlights: [
      "3D surgical guide avoids freehand incisions",
      "18k gold-anodized abutment prevents grey gum shadows",
      "Custom ceramic crown matched to natural enamel",
    ],
  },
  {
    id: "aligners",
    number: "02",
    title: "Braces & Clear Aligners",
    tagline: "Discreet orthodontic architecture from a 60-second digital scan.",
    description:
      "Custom thermoformed optical polymer aligners and low-profile ceramic orthodontics planned digitally so you preview your final smile before day one.",
    duration: "45 min digital onboarding",
    comfortNote: "Zero putty impressions · Laser-polished scalloped edges",
    accentTag: "Digital Smile Preview",
    accentTone: "lagoon",
    linkedSceneAnchor: "#technology",
    highlights: [
      "Full 3D movement simulation at first consultation",
      "Remote progress check-ins reduce in-office visits",
      "Complimentary Vivera-grade retention suite included",
    ],
  },
  {
    id: "cosmetic-veneers",
    number: "03",
    title: "Cosmetic Porcelain Veneers",
    tagline: "0.3mm ultra-thin ceramic veils with natural incisal translucency.",
    description:
      "Hand-finished lithium disilicate veneers and biomimetic bonding designed around your facial proportions — never opaque, bulky, or artificial.",
    duration: "2 unhurried studio visits",
    comfortNote: "Trial Smile preview on your teeth before final bonding",
    accentTag: "Minimal-Prep Artistry",
    accentTone: "bronze",
    linkedSceneAnchor: "#hero-stage",
    highlights: [
      "0.3mm contact-lens thickness preserves healthy enamel",
      "Bespoke mamelon & perikymata surface micro-texture",
      "Stain-impervious glazed ceramic surface",
    ],
  },
  {
    id: "gentle-root-canal",
    number: "04",
    title: "Gentle Microscopic Root Canal",
    tagline: "Quiet, single-visit inner tooth relief under 20× optical magnification.",
    description:
      "Buffered anesthetic delivery, acoustic irrigation, and Zeiss dental microscopy turn what used to be feared into a calm, nap-like restoration.",
    duration: "60 min single-visit relief",
    comfortNote: "Warm buffered numbing · Noise-canceling Bose audio suite",
    accentTag: "Pain-First Protocol",
    accentTone: "lagoon",
    linkedSceneAnchor: "#services",
    highlights: [
      "pH-buffered anesthetic eliminates the initial pinch",
      "20× optical magnification locates hidden micro-canals",
      "Same-day ceramic onlay or crown seal available",
    ],
  },
  {
    id: "optical-whitening",
    number: "05",
    title: "Cold-Light Enamel Whitening",
    tagline: "Radiant pearl shade lift with nano-hydroxyapatite sensitivity armor.",
    description:
      "Our cold-spectrum optical activation lifts years of espresso, wine, and aging chromophores while remineralizing enamel prisms to prevent post-visit zings.",
    duration: "60 min studio lounge session",
    comfortNote: "Zero-zing remineralizing serum before & after",
    accentTag: "Sensitivity-Free Lift",
    accentTone: "lagoon",
    linkedSceneAnchor: "#technology",
    highlights: [
      "Up to 8 VITA shade steps in one 60-minute session",
      "Nano-hydroxyapatite seals microscopic dentin tubules",
      "Includes custom-fitted touch-up trays for home",
    ],
  },
  {
    id: "pediatric-family",
    number: "06",
    title: "Pediatric & Family Sanctuary",
    tagline: "Fear-free childhood visits that build a lifetime of calm confidence.",
    description:
      "Tell-Show-Do gentle onboarding, ceiling cinema, warm honey-fluoride or hydroxyapatite varnishes, and BPA-free protective molar sealants for ages 2–17.",
    duration: "45 min unhurried kid-paced visit",
    comfortNote: "Parent-beside-chair welcome · Zero rush if a child needs time",
    accentTag: "Kids & Sensory Friendly",
    accentTone: "terracotta",
    linkedSceneAnchor: "#kids-family",
    highlights: [
      "Sensory-friendly lighting & ceiling story projection",
      "No-drill resin infiltration for early enamel spots",
      "Dedicated family block scheduling for parents + kids",
    ],
  },
];

export interface TransformationCase {
  id: string;
  title: string;
  category: string;
  duration: string;
  summary: string;
  beforeShade: string;
  afterShade: string;
  beforeDetails: string;
  afterDetails: string;
}

export const TRANSFORMATION_CASES: TransformationCase[] = [
  {
    id: "case-veneers",
    title: "8 Minimal-Prep Porcelain Veneers + Gingival Harmony",
    category: "Cosmetic Veneers",
    duration: "3 Weeks · 2 Visits",
    summary:
      "Restored worn incisal edges, closed diastema spacing, and lifted shade from A3 to natural B1 with translucent incisal halo.",
    beforeShade: "VITA A3 · Worn Incisal Edges",
    afterShade: "Natural B1 · Opalescent Enamel",
    beforeDetails: "Shortened central incisors, uneven gingival zeniths, and warm intrinsic dentin discoloration.",
    afterDetails: "Balanced Golden-Proportion central incisors with natural mamelon translucency and satin specular luster.",
  },
  {
    id: "case-aligners-whitening",
    title: "Clear Aligner Arch Expansion + Cold-Light Whitening",
    category: "Clear Aligners + Whitening",
    duration: "7 Months · 18 Aligners",
    summary:
      "Broadened the buccal corridor, aligned rotated lateral incisors without extractions, and finished with nano-hydroxyapatite whitening.",
    beforeShade: "Crowded Arch · VITA A2.5",
    afterShade: "Broad Symmetry · VITA B1",
    beforeDetails: "Narrow smile corridor with overlapping upper lateral incisors and shadowed premolars.",
    afterDetails: "Full 10-tooth radiant smile arc with effortless lip support and zero enamel stripping.",
  },
  {
    id: "case-implant-crown",
    title: "Single-Tooth Titanium Implant & Gold-Abutment Crown",
    category: "Guided Implant",
    duration: "14 Weeks Total Integration",
    summary:
      "Replaced a fractured first premolar with a 3D-guided titanium fixture, 18k gold-hue abutment, and custom lithium-disilicate crown.",
    beforeShade: "Fractured Premolar Site",
    afterShade: "Seamless Biomimetic Crown",
    beforeDetails: "Missing upper premolar with risk of adjacent tooth drift and gingival recession.",
    afterDetails: "Healthy pink interdental papilla and indistinguishable ceramic translucency.",
  },
];

export interface DoctorProfile {
  id: string;
  name: string;
  credentials: string;
  role: string;
  education: string;
  quote: string;
  specialties: string[];
  monogram: string;
}

export const DOCTORS: DoctorProfile[] = [
  {
    id: "dr-vance",
    name: "Dr. Elena Vance, DDS, MS",
    credentials: "Lead Prosthodontist & Aesthetic Director [Placeholder Profile]",
    role: "Prosthodontics & Minimal-Prep Ceramics",
    education: "Baylor College of Dentistry (Texas A&M) · MS Prosthodontics",
    quote:
      "The highest compliment a veneer or crown can receive is that no one — not even another dentist — suspects it wasn't born there.",
    specialties: ["0.3mm Porcelain Veneers", "Full-Mouth Rehabilitation", "Digital Smile Architecture"],
    monogram: "EV",
  },
  {
    id: "dr-sterling",
    name: "Dr. Marcus Sterling, DMD, FICOI",
    credentials: "Director of Guided Implantology & Endodontics [Placeholder Profile]",
    role: "3D Guided Implants & Microscopic Root Therapy",
    education: "UPenn School of Dental Medicine · Fellowship in Implantology",
    quote:
      "When you plan every millimeter in 3D before the visit begins, the appointment itself becomes quiet, gentle, and remarkably fast.",
    specialties: ["CBCT Guided Implants", "Zeiss Microscopic Endodontics", "IV & Oral Sedation"],
    monogram: "MS",
  },
  {
    id: "dr-lin",
    name: "Dr. Maya Lin, DDS",
    credentials: "Pediatric & Airway-Focused Orthodontic Specialist [Placeholder Profile]",
    role: "Pediatric Sanctuary & Clear Aligner Therapy",
    education: "UT Health San Antonio School of Dentistry · Pediatric Residency",
    quote:
      "A child who feels in control of their dental visit at age five grows into an adult who never fears taking care of their health.",
    specialties: ["Sensory-Friendly Pediatric Care", "Clear Aligner Orthodontics", "Early Airway & Arch Guidance"],
    monogram: "ML",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "I have severe dental anxiety. How is a visit at Texas Smile Studio different?",
    answer:
      "We built the entire studio around nervous patients. We never rush or lecture, we apply warm pH-buffered numbing gel before anything touches a tooth, we replace gag-inducing putty molds with a 60-second optical camera scan, and every suite features noise-canceling Bose headphones and ceiling cinema. You also hold a stop-signal button in your hand—if you raise a finger, we pause immediately.",
  },
  {
    question: "Do you accept dental insurance, and do I see exact costs before treatment?",
    answer:
      "Yes. We work with all major PPO dental insurance plans (including Delta Dental, Cigna, MetLife, Aetna, BlueCross BlueShield, and Guardian) and file claims on your behalf. Before any treatment begins, we present a transparent, itemized written fee breakdown showing your exact insurance benefit and out-of-pocket portion—zero surprise bills.",
  },
  {
    question: "What if I don't have dental insurance?",
    answer:
      "Our in-house Texas Smile Membership Plan covers your annual 3D optical wellness scans, two preventive cleanings, necessary digital X-rays, and an immediate 15% courtesy across restorative, aligner, and cosmetic treatments—with no waiting periods, deductibles, or annual maximums. We also offer 0% APR monthly financing over 12–24 months.",
  },
  {
    question: "How thin are your porcelain veneers, and do you have to grind my teeth down?",
    answer:
      "Never. We reject aggressive 'shark-tooth' preparations. Using 3D digital additive planning and high-strength lithium disilicate ceramics, our veneers are crafted as thin as 0.3mm—preserving 85% to 95% of your natural tooth enamel while giving you a reversible 'Trial Smile' preview before final bonding.",
  },
  {
    question: "Why do you use 18k gold-hue abutments on dental implants instead of standard grey metal?",
    answer:
      "Standard silver-grey titanium abutments can cast a dull, dark shadow through thin gum tissue over time. By pairing a biocompatible Grade-5 titanium root with a warm 18k gold-anodized abutment collar beneath a translucent porcelain crown, your gumline keeps its natural warm pink vitality and the crown scatters light just like natural dentin.",
  },
  {
    question: "At what age should my child have their first pediatric visit?",
    answer:
      "The American Academy of Pediatric Dentistry recommends a first 'Happy Visit' around age 1 or within 6 months of their first tooth emerging. Our kids' sanctuary visits are completely play-paced: children can sit on a parent's lap, explore the 'star camera' wand on their fingernail first, and never experience forced treatment.",
  },
  {
    question: "Where in Dallas are you located, and is parking complimentary?",
    answer:
      "Our studio is located in Uptown / Turtle Creek along Cedar Springs Road in Dallas, TX, with reserved ground-level patient valet and covered self-parking validated at our front desk. Early-morning (8:00 AM) and executive late-afternoon appointments are available.",
  },
];
