"use client";

import React, { useState, useRef } from "react";
import { TRANSFORMATION_CASES, DOCTORS } from "@/data/clinicData";
import { smoothScrollTo } from "@/lib/scrollBus";
import { ArrowUpRightIcon } from "@/components/icons/DentalIcons";

export function BeforeAfterAndDoctorsSection() {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [sliderPct, setSliderPct] = useState(52);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const activeCase = TRANSFORMATION_CASES[selectedCaseIdx];

  const updateFromClientX = (clientX: number) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setSliderPct(Math.max(5, Math.min(95, Math.round(raw))));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPct((v) => Math.max(5, v - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPct((v) => Math.min(95, v + 5));
    } else if (e.key === "Home") {
      e.preventDefault();
      setSliderPct(10);
    } else if (e.key === "End") {
      e.preventDefault();
      setSliderPct(90);
    }
  };

  return (
    <section
      id="transformations"
      aria-labelledby="transformations-heading"
      className="bg-[#F6F3EE] text-[#13232C] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Part 1: Interactive Before / After Optical Comparator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6631] mb-3">
              Restorative & Shade Architecture
            </span>
            <h2
              id="transformations-heading"
              className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#13232C] leading-[1.08]"
            >
              Natural translucency.
              <br />
              <span className="text-[#0F5F6E]">Never opaque chalk.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#4B5D66]">
              Drag the optical comparator to inspect how aligner arch expansion,
              0.3mm lithium-disilicate veneers, and cold-light hydroxyapatite
              whitening restore symmetry and natural B1 incisal opalescence.
            </p>

            {/* Case Selector Tabs */}
            <div className="mt-6 space-y-2.5" role="tablist" aria-label="Smile Transformation Cases">
              {TRANSFORMATION_CASES.map((c, idx) => {
                const isSelected = selectedCaseIdx === idx;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedCaseIdx(idx)}
                    className={`w-full text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FFFDFA] border-[#0F5F6E] shadow-[0_20px_45px_-28px_rgba(15,95,110,0.3)]"
                        : "bg-[#FFFDFA]/55 border-[#E6E0D6] hover:bg-[#FFFDFA]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8A6631]">
                      <span>{c.category}</span>
                      <span className="text-[#0F5F6E]">{c.duration}</span>
                    </div>
                    <div className="mt-1 font-serif text-lg text-[#13232C]">
                      {c.title}
                    </div>
                    {isSelected && (
                      <p className="mt-1 text-sm text-[#4B5D66]">{c.summary}</p>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-[#4B5D66]">
              Digital restorative simulation · Individual clinical results vary by case.
            </p>
          </div>

          {/* Right Column: Interactive Before / After Slider */}
          <div className="lg:col-span-7">
            <div className="rounded-[28px] border border-[#E6E0D6] bg-[#FFFDFA] p-4 sm:p-6 shadow-[0_30px_60px_-30px_rgba(15,95,110,0.22)]">
              <div
                ref={stageRef}
                onPointerDown={(e) => {
                  draggingRef.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  updateFromClientX(e.clientX);
                }}
                onPointerMove={(e) => {
                  if (!draggingRef.current) return;
                  updateFromClientX(e.clientX);
                }}
                onPointerUp={() => {
                  draggingRef.current = false;
                }}
                onPointerCancel={() => {
                  draggingRef.current = false;
                }}
                className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#010304] select-none cursor-ew-resize touch-none"
              >
                {/* AFTER Layer (Full width underneath: B1 Pearl Aligned Arch) */}
                <picture className="pointer-events-none absolute inset-0 h-full w-full">
                  <source
                    media="(max-width: 767px)"
                    srcSet="/frames/scene-03-scan-whitening/mobile/frame_v3_0144.webp"
                  />
                  <img
                    src="/frames/scene-03-scan-whitening/desktop/frame_0180.webp"
                    alt={`After treatment — ${activeCase.afterShade}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </picture>

                {/* BEFORE Layer (Clipped to sliderPct: Pre-alignment / warm shade) */}
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPct}% 0 0)` }}
                >
                  <picture className="block h-full w-full">
                    <source
                      media="(max-width: 767px)"
                      srcSet="/frames/scene-03-scan-whitening/mobile/frame_v3_0048.webp"
                    />
                    <img
                      src="/frames/scene-03-scan-whitening/desktop/frame_0060.webp"
                      alt={`Before treatment — ${activeCase.beforeShade}`}
                      loading="lazy"
                      className="h-full w-full object-cover sepia-[0.22] brightness-95"
                      draggable={false}
                    />
                  </picture>
                </div>

                {/* Top Corner Badges */}
                <div className="pointer-events-none absolute top-4 left-4 rounded-full bg-[#0A1C24]/85 border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-[#EAF7FA]">
                  Before · {activeCase.beforeShade}
                </div>
                <div className="pointer-events-none absolute top-4 right-4 rounded-full bg-[#0F5F6E]/90 border border-[#63E6D9]/40 px-3.5 py-1.5 text-xs font-semibold text-[#FFFDFA]">
                  After · {activeCase.afterShade}
                </div>

                {/* Vertical Divider Hairline + Accessible Keyboard Slider Handle */}
                <div
                  style={{ left: `${sliderPct}%` }}
                  className="absolute top-0 bottom-0 -translate-x-1/2 w-0.5 bg-[#C8A26B]"
                >
                  <div
                    role="slider"
                    tabIndex={0}
                    aria-label="Before and after smile transformation comparison slider"
                    aria-valuemin={5}
                    aria-valuemax={95}
                    aria-valuenow={sliderPct}
                    onKeyDown={handleKeyDown}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C8A26B] bg-[#13232C] text-[#FFFDFA] shadow-xl focus-visible:outline-2 focus-visible:outline-[#63E6D9]"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path d="M7 6L3 10L7 14" />
                      <path d="M13 6L17 10L13 14" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom Case Comparison Readout */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-[#F6F3EE] p-3.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8A6631]">
                    Initial Presentation
                  </span>
                  <p className="mt-1 text-[#13232C]">{activeCase.beforeDetails}</p>
                </div>
                <div className="rounded-xl bg-[#DCEFEC]/55 p-3.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0F5F6E]">
                    Completed Outcome
                  </span>
                  <p className="mt-1 text-[#13232C]">{activeCase.afterDetails}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Doctors & Clinical Leadership */}
        <div className="mt-28 pt-20 border-t border-[#E6E0D6]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6631] mb-3">
                Clinical Leadership · Dallas Studio
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#13232C]">
                Specialists who listen first.
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#4B5D66]">
              Board-certified prosthodontic, implant, and pediatric clinicians
              dedicated to unhurried, one-on-one care in Uptown Dallas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {DOCTORS.map((doc) => (
              <article
                key={doc.id}
                className="flex flex-col justify-between rounded-[24px] border border-[#E6E0D6] bg-[#FFFDFA] p-7 sm:p-8 shadow-[0_30px_60px_-35px_rgba(15,95,110,0.2)]"
              >
                <div>
                  {/* Architectural Portrait Monogram Header */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#135865] font-serif text-2xl text-[#FFFDFA] border border-[#C8A26B]/40">
                      {doc.monogram}
                    </div>
                    <span className="rounded-full bg-[#F3EBDD] px-3 py-1 text-xs font-semibold text-[#8A6631]">
                      {doc.role}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-normal text-[#13232C]">
                    {doc.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#0F5F6E]">
                    {doc.credentials}
                  </p>
                  <p className="mt-2 text-xs text-[#4B5D66]">{doc.education}</p>

                  <blockquote className="mt-5 border-l-2 border-[#C8A26B] pl-4 font-serif text-base italic text-[#13232C]/90 leading-relaxed">
                    “{doc.quote}”
                  </blockquote>
                </div>

                <div className="mt-6 pt-5 border-t border-[#E6E0D6]">
                  <div className="flex flex-wrap gap-2">
                    {doc.specialties.map((sp) => (
                      <span
                        key={sp}
                        className="rounded-full bg-[#F6F3EE] px-3 py-1 text-xs font-medium text-[#4B5D66]"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => smoothScrollTo("#booking")}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#0F5F6E] hover:text-[#13232C] cursor-pointer"
                  >
                    <span>Request consultation with {doc.name.split(",")[0]}</span>
                    <ArrowUpRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
