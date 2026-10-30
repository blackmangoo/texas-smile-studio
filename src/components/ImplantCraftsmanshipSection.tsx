"use client";

import React, { useRef, useState } from "react";
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

interface ImplantCraftsmanshipSectionProps {
  onSelectServiceForBooking: (serviceId: ServiceId) => void;
}

export function ImplantCraftsmanshipSection({
  onSelectServiceForBooking,
}: ImplantCraftsmanshipSectionProps) {
  const scene = SCROLL_SCENES["scene-02-implant"];
  const pinRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [activeAct, setActiveAct] = useState<0 | 1 | 2>(0);
  const [manualAct, setManualAct] = useState<0 | 1 | 2 | null>(null);

  useGSAP(
    () => {
      const triggerEl = pinRef.current;
      if (!triggerEl) return;

      const stageNode = triggerEl.querySelector<
        HTMLDivElement & { __setSceneProgress?: (p: number) => void }
      >('[data-scene-stage="scene-02-implant"]');

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: triggerEl,
          start: "top top",
          end: `+=${scene.scrollLengthVh}%`,
          pin: true,
          scrub: 0.35,
          anticipatePin: 1,
          onUpdate: (self) => {
            stageNode?.__setSceneProgress?.(self.progress);
          },
        });
      });

      return () => mm.revert();
    },
    { scope: pinRef }
  );

  return (
    <section
      id="craftsmanship"
      aria-labelledby="craftsmanship-heading"
      style={{ backgroundColor: scene.sectionBgHex, color: "#13232C" }}
    >
      {/* Top Blend Transition from Porcelain #F6F3EE into Calibrated Stone-Porcelain #E6DFD1 */}
      <div
        className="h-16 w-full"
        style={{
          background: "linear-gradient(180deg, #F6F3EE 0%, #E6DFD1 100%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={pinRef}
        className="relative min-h-[100svh] w-full flex items-center pt-22 pb-8 lg:py-0"
        style={{ backgroundColor: scene.sectionBgHex }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-center">
          {/* Left Column (42%): Editorial Narrative & 3 Interactive Engineering Acts */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6631] mb-1.5 sm:mb-2.5">
              {scene.eyebrow}
            </span>
            <h2
              id="craftsmanship-heading"
              className="font-serif text-2xl sm:text-4xl lg:text-[44px] font-normal tracking-tight text-[#13232C] leading-[1.08]"
            >
              {scene.title}
            </h2>
            <p className="hidden sm:block mt-2.5 lg:mt-3 text-sm sm:text-base leading-relaxed text-[#4B5D66]">
              Scroll to assemble our four-part implant architecture in
              micro-gravity — from the CNC-machined titanium root to the warm
              18k gold-anodized collar and hand-glazed porcelain crown.
            </p>

            {/* Mobile Compact Act Tabs (< lg) */}
            <div className="mt-3 flex lg:hidden items-center gap-1.5" role="tablist" aria-label="Implant Assembly Chapters Mobile">
              {scene.acts.map((act, idx) => (
                <button
                  key={act.id}
                  type="button"
                  role="tab"
                  aria-selected={activeAct === idx}
                  onClick={() => {
                    setActiveAct(idx as 0 | 1 | 2);
                    setManualAct(idx as 0 | 1 | 2);
                  }}
                  className={`flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
                    activeAct === idx
                      ? "bg-[#0F5F6E] text-[#FFFDFA]"
                      : "bg-[#13232C]/10 text-[#13232C]"
                  }`}
                >
                  Act 0{idx + 1}
                </button>
              ))}
            </div>

            {/* 3 Engineering Act Cards (Active-only on mobile so 100svh never overflows; all 3 on lg) */}
            <div className="mt-3 lg:mt-6 space-y-2.5 lg:space-y-3" role="tablist" aria-label="Implant Assembly Chapters">
              {scene.acts.map((act, idx) => {
                const isActive = activeAct === idx;
                return (
                  <button
                    key={act.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setActiveAct(idx as 0 | 1 | 2);
                      setManualAct(idx as 0 | 1 | 2);
                    }}
                    className={`${
                      isActive ? "block" : "hidden lg:block"
                    } w-full text-left rounded-2xl p-4 sm:p-5 transition-all cursor-pointer border ${
                      isActive
                        ? "bg-[#FFFDFA] border-[#8A6631]/50 shadow-[0_20px_45px_-25px_rgba(15,95,110,0.28)]"
                        : "bg-[#FFFDFA]/45 border-[#13232C]/10 hover:bg-[#FFFDFA]/75"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6631]">
                        {act.badge}
                      </span>
                      <span className="font-serif text-base sm:text-lg font-normal text-[#0F5F6E]">
                        {act.metricValue}{" "}
                        <span className="font-sans text-[11px] text-[#4B5D66]">
                          {act.metricLabel}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 font-serif text-lg sm:text-xl text-[#13232C]">
                      {act.title}
                    </div>
                    {isActive && (
                      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#4B5D66]">
                        {act.subtitle}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scroll Progress Hairline + Direct Implant Consultation CTA */}
            <div className="mt-4 lg:mt-5 flex items-center gap-4">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#13232C]/15">
                <div
                  ref={progressBarRef}
                  className="h-full w-full origin-left rounded-full bg-[#0F5F6E]"
                  style={{ transform: "scaleX(0.05)" }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectServiceForBooking("implants");
                  smoothScrollTo("#booking");
                }}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0F5F6E] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#FFFDFA] hover:bg-[#0B3A45] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Plan Implant Visit</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column (58% — <= 960 CSS px so 1920x1080 never upscales on 2x retina): Seamless Canvas Stage */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex items-center justify-center">
            <div className="w-full max-w-[880px] h-[240px] sm:h-[340px] lg:h-auto lg:aspect-[16/9]">
              <ScrollSequenceStage
                scene={scene}
                eager={false}
                onActChange={setActiveAct}
                progressBarRef={progressBarRef}
                actStepManual={manualAct}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
