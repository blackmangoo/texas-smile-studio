"use client";

import React, { useRef, useCallback } from "react";
import { SCROLL_SCENES } from "@/data/clinicData";
import { ScrollSequenceStage } from "@/components/canvas/ScrollSequenceStage";
import { smoothScrollTo } from "@/lib/scrollBus";
import { useSceneScrollScrub } from "@/lib/useSceneScrollScrub";
import { ArrowUpRightIcon } from "@/components/icons/DentalIcons";
import type { ServiceId } from "@/lib/bookingSchema";

interface TechnologyWhiteningSectionProps {
  onSelectServiceForBooking: (serviceId: ServiceId) => void;
}

const ACTIVE_S3_CARD_CLS =
  "block w-full text-left rounded-2xl px-4 py-3 xl:px-4.5 xl:py-3.5 transition-colors cursor-pointer border bg-[#0A1C24] border-[#63E6D9]/55";
const INACTIVE_S3_CARD_CLS =
  "hidden lg:block w-full text-left rounded-2xl px-4 py-2.5 xl:px-4.5 xl:py-3 transition-colors cursor-pointer border bg-white/[0.03] border-white/10 hover:bg-white/[0.06]";

export function TechnologyWhiteningSection({
  onSelectServiceForBooking,
}: TechnologyWhiteningSectionProps) {
  const scene = SCROLL_SCENES["scene-03-scan-whitening"];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const activeActRef = useRef<0 | 1 | 2>(0);

  const applyActDom = useCallback((actIdx: 0 | 1 | 2) => {
    activeActRef.current = actIdx;
    const root = pinRef.current;
    if (!root) return;
    root.dataset.act = String(actIdx);

    root
      .querySelectorAll<HTMLButtonElement>("[data-s3-mob-tab]")
      .forEach((btn) => {
        const active = btn.dataset.s3MobTab === String(actIdx);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.className = active
          ? "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer bg-[#63E6D9] text-[#0A1C24]"
          : "flex-1 rounded-full py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer bg-white/10 text-[#EAF7FA]";
      });

    root
      .querySelectorAll<HTMLButtonElement>("[data-s3-card]")
      .forEach((card) => {
        const active = card.dataset.s3Card === String(actIdx);
        card.setAttribute("aria-selected", active ? "true" : "false");
        card.className = active ? ACTIVE_S3_CARD_CLS : INACTIVE_S3_CARD_CLS;
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
        HTMLDivElement & {
          __setSceneProgress?: (p: number, syncInRaf?: boolean) => void;
        }
      >('[data-scene-stage="scene-03-scan-whitening"]');
      const p = idx === 0 ? 0.04 : idx === 1 ? 0.5 : 0.96;
      stageNode?.__setSceneProgress?.(p, true);
    },
    [applyActDom]
  );

  useSceneScrollScrub({
    sceneId: "scene-03-scan-whitening",
    scrollLengthVh: scene.scrollLengthVh,
    trackRef,
    stageContainerRef: pinRef,
  });

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
            {/* Left Column (58% — True 16:9 Centered Stage Fitted to Available Viewport Height) */}
            <div className="lg:col-span-7 flex items-center justify-center">
              <div className="w-full max-w-[540px] lg:max-w-[860px] aspect-[16/9] max-h-[29svh] sm:max-h-[37svh] lg:max-h-[calc(100vh-116px)]">
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
              <span className="inline-flex items-center gap-2 rounded-full border border-[#63E6D9]/35 bg-[#63E6D9]/10 px-3 py-1 text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.15em] text-[#63E6D9] mb-2">
                {scene.eyebrow}
              </span>
              <h2
                id="technology-heading"
                className="font-serif text-2xl sm:text-3xl lg:text-[34px] xl:text-[40px] font-normal tracking-tight text-[#EAF7FA] leading-[1.08]"
              >
                A 3D scan in under a minute.{" "}
                <span className="text-[#63E6D9]">No goop, no guesswork.</span>
              </h2>
              <p className="scene-compact-hide hidden sm:block mt-2 text-xs sm:text-sm xl:text-[15px] leading-relaxed text-[#9FB7BE]">
                Watch our structured-light optical scanner map every cusp in
                real time, seat a custom-trimmed clear aligner, and finish with
                a cold-spectrum B1 pearl whitening sweep.
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
                className="mt-3 lg:mt-4 space-y-2"
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
                        isActive ? ACTIVE_S3_CARD_CLS : INACTIVE_S3_CARD_CLS
                      }
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.13em] text-[#63E6D9] whitespace-nowrap">
                          {act.badge}
                        </span>
                        <span className="shrink-0 text-right whitespace-nowrap">
                          <span className="font-serif text-sm xl:text-base text-[#C8A26B]">
                            {act.metricValue}
                          </span>{" "}
                          <span className="hidden sm:inline font-sans text-[10px] xl:text-[11px] text-[#9FB7BE]">
                            {act.metricLabel}
                          </span>
                        </span>
                      </div>
                      <div className="mt-0.5 font-serif text-base xl:text-lg text-[#EAF7FA] leading-snug">
                        {act.title}
                      </div>
                      <p
                        data-s3-desc
                        className={`${
                          isActive ? "" : "hidden"
                        } mt-1 text-xs xl:text-[13px] leading-relaxed text-[#9FB7BE]`}
                      >
                        {act.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Progress Bar + Action Buttons */}
              <div className="mt-3.5 lg:mt-4 flex flex-wrap items-center gap-3.5">
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
                      activeActRef.current === 2
                        ? "optical-whitening"
                        : "aligners"
                    );
                    smoothScrollTo("#booking");
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[#63E6D9] px-4.5 text-[11px] xl:text-xs font-semibold uppercase tracking-[0.12em] text-[#0A1C24] hover:bg-[#EAF7FA] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span data-s3-cta-label>Book 3D Scan</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
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
