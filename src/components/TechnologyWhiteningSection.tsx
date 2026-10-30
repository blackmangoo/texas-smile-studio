"use client";

import React, { useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SCROLL_SCENES } from "@/data/clinicData";
import { ScrollSequenceStage } from "@/components/canvas/ScrollSequenceStage";
import { smoothScrollTo } from "@/lib/scrollBus";
import { ArrowUpRightIcon } from "@/components/icons/DentalIcons";
import type { ServiceId } from "@/lib/bookingSchema";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TechnologyWhiteningSectionProps {
  onSelectServiceForBooking: (serviceId: ServiceId) => void;
}

export function TechnologyWhiteningSection({
  onSelectServiceForBooking,
}: TechnologyWhiteningSectionProps) {
  const scene = SCROLL_SCENES["scene-03-scan-whitening"];
  const pinRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const activeActRef = useRef<0 | 1 | 2>(0);

  // Zero-React-re-render Step switcher during scroll!
  const applyActDom = useCallback((actIdx: 0 | 1 | 2) => {
    activeActRef.current = actIdx;
    const root = pinRef.current;
    if (!root) return;
    root.dataset.act = String(actIdx);

    root.querySelectorAll<HTMLButtonElement>("[data-s3-mob-tab]").forEach((btn) => {
      const active = btn.dataset.s3MobTab === String(actIdx);
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.className = active
        ? "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer bg-[#63E6D9] text-[#0A1C24]"
        : "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer bg-white/10 text-[#EAF7FA]";
    });

    root.querySelectorAll<HTMLButtonElement>("[data-s3-card]").forEach((card) => {
      const active = card.dataset.s3Card === String(actIdx);
      card.setAttribute("aria-selected", active ? "true" : "false");
      card.className = active
        ? "block w-full text-left rounded-2xl p-4 sm:p-5 transition-colors cursor-pointer border bg-[#0A1C24] border-[#63E6D9]/55"
        : "hidden lg:block w-full text-left rounded-2xl p-4 sm:p-5 transition-colors cursor-pointer border bg-white/[0.03] border-white/10 hover:bg-white/[0.06]";
      const desc = card.querySelector<HTMLElement>("[data-s3-desc]");
      if (desc) desc.classList.toggle("hidden", !active);
    });

    const ctaSpan = root.querySelector<HTMLElement>("[data-s3-cta-label]");
    if (ctaSpan) {
      ctaSpan.textContent = actIdx === 2 ? "Book Whitening" : "Book 3D Scan";
    }
  }, []);

  const handleManualActClick = useCallback(
    (idx: 0 | 1 | 2) => {
      applyActDom(idx);
      const stageNode = pinRef.current?.querySelector<
        HTMLDivElement & { __setSceneProgress?: (p: number, snap?: boolean) => void }
      >('[data-scene-stage="scene-03-scan-whitening"]');
      const p = idx === 0 ? 0.04 : idx === 1 ? 0.5 : 0.96;
      stageNode?.__setSceneProgress?.(p, true);
    },
    [applyActDom]
  );

  useGSAP(
    () => {
      const triggerEl = pinRef.current;
      if (!triggerEl) return;

      const stageNode = triggerEl.querySelector<
        HTMLDivElement & { __setSceneProgress?: (p: number) => void }
      >('[data-scene-stage="scene-03-scan-whitening"]');

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop:
            "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
          isTouch:
            "(max-width: 1023px) and (prefers-reduced-motion: no-preference), (pointer: coarse) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const isTouch = Boolean(context.conditions?.isTouch);
          ScrollTrigger.create({
            trigger: triggerEl,
            start: "top top",
            end: `+=${
              isTouch ? scene.mobileScrollLengthVh : scene.scrollLengthVh
            }%`,
            pin: true,
            scrub: isTouch ? true : 0.35,
            anticipatePin: 1,
            fastScrollEnd: true,
            onUpdate: (self) => {
              stageNode?.__setSceneProgress?.(self.progress);
            },
          });
        }
      );

      return () => mm.revert();
    },
    { scope: pinRef }
  );

  return (
    <section
      id="technology"
      aria-labelledby="technology-heading"
      style={{ backgroundColor: scene.sectionBgHex, color: "#EAF7FA" }}
    >
      <div
        className="h-28 sm:h-36 w-full"
        style={{
          background:
            "linear-gradient(180deg, #E6DFD1 0%, #0F5F6E 42%, #0B3A45 72%, #010304 100%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={pinRef}
        data-act="0"
        className="relative min-h-[100svh] w-full flex items-center pt-22 pb-8 lg:py-0 will-change-transform"
        style={{ backgroundColor: scene.sectionBgHex }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-center">
          {/* Left Column (58%) */}
          <div className="lg:col-span-7 flex items-center justify-center">
            <div className="w-full max-w-[880px] h-[230px] sm:h-[330px] lg:h-auto lg:aspect-[16/9]">
              <ScrollSequenceStage
                scene={scene}
                eager={false}
                onActChange={applyActDom}
                progressBarRef={progressBarRef}
              />
            </div>
          </div>

          {/* Right Column (42%) */}
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#63E6D9]/35 bg-[#63E6D9]/10 px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#63E6D9] mb-2 sm:mb-3">
              {scene.eyebrow}
            </span>
            <h2
              id="technology-heading"
              className="font-serif text-2xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#EAF7FA] leading-[1.08]"
            >
              A 3D scan in under a minute.{" "}
              <span className="text-[#63E6D9]">No goop, no guesswork.</span>
            </h2>
            <p className="hidden sm:block mt-2.5 lg:mt-3 text-sm sm:text-base leading-relaxed text-[#9FB7BE]">
              Watch our structured-light optical scanner map every cusp in
              real time, seat a custom-trimmed clear aligner, and finish with a
              cold-spectrum B1 pearl whitening sweep.
            </p>

            {/* Mobile Compact Step Tabs (< lg) */}
            <div
              className="mt-3 flex lg:hidden items-center gap-1.5"
              role="tablist"
              aria-label="Optical Scan Steps Mobile"
            >
              {scene.acts.map((act, idx) => (
                <button
                  key={act.id}
                  type="button"
                  role="tab"
                  data-s3-mob-tab={String(idx)}
                  aria-selected={idx === 0}
                  onClick={() => handleManualActClick(idx as 0 | 1 | 2)}
                  className={
                    idx === 0
                      ? "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer bg-[#63E6D9] text-[#0A1C24]"
                      : "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer bg-white/10 text-[#EAF7FA]"
                  }
                >
                  Step 0{idx + 1}
                </button>
              ))}
            </div>

            {/* 3 Pre-Mounted Midnight Chapter Steps */}
            <div
              className="mt-3 lg:mt-6 space-y-2.5 lg:space-y-3"
              role="tablist"
              aria-label="Optical Scan and Whitening Chapters"
            >
              {scene.acts.map((act, idx) => {
                const isActive = idx === 0;
                return (
                  <button
                    key={act.id}
                    type="button"
                    role="tab"
                    data-s3-card={String(idx)}
                    aria-selected={isActive}
                    onClick={() => handleManualActClick(idx as 0 | 1 | 2)}
                    className={
                      isActive
                        ? "block w-full text-left rounded-2xl p-4 sm:p-5 transition-colors cursor-pointer border bg-[#0A1C24] border-[#63E6D9]/55"
                        : "hidden lg:block w-full text-left rounded-2xl p-4 sm:p-5 transition-colors cursor-pointer border bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#63E6D9]">
                        {act.badge}
                      </span>
                      <span className="font-serif text-base sm:text-lg text-[#C8A26B]">
                        {act.metricValue}{" "}
                        <span className="font-sans text-[11px] text-[#9FB7BE]">
                          {act.metricLabel}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 font-serif text-lg sm:text-xl text-[#EAF7FA]">
                      {act.title}
                    </div>
                    <p
                      data-s3-desc
                      className={`${
                        isActive ? "" : "hidden"
                      } mt-1.5 text-xs sm:text-sm leading-relaxed text-[#9FB7BE]`}
                    >
                      {act.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Progress Bar + Action Buttons */}
            <div className="mt-4 lg:mt-5 flex flex-wrap items-center gap-3">
              <div className="h-1.5 flex-1 min-w-[120px] overflow-hidden rounded-full bg-white/15">
                <div
                  ref={progressBarRef}
                  className="h-full w-full origin-left rounded-full bg-[#63E6D9] will-change-transform"
                  style={{ transform: "scaleX(0.05)" }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectServiceForBooking(
                    activeActRef.current === 2 ? "optical-whitening" : "aligners"
                  );
                  smoothScrollTo("#booking");
                }}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#63E6D9] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#0A1C24] hover:bg-[#EAF7FA] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span data-s3-cta-label>Book 3D Scan</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="h-28 sm:h-36 w-full"
        style={{
          background:
            "linear-gradient(180deg, #010304 0%, #0B3A45 35%, #8CCBC3 72%, #F6F3EE 100%)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
