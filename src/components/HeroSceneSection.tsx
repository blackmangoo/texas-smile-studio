"use client";

import React, { useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SCROLL_SCENES } from "@/data/clinicData";
import { ScrollSequenceStage } from "@/components/canvas/ScrollSequenceStage";
import { smoothScrollTo } from "@/lib/scrollBus";
import { ArrowUpRightIcon } from "@/components/icons/DentalIcons";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TRUST_METRICS = [
  {
    value: "60 sec",
    label: "3D Optical Digital Scan",
    detail: "Zero gag-inducing putty molds",
  },
  {
    value: "0.3 mm",
    label: "Minimal-Prep Porcelain Veneers",
    detail: "Preserves natural tooth enamel",
  },
  {
    value: "98.6%",
    label: "3D Guided Implant Precision*",
    detail: "Grade-5 Titanium + 18k Gold Abutment",
  },
  {
    value: "Calm-First",
    label: "Unhurried Dallas Suites",
    detail: "Warm buffered numbing & Bose audio",
  },
] as const;

export function HeroSceneSection() {
  const scene = SCROLL_SCENES["scene-01-hero"];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pinSectionRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const applyActDom = useCallback((actIdx: 0 | 1 | 2) => {
    const root = pinSectionRef.current;
    if (!root) return;
    root.dataset.act = String(actIdx);

    root.querySelectorAll<HTMLElement>("[data-hero-act-panel]").forEach((el) => {
      el.classList.toggle("hidden", el.dataset.heroActPanel !== String(actIdx));
    });

    root
      .querySelectorAll<HTMLButtonElement>("[data-hero-act-tab]")
      .forEach((btn) => {
        const active = btn.dataset.heroActTab === String(actIdx);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.className = active
          ? "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer bg-[#C8A26B] text-[#13232C]"
          : "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer bg-white/10 text-[#EAF7FA]/80 hover:bg-white/20";
      });
  }, []);

  const handleManualActClick = useCallback(
    (idx: 0 | 1 | 2) => {
      applyActDom(idx);
      const stageNode = pinSectionRef.current?.querySelector<
        HTMLDivElement & {
          __setSceneProgress?: (p: number, snap?: boolean) => void;
        }
      >('[data-scene-stage="scene-01-hero"]');
      const p = idx === 0 ? 0.04 : idx === 1 ? 0.5 : 0.96;
      stageNode?.__setSceneProgress?.(p, true);
    },
    [applyActDom]
  );

  useGSAP(
    () => {
      const trackEl = trackRef.current;
      const stageContainerEl = pinSectionRef.current;
      if (!trackEl || !stageContainerEl) return;

      const stageNode = stageContainerEl.querySelector<
        HTMLDivElement & {
          __setSceneProgress?: (p: number, snap?: boolean) => void;
        }
      >('[data-scene-stage="scene-01-hero"]');

      const mm = gsap.matchMedia();

      // Laptop / Desktop: Keep exact GSAP pin + Lenis 0.35s scrub that feels best on desktop
      mm.add(
        "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          ScrollTrigger.create({
            trigger: stageContainerEl,
            start: "top top",
            end: `+=${scene.scrollLengthVh}%`,
            pin: true,
            scrub: 0.35,
            anticipatePin: 1,
            onUpdate: (self) => {
              stageNode?.__setSceneProgress?.(self.progress);
            },
          });
        }
      );

      // Mobile / Touch: Native GPU compositor CSS `position: sticky` track (`pin: false`!)
      // Zero JS position:fixed reparenting jitter on iPhone Safari & Android Chrome!
      mm.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference), (pointer: coarse) and (prefers-reduced-motion: no-preference)",
        () => {
          ScrollTrigger.create({
            trigger: trackEl,
            start: "top top",
            end: "bottom bottom",
            pin: false,
            scrub: 0.2,
            onUpdate: (self) => {
              stageNode?.__setSceneProgress?.(self.progress);
            },
          });
        }
      );

      return () => mm.revert();
    },
    { scope: trackRef }
  );

  return (
    <section id="hero-stage" aria-label="Hero — Architectural Dental Care">
      {/* Outer Track: Tall CSS sticky runway on Mobile/Touch (310svh), normal wrapper on Desktop (where GSAP pins) */}
      <div
        ref={trackRef}
        className="relative h-[310svh] lg:h-auto"
        style={{ backgroundColor: scene.sectionBgHex }}
      >
        <div
          ref={pinSectionRef}
          data-act="0"
          className="sticky top-0 h-[100svh] lg:relative lg:min-h-screen w-full overflow-hidden flex flex-col justify-evenly lg:justify-between pt-20 pb-4 sm:pb-8 lg:pb-10"
          style={{ backgroundColor: scene.sectionBgHex, color: "#FFFDFA" }}
        >
          {/* Top Editorial Row */}
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 pt-1 sm:pt-3 lg:pt-6 grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-6 items-start">
            <div className="relative z-10 lg:col-span-4 max-w-md">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A26B] mb-1 sm:mb-2">
                {scene.eyebrow}
              </p>
              <p className="hidden lg:block text-[17px] leading-relaxed text-[#EAF7FA]/95 font-normal">
                Discover tailored restorative artistry, 60-second optical
                diagnostics, and an unhurried Dallas team dedicated to your
                long-term comfort.
              </p>
              <div className="mt-5 hidden lg:flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => smoothScrollTo("#services")}
                  className="inline-flex h-11 sm:h-12 items-center gap-2.5 rounded-full bg-[#FFFDFA] px-5 sm:px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#13232C] shadow-lg hover:bg-[#C8A26B] transition-colors cursor-pointer"
                >
                  <span>Explore Our Services</span>
                  <ArrowUpRightIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => smoothScrollTo("#booking")}
                  className="inline-flex h-11 sm:h-12 items-center gap-2 rounded-full border border-white/40 bg-[#135865]/70 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#FFFDFA] hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <span>Book a Visit</span>
                </button>
              </div>
            </div>

            {/* Unified 16:9 Centered 3D Dental Arch Stage — Uncropped on Phone, Tablet, and Desktop */}
            <div className="lg:col-span-4 w-full flex items-center justify-center lg:pointer-events-none lg:absolute lg:inset-0 lg:h-full">
              <div className="relative w-full max-w-[560px] lg:max-w-[1160px] aspect-[16/9] max-h-[33svh] sm:max-h-[38svh] lg:max-h-none lg:aspect-auto lg:h-[78vh]">
                <ScrollSequenceStage
                  scene={scene}
                  eager={true}
                  onActChange={applyActDom}
                  progressBarRef={progressBarRef}
                />
              </div>
            </div>

            {/* Right Live Restorative Act Switcher Card */}
            <div className="relative z-10 lg:col-span-4 lg:col-start-9 lg:justify-self-end w-full max-w-md lg:max-w-sm rounded-2xl border border-white/20 bg-[#0D3F49] p-3.5 sm:p-5">
              {scene.acts.map((act, idx) => (
                <div
                  key={act.id}
                  data-hero-act-panel={String(idx)}
                  className={idx === 0 ? "" : "hidden"}
                >
                  <div className="flex items-center justify-between gap-2 mb-1 sm:mb-2.5">
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8A26B]">
                      {act.badge}
                    </span>
                    <span className="font-serif text-base sm:text-lg text-[#EAF7FA]">
                      {act.metricValue}{" "}
                      <span className="font-sans text-[11px] sm:text-xs text-[#9FB7BE]">
                        {act.metricLabel}
                      </span>
                    </span>
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-normal text-[#FFFDFA]">
                    {act.title}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#EAF7FA]/85 line-clamp-2 sm:line-clamp-none">
                    {act.subtitle}
                  </p>
                </div>
              ))}

              <div
                className="mt-3 sm:mt-4 flex items-center gap-1.5"
                role="tablist"
                aria-label="Hero 3D Sequence Chapters"
              >
                {scene.acts.map((act, idx) => {
                  const isSelected = idx === 0;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      role="tab"
                      data-hero-act-tab={String(idx)}
                      aria-selected={isSelected}
                      onClick={() => handleManualActClick(idx as 0 | 1 | 2)}
                      className={`flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#C8A26B] text-[#13232C]"
                          : "bg-white/10 text-[#EAF7FA]/80 hover:bg-white/20"
                      }`}
                    >
                      Act 0{idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2.5 sm:mt-3 h-1 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  ref={progressBarRef}
                  className="h-full w-full origin-left rounded-full bg-[#C8A26B] will-change-transform"
                  style={{ transform: "scaleX(0.05)" }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Editorial Row */}
          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 mt-2 lg:mt-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-5 items-end">
            <div className="lg:col-span-8">
              <h1 className="font-serif text-[26px] sm:text-5xl lg:text-[62px] font-normal uppercase leading-[1.04] tracking-[-0.02em] text-[#FFFDFA]">
                Dental Care
                <br />
                Engineered For
                <br />
                <span className="text-[#EAF7FA]">Better Comfort</span>
              </h1>
              <div className="mt-2.5 flex lg:hidden items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => smoothScrollTo("#services")}
                  className="inline-flex h-10 sm:h-11 items-center gap-2 rounded-full bg-[#FFFDFA] px-4 sm:px-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#13232C]"
                >
                  <span>Explore Services</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => smoothScrollTo("#booking")}
                  className="inline-flex h-10 sm:h-11 items-center rounded-full border border-white/40 px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#FFFDFA]"
                >
                  Book Visit
                </button>
              </div>
            </div>

            <div className="hidden sm:flex lg:col-span-4 lg:text-right flex-col lg:items-end justify-end">
              <p className="max-w-xs text-sm sm:text-base leading-relaxed text-[#EAF7FA]/90">
                From routine preventive checkups to 3D-guided implants, clear
                aligners, and 0.3mm veneers — we craft healthy Dallas smiles
                without the rush.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#C8A26B]">
                <span>Scroll to articulate 3D arch</span>
                <span aria-hidden="true">↓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Architectural Metrics Bar on Warm Ivory */}
      <div className="border-b border-[#E6E0D6] bg-[#FFFDFA] text-[#13232C]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E0D6]">
            {TRUST_METRICS.map((item, idx) => (
              <div
                key={item.label}
                className={`py-5 sm:py-2 ${
                  idx === 0
                    ? "sm:pr-8"
                    : idx === TRUST_METRICS.length - 1
                    ? "sm:pl-8"
                    : "sm:px-8"
                }`}
              >
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F7E4D8] text-xs font-semibold text-[#A84A33]">
                  0{idx + 1}
                </div>
                <div className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#13232C]">
                  {item.value}
                </div>
                <div className="mt-1 text-base font-semibold text-[#13232C]">
                  {item.label}
                </div>
                <p className="mt-0.5 text-sm text-[#4B5D66]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
