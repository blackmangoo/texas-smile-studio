"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DENTAL_SERVICES } from "@/data/clinicData";
import { ServiceIcon, ArrowUpRightIcon } from "@/components/icons/DentalIcons";
import { smoothScrollTo } from "@/lib/scrollBus";
import type { ServiceId } from "@/lib/bookingSchema";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ServicesBentoSectionProps {
  onSelectServiceForBooking: (serviceId: ServiceId) => void;
}

export function ServicesBentoSection({
  onSelectServiceForBooking,
}: ServicesBentoSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  // GSAP ScrollTrigger Entrance Animation for Section Header and Individual Bento Cards
  useGSAP(
    () => {
      const headerEl = headerRef.current;
      const gridEl = gridRef.current;
      if (!headerEl || !gridEl) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      // Header fade-up
      gsap.from(headerEl.children, {
        scrollTrigger: {
          trigger: headerEl,
          start: "top 85%",
          once: true,
        },
        y: 35,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
      });

      // Staggered entrance as cards scroll into the viewport
      const cards = gridEl.querySelectorAll<HTMLElement>("[data-bento-card]");
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 35, opacity: 0 },
          {
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              once: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
          }
        );
      });
    },
    { scope: sectionRef }
  );

  // Interactive Specular Spotlight tracking on cursor hover
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const implants = DENTAL_SERVICES.find((s) => s.id === "implants")!;
  const aligners = DENTAL_SERVICES.find((s) => s.id === "aligners")!;
  const veneers = DENTAL_SERVICES.find((s) => s.id === "cosmetic-veneers")!;
  const rootCanal = DENTAL_SERVICES.find((s) => s.id === "gentle-root-canal")!;
  const whitening = DENTAL_SERVICES.find((s) => s.id === "optical-whitening")!;
  const pediatric = DENTAL_SERVICES.find((s) => s.id === "pediatric-family")!;

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby="services-heading"
      className="relative bg-[#F6F3EE] text-[#13232C] py-24 sm:py-32 overflow-hidden"
    >
      {/* Subtle architectural ambient background glow */}
      <div
        className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[#0F5F6E]/5 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-[#C8A26B]/8 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14 sm:mb-18"
        >
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8A6631]/30 bg-[#8A6631]/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6631] mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8A6631]" />
              <span>Six Specialties · One Calm Roof</span>
            </div>
            <h2
              id="services-heading"
              className="font-serif text-3xl sm:text-5xl lg:text-[52px] font-normal tracking-tight text-[#13232C] leading-[1.08]"
            >
              Unhurried by design.
              <br />
              <span className="text-[#0F5F6E]">Engineered for comfort.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg leading-relaxed text-[#4B5D66]">
              Every suite is reserved for one patient at a time — calm, private,
              and engineered with 3D precision so you never feel rushed or
              unheard.
            </p>
          </div>
        </div>

        {/* Architectural Bento Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
        >
          {/* CARD 1 (HERO BENTO): Guided Dental Implants (2 Columns on Desktop) */}
          <article
            data-bento-card
            onMouseMove={handleMouseMove}
            className="group relative md:col-span-2 lg:col-span-2 flex flex-col justify-between rounded-[28px] border border-[#E6E0D6] bg-[#FFFDFA] p-7 sm:p-9 shadow-[0_24px_50px_-30px_rgba(15,95,110,0.14)] hover:shadow-[0_32px_70px_-25px_rgba(15,95,110,0.24)] hover:border-[#0F5F6E]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Dynamic Cursor Spotlight Layer */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(500px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(15,95,110,0.08), transparent 70%)",
              }}
              aria-hidden="true"
            />

            {/* Background Watermark Numeral */}
            <span
              className="pointer-events-none absolute -bottom-6 right-6 font-serif text-[120px] sm:text-[150px] font-bold text-[#E6E0D6]/35 leading-none select-none transition-transform duration-500 group-hover:scale-105 group-hover:text-[#0F5F6E]/10"
              aria-hidden="true"
            >
              01
            </span>

            <div className="relative z-10">
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F5F6E]/10 text-[#0F5F6E] border border-[#0F5F6E]/20 group-hover:bg-[#0F5F6E] group-hover:text-[#FFFDFA] group-hover:scale-105 transition-all duration-300 shadow-xs">
                    <ServiceIcon serviceId="implants" className="w-6 h-6" />
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A6631] block">
                      Restorative Foundation
                    </span>
                    <span className="font-serif text-sm text-[#4B5D66]">
                      Flagship Specialty
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-[#DCEFEC] px-3.5 py-1 text-xs font-semibold text-[#0F5F6E]">
                  {implants.accentTag}
                </span>
              </div>

              {/* Title & Editorial Tagline */}
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#13232C] group-hover:text-[#0F5F6E] transition-colors">
                {implants.title}
              </h3>
              <p className="mt-2 text-base font-medium text-[#13232C]/90 max-w-xl">
                {implants.tagline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5D66] max-w-xl">
                {implants.description}
              </p>

              {/* Clinical Specification Badges */}
              <div className="mt-5 flex flex-wrap gap-2">
                {implants.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#F6F3EE] px-3 py-1.5 text-xs font-medium text-[#13232C] border border-[#E6E0D6]/80"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F5F6E]" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Action Dock */}
            <div className="relative z-10 mt-7 pt-5 border-t border-[#E6E0D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-[#4B5D66]">
                <span className="font-semibold text-[#13232C]">
                  {implants.duration}
                </span>{" "}
                · <span>{implants.comfortNote}</span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => smoothScrollTo(implants.linkedSceneAnchor)}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#13232C]/20 bg-[#F6F3EE] px-4 text-xs font-semibold text-[#13232C] hover:border-[#0F5F6E] hover:text-[#0F5F6E] transition-colors cursor-pointer"
                >
                  <span>3D Assembly</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectServiceForBooking("implants");
                    smoothScrollTo("#booking");
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0F5F6E] px-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#FFFDFA] hover:bg-[#0B3A45] shadow-sm transition-all cursor-pointer"
                >
                  <span>Book Implants</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </article>

          {/* CARD 2: Braces & Clear Aligners (1 Column) */}
          <article
            data-bento-card
            onMouseMove={handleMouseMove}
            className="group relative flex flex-col justify-between rounded-[28px] border border-[#E6E0D6] bg-[#FFFDFA] p-7 sm:p-8 shadow-[0_24px_50px_-30px_rgba(15,95,110,0.14)] hover:shadow-[0_32px_70px_-25px_rgba(15,95,110,0.24)] hover:border-[#0F5F6E]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99,230,217,0.12), transparent 70%)",
              }}
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -bottom-6 right-6 font-serif text-[120px] font-bold text-[#E6E0D6]/35 leading-none select-none transition-transform duration-500 group-hover:scale-105 group-hover:text-[#0F5F6E]/10"
              aria-hidden="true"
            >
              02
            </span>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCEFEC] text-[#0F5F6E] border border-[#0F5F6E]/20 group-hover:bg-[#0F5F6E] group-hover:text-[#FFFDFA] group-hover:scale-105 transition-all duration-300 shadow-xs">
                  <ServiceIcon serviceId="aligners" className="w-6 h-6" />
                </span>
                <span className="rounded-full bg-[#DCEFEC] px-3.5 py-1 text-xs font-semibold text-[#0F5F6E]">
                  {aligners.accentTag}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#13232C] group-hover:text-[#0F5F6E] transition-colors">
                {aligners.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-[#13232C]/90">
                {aligners.tagline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5D66]">
                {aligners.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {aligners.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F6F3EE] px-2.5 py-1 text-xs font-medium text-[#13232C] border border-[#E6E0D6]/70"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#0F5F6E]" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-5 border-t border-[#E6E0D6]">
              <div className="text-xs text-[#4B5D66] mb-3">
                <span className="font-semibold text-[#13232C]">
                  {aligners.duration}
                </span>{" "}
                · {aligners.comfortNote}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => smoothScrollTo(aligners.linkedSceneAnchor)}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-full border border-[#13232C]/20 bg-[#F6F3EE] px-3 text-xs font-semibold text-[#13232C] hover:border-[#0F5F6E] hover:text-[#0F5F6E] transition-colors cursor-pointer"
                >
                  3D Scan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectServiceForBooking("aligners");
                    smoothScrollTo("#booking");
                  }}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#0F5F6E] px-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#FFFDFA] hover:bg-[#0B3A45] shadow-xs transition-all cursor-pointer"
                >
                  <span>Book</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>

          {/* CARD 3: Cosmetic Porcelain Veneers (1 Column) */}
          <article
            data-bento-card
            onMouseMove={handleMouseMove}
            className="group relative flex flex-col justify-between rounded-[28px] border border-[#E6E0D6] bg-[#FFFDFA] p-7 sm:p-8 shadow-[0_24px_50px_-30px_rgba(15,95,110,0.14)] hover:shadow-[0_32px_70px_-25px_rgba(138,102,49,0.24)] hover:border-[#8A6631]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(200,162,107,0.14), transparent 70%)",
              }}
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -bottom-6 right-6 font-serif text-[120px] font-bold text-[#E6E0D6]/35 leading-none select-none transition-transform duration-500 group-hover:scale-105 group-hover:text-[#8A6631]/10"
              aria-hidden="true"
            >
              03
            </span>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EBDD] text-[#8A6631] border border-[#8A6631]/20 group-hover:bg-[#8A6631] group-hover:text-[#FFFDFA] group-hover:scale-105 transition-all duration-300 shadow-xs">
                  <ServiceIcon serviceId="cosmetic-veneers" className="w-6 h-6" />
                </span>
                <span className="rounded-full bg-[#F3EBDD] px-3.5 py-1 text-xs font-semibold text-[#8A6631]">
                  {veneers.accentTag}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#13232C] group-hover:text-[#8A6631] transition-colors">
                {veneers.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-[#13232C]/90">
                {veneers.tagline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5D66]">
                {veneers.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {veneers.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F6F3EE] px-2.5 py-1 text-xs font-medium text-[#13232C] border border-[#E6E0D6]/70"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#8A6631]" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-5 border-t border-[#E6E0D6]">
              <div className="text-xs text-[#4B5D66] mb-3">
                <span className="font-semibold text-[#13232C]">
                  {veneers.duration}
                </span>{" "}
                · {veneers.comfortNote}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => smoothScrollTo(veneers.linkedSceneAnchor)}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-full border border-[#13232C]/20 bg-[#F6F3EE] px-3 text-xs font-semibold text-[#13232C] hover:border-[#8A6631] hover:text-[#8A6631] transition-colors cursor-pointer"
                >
                  3D View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectServiceForBooking("cosmetic-veneers");
                    smoothScrollTo("#booking");
                  }}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#8A6631] px-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#FFFDFA] hover:bg-[#6D4F23] shadow-xs transition-all cursor-pointer"
                >
                  <span>Book</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>

          {/* CARD 4: Gentle Microscopic Root Canal (1 Column) */}
          <article
            data-bento-card
            onMouseMove={handleMouseMove}
            className="group relative flex flex-col justify-between rounded-[28px] border border-[#E6E0D6] bg-[#FFFDFA] p-7 sm:p-8 shadow-[0_24px_50px_-30px_rgba(15,95,110,0.14)] hover:shadow-[0_32px_70px_-25px_rgba(15,95,110,0.24)] hover:border-[#0F5F6E]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(15,95,110,0.1), transparent 70%)",
              }}
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -bottom-6 right-6 font-serif text-[120px] font-bold text-[#E6E0D6]/35 leading-none select-none transition-transform duration-500 group-hover:scale-105 group-hover:text-[#0F5F6E]/10"
              aria-hidden="true"
            >
              04
            </span>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCEFEC] text-[#0F5F6E] border border-[#0F5F6E]/20 group-hover:bg-[#0F5F6E] group-hover:text-[#FFFDFA] group-hover:scale-105 transition-all duration-300 shadow-xs">
                  <ServiceIcon serviceId="gentle-root-canal" className="w-6 h-6" />
                </span>
                <span className="rounded-full bg-[#DCEFEC] px-3.5 py-1 text-xs font-semibold text-[#0F5F6E]">
                  {rootCanal.accentTag}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#13232C] group-hover:text-[#0F5F6E] transition-colors">
                {rootCanal.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-[#13232C]/90">
                {rootCanal.tagline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5D66]">
                {rootCanal.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {rootCanal.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F6F3EE] px-2.5 py-1 text-xs font-medium text-[#13232C] border border-[#E6E0D6]/70"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#0F5F6E]" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-5 border-t border-[#E6E0D6]">
              <div className="text-xs text-[#4B5D66] mb-3">
                <span className="font-semibold text-[#13232C]">
                  {rootCanal.duration}
                </span>{" "}
                · {rootCanal.comfortNote}
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectServiceForBooking("gentle-root-canal");
                  smoothScrollTo("#booking");
                }}
                className="w-full inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#0F5F6E] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#FFFDFA] hover:bg-[#0B3A45] shadow-xs transition-all cursor-pointer"
              >
                <span>Book Single Visit</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>

          {/* CARD 5: Cold-Light Enamel Whitening (1 Column) */}
          <article
            data-bento-card
            onMouseMove={handleMouseMove}
            className="group relative flex flex-col justify-between rounded-[28px] border border-[#E6E0D6] bg-[#FFFDFA] p-7 sm:p-8 shadow-[0_24px_50px_-30px_rgba(15,95,110,0.14)] hover:shadow-[0_32px_70px_-25px_rgba(15,95,110,0.24)] hover:border-[#0F5F6E]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99,230,217,0.12), transparent 70%)",
              }}
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -bottom-6 right-6 font-serif text-[120px] font-bold text-[#E6E0D6]/35 leading-none select-none transition-transform duration-500 group-hover:scale-105 group-hover:text-[#0F5F6E]/10"
              aria-hidden="true"
            >
              05
            </span>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCEFEC] text-[#0F5F6E] border border-[#0F5F6E]/20 group-hover:bg-[#0F5F6E] group-hover:text-[#FFFDFA] group-hover:scale-105 transition-all duration-300 shadow-xs">
                  <ServiceIcon serviceId="optical-whitening" className="w-6 h-6" />
                </span>
                <span className="rounded-full bg-[#DCEFEC] px-3.5 py-1 text-xs font-semibold text-[#0F5F6E]">
                  {whitening.accentTag}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#13232C] group-hover:text-[#0F5F6E] transition-colors">
                {whitening.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-[#13232C]/90">
                {whitening.tagline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5D66]">
                {whitening.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {whitening.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F6F3EE] px-2.5 py-1 text-xs font-medium text-[#13232C] border border-[#E6E0D6]/70"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#0F5F6E]" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-5 border-t border-[#E6E0D6]">
              <div className="text-xs text-[#4B5D66] mb-3">
                <span className="font-semibold text-[#13232C]">
                  {whitening.duration}
                </span>{" "}
                · {whitening.comfortNote}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => smoothScrollTo(whitening.linkedSceneAnchor)}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-full border border-[#13232C]/20 bg-[#F6F3EE] px-3 text-xs font-semibold text-[#13232C] hover:border-[#0F5F6E] hover:text-[#0F5F6E] transition-colors cursor-pointer"
                >
                  3D View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectServiceForBooking("optical-whitening");
                    smoothScrollTo("#booking");
                  }}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#0F5F6E] px-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#FFFDFA] hover:bg-[#0B3A45] shadow-xs transition-all cursor-pointer"
                >
                  <span>Book</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>

          {/* CARD 6 (SANCTUARY BENTO): Pediatric & Family Sanctuary (Full Width 3 Columns) */}
          <article
            data-bento-card
            onMouseMove={handleMouseMove}
            className="group relative md:col-span-2 lg:col-span-3 flex flex-col lg:flex-row lg:items-center justify-between rounded-[28px] border border-[#E6E0D6] bg-gradient-to-br from-[#FFFDFA] via-[#FFFDFA] to-[#F7E4D8]/35 p-7 sm:p-9 shadow-[0_24px_50px_-30px_rgba(168,74,51,0.14)] hover:shadow-[0_32px_70px_-25px_rgba(168,74,51,0.24)] hover:border-[#A84A33]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(238,138,111,0.12), transparent 70%)",
              }}
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -bottom-6 right-6 font-serif text-[120px] sm:text-[150px] font-bold text-[#E6E0D6]/35 leading-none select-none transition-transform duration-500 group-hover:scale-105 group-hover:text-[#A84A33]/10"
              aria-hidden="true"
            >
              06
            </span>

            <div className="relative z-10 lg:max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7E4D8] text-[#A84A33] border border-[#A84A33]/20 group-hover:bg-[#A84A33] group-hover:text-[#FFFDFA] group-hover:scale-105 transition-all duration-300 shadow-xs">
                  <ServiceIcon serviceId="pediatric-family" className="w-6 h-6" />
                </span>
                <span className="rounded-full bg-[#F7E4D8] px-3.5 py-1 text-xs font-semibold text-[#A84A33]">
                  {pediatric.accentTag}
                </span>
                <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-[#A84A33]">
                  Ages 1 to 17
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#13232C] group-hover:text-[#A84A33] transition-colors">
                {pediatric.title}
              </h3>
              <p className="mt-2 text-base font-medium text-[#13232C]/90">
                {pediatric.tagline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5D66]">
                {pediatric.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {pediatric.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFFDFA] px-3 py-1.5 text-xs font-medium text-[#13232C] border border-[#E6E0D6]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A84A33]" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6 lg:mt-0 pt-5 lg:pt-0 border-t lg:border-t-0 border-[#E6E0D6] flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
              <div className="text-xs text-[#4B5D66] text-left sm:text-right">
                <div className="font-semibold text-[#13232C]">
                  {pediatric.duration}
                </div>
                <div className="text-xs text-[#A84A33] mt-0.5">
                  {pediatric.comfortNote}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => smoothScrollTo(pediatric.linkedSceneAnchor)}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#13232C]/20 bg-[#FFFDFA] px-4 text-xs font-semibold text-[#13232C] hover:border-[#A84A33] hover:text-[#A84A33] transition-colors cursor-pointer"
                >
                  Sanctuary Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectServiceForBooking("pediatric-family");
                    smoothScrollTo("#booking");
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#A84A33] px-6 text-xs font-semibold uppercase tracking-[0.1em] text-[#FFFDFA] hover:bg-[#8A3B28] shadow-sm transition-all cursor-pointer"
                >
                  <span>Book Family Visit</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
