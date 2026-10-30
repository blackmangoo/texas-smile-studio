"use client";

import React, { useRef, useCallback } from "react";
import { SCROLL_SCENES } from "@/data/clinicData";
import { ScrollSequenceStage } from "@/components/canvas/ScrollSequenceStage";
import { smoothScrollTo } from "@/lib/scrollBus";
import { useSceneScrollScrub } from "@/lib/useSceneScrollScrub";
import { ArrowUpRightIcon } from "@/components/icons/DentalIcons";
import type { ServiceId } from "@/lib/bookingSchema";

interface ImplantCraftsmanshipSectionProps {
  onSelectServiceForBooking: (serviceId: ServiceId) => void;
}

const ACTIVE_CARD_CLS =
  "block w-full text-left rounded-2xl px-4 py-3 xl:px-4.5 xl:py-3.5 transition-colors cursor-pointer border bg-[#FFFDFA] border-[#8A6631]/50 shadow-xs";
const INACTIVE_CARD_CLS =
  "hidden lg:block w-full text-left rounded-2xl px-4 py-2.5 xl:px-4.5 xl:py-3 transition-colors cursor-pointer border bg-[#FFFDFA]/45 border-[#13232C]/10 hover:bg-[#FFFDFA]/75";

export function ImplantCraftsmanshipSection({
  onSelectServiceForBooking,
}: ImplantCraftsmanshipSectionProps) {
  const scene = SCROLL_SCENES["scene-02-implant"];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const applyActDom = useCallback((actIdx: 0 | 1 | 2) => {
    const root = pinRef.current;
    if (!root) return;
    root.dataset.act = String(actIdx);

    root
      .querySelectorAll<HTMLButtonElement>("[data-s2-mob-tab]")
      .forEach((btn) => {
        const active = btn.dataset.s2MobTab === String(actIdx);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.className = active
          ? "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer bg-[#0F5F6E] text-[#FFFDFA]"
          : "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer bg-[#13232C]/10 text-[#13232C]";
      });

    root
      .querySelectorAll<HTMLButtonElement>("[data-s2-card]")
      .forEach((card) => {
        const active = card.dataset.s2Card === String(actIdx);
        card.setAttribute("aria-selected", active ? "true" : "false");
        card.className = active ? ACTIVE_CARD_CLS : INACTIVE_CARD_CLS;
        const desc = card.querySelector<HTMLElement>("[data-s2-desc]");
        if (desc) desc.classList.toggle("hidden", !active);
      });
  }, []);

  const handleManualActClick = useCallback(
    (idx: 0 | 1 | 2) => {
      applyActDom(idx);
      const stageNode = pinRef.current?.querySelector<
        HTMLDivElement & {
          __setSceneProgress?: (p: number, syncInRaf?: boolean) => void;
        }
      >('[data-scene-stage="scene-02-implant"]');
      const p = idx === 0 ? 0.04 : idx === 1 ? 0.5 : 0.96;
      stageNode?.__setSceneProgress?.(p, true);
    },
    [applyActDom]
  );

  useSceneScrollScrub({
    sceneId: "scene-02-implant",
    scrollLengthVh: scene.scrollLengthVh,
    trackRef,
    stageContainerRef: pinRef,
  });

  return (
    <section
      id="craftsmanship"
      aria-labelledby="craftsmanship-heading"
      style={{ backgroundColor: scene.sectionBgHex, color: "#13232C" }}
    >
      <div
        className="h-16 w-full"
        style={{
          background: "linear-gradient(180deg, #F6F3EE 0%, #E6DFD1 100%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={trackRef}
        className="scene-sticky-track relative"
        style={
          {
            backgroundColor: scene.sectionBgHex,
            "--mobile-track-h": "310svh",
          } as React.CSSProperties
        }
      >
        {/* Guaranteed top clearance below the 68px fixed navbar at all laptop & phone heights */}
        <div
          ref={pinRef}
          data-act="0"
          className="scene-sticky-stage w-full overflow-hidden flex items-center pt-[74px] pb-5 lg:pt-[84px] lg:pb-6"
          style={{ backgroundColor: scene.sectionBgHex }}
        >
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10 xl:px-12 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-8 xl:gap-10 items-center">
            {/* Left Column (42%) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A6631] mb-1.5">
                {scene.eyebrow}
              </span>
              <h2
                id="craftsmanship-heading"
                className="font-serif text-2xl sm:text-3xl lg:text-[34px] xl:text-[40px] font-normal tracking-tight text-[#13232C] leading-[1.08]"
              >
                {scene.title}
              </h2>
              <p className="scene-compact-hide hidden sm:block mt-2 text-xs sm:text-sm xl:text-[15px] leading-relaxed text-[#4B5D66]">
                Scroll to assemble our four-part implant architecture in
                micro-gravity — from the CNC-machined titanium root to the warm
                18k gold-anodized collar and hand-glazed porcelain crown.
              </p>

              {/* Mobile Compact Act Tabs (< lg) */}
              <div
                className="mt-3 flex lg:hidden items-center gap-1.5"
                role="tablist"
                aria-label="Implant Assembly Chapters Mobile"
              >
                {scene.acts.map((act, idx) => (
                  <button
                    key={act.id}
                    type="button"
                    role="tab"
                    data-s2-mob-tab={String(idx)}
                    aria-selected={idx === 0}
                    onClick={() => handleManualActClick(idx as 0 | 1 | 2)}
                    className={
                      idx === 0
                        ? "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer bg-[#0F5F6E] text-[#FFFDFA]"
                        : "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer bg-[#13232C]/10 text-[#13232C]"
                    }
                  >
                    Act 0{idx + 1}
                  </button>
                ))}
              </div>

              {/* 3 Pre-Mounted Engineering Act Cards */}
              <div
                className="mt-3 lg:mt-4 space-y-2"
                role="tablist"
                aria-label="Implant Assembly Chapters"
              >
                {scene.acts.map((act, idx) => {
                  const isActive = idx === 0;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      role="tab"
                      data-s2-card={String(idx)}
                      aria-selected={isActive}
                      onClick={() => handleManualActClick(idx as 0 | 1 | 2)}
                      className={isActive ? ACTIVE_CARD_CLS : INACTIVE_CARD_CLS}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.13em] text-[#8A6631] whitespace-nowrap">
                          {act.badge}
                        </span>
                        <span className="shrink-0 text-right whitespace-nowrap">
                          <span className="font-serif text-sm xl:text-base font-normal text-[#0F5F6E]">
                            {act.metricValue}
                          </span>{" "}
                          <span className="hidden sm:inline font-sans text-[10px] xl:text-[11px] text-[#4B5D66]">
                            {act.metricLabel}
                          </span>
                        </span>
                      </div>
                      <div className="mt-0.5 font-serif text-base xl:text-lg text-[#13232C] leading-snug">
                        {act.title}
                      </div>
                      <p
                        data-s2-desc
                        className={`${
                          isActive ? "" : "hidden"
                        } mt-1 text-xs xl:text-[13px] leading-relaxed text-[#4B5D66]`}
                      >
                        {act.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Progress Bar + CTA */}
              <div className="mt-3.5 lg:mt-4 flex items-center gap-3.5">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#13232C]/15">
                  <div
                    ref={progressBarRef}
                    className="h-full w-full origin-left rounded-full bg-[#0F5F6E] will-change-transform"
                    style={{ transform: "scaleX(0.05)" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectServiceForBooking("implants");
                    smoothScrollTo("#booking");
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0F5F6E] px-4.5 text-[11px] xl:text-xs font-semibold uppercase tracking-[0.12em] text-[#FFFDFA] hover:bg-[#0B3A45] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Plan Implant Visit</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column (58% — True 16:9 Centered Stage Fitted to Available Viewport Height) */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex items-center justify-center">
              <div className="w-full max-w-[540px] lg:max-w-[860px] aspect-[16/9] max-h-[30svh] sm:max-h-[38svh] lg:max-h-[calc(100vh-116px)]">
                <ScrollSequenceStage
                  scene={scene}
                  eager={false}
                  onActChange={applyActDom}
                  progressBarRef={progressBarRef}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
