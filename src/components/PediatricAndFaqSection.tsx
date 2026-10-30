"use client";

import React, { useState } from "react";
import { FAQ_ITEMS } from "@/data/clinicData";
import { smoothScrollTo } from "@/lib/scrollBus";
import { ArrowUpRightIcon, ServiceIcon } from "@/components/icons/DentalIcons";
import type { ServiceId } from "@/lib/bookingSchema";

interface PediatricAndFaqSectionProps {
  onSelectServiceForBooking: (serviceId: ServiceId) => void;
}

const PEDIATRIC_PILLARS = [
  {
    title: "Tell-Show-Do Gentle Onboarding",
    body: "Kids test the 'starlight camera' on their fingernail first. We never rush a child who wants an extra minute to ask questions.",
  },
  {
    title: "Parent-Beside-Chair Sanctuary",
    body: "Parents are always welcome right beside the suite chair, with warm blankets, ceiling story cinema, and kid-sized noise-canceling headphones.",
  },
  {
    title: "BPA-Free Sealants & Honey-Mineral Varnish",
    body: "Protective molar shields and nano-hydroxyapatite or gentle fluoride varnishes that strengthen growing enamel without bitter tastes.",
  },
] as const;

const PATIENT_REVIEWS = [
  {
    id: "rev-1",
    quote:
      "I avoided the dentist for seven years after a painful experience elsewhere. Here I watched a film on the ceiling, never felt the numbing, and saw my 3D scan in sixty seconds.",
    author: "Patient Review Placeholder — Uptown Dallas",
    treatment: "Microscopic Root Therapy & Porcelain Crown",
  },
  {
    id: "rev-2",
    quote:
      "My six-year-old actually asked when she gets to go back. The pediatric suite felt like a calm storybook studio instead of a cold clinic.",
    author: "Parent Review Placeholder — Highland Park",
    treatment: "Pediatric Happy Visit & Protective Sealants",
  },
  {
    id: "rev-3",
    quote:
      "Every fee was shown on paper before we started, my PPO benefit was calculated to the dollar, and my 0.3mm veneers look completely natural.",
    author: "Patient Review Placeholder — Preston Hollow",
    treatment: "Minimal-Prep Veneers & Cold-Light Whitening",
  },
] as const;

export function PediatricAndFaqSection({
  onSelectServiceForBooking,
}: PediatricAndFaqSectionProps) {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  return (
    <>
      {/* 1. Kids & Family Sanctuary Band on Warm Blush (#F7E4D8) & Honey (#F2C38B) */}
      <section
        id="kids-family"
        aria-labelledby="kids-heading"
        className="bg-[#F7E4D8] text-[#13232C] py-24 sm:py-28 border-t border-b border-[#E6E0D6]"
      >
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="rounded-[32px] bg-gradient-to-br from-[#FFFDFA] via-[#F7E4D8] to-[#F2C38B]/45 border border-[#E6E0D6] p-8 sm:p-12 lg:p-16 shadow-[0_30px_60px_-35px_rgba(168,74,51,0.2)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F2C38B] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#13232C] mb-4">
                  <ServiceIcon serviceId="pediatric-family" className="w-4 h-4" />
                  <span>Kids & Family Sanctuary · Ages 1 to 17</span>
                </div>
                <h2
                  id="kids-heading"
                  className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#13232C] leading-[1.08]"
                >
                  Where children grow up
                  <br />
                  <span className="text-[#A84A33]">never fearing the dentist.</span>
                </h2>
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#4B5D66]">
                  Pediatric dentistry doesn’t need cartoon clutter or loud
                  waiting rooms. We created a warm, sunlit Dallas family wing
                  where curious kids feel safe, heard, and proud of their teeth.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectServiceForBooking("pediatric-family");
                      smoothScrollTo("#booking");
                    }}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#13232C] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#FFFDFA] hover:bg-[#0F5F6E] transition-colors cursor-pointer"
                  >
                    <span>Book a Child or Family Visit</span>
                    <ArrowUpRightIcon className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-[#A84A33]">
                    Side-by-side parent + child block times available
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 gap-4">
                {PEDIATRIC_PILLARS.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#E6E0D6] bg-[#FFFDFA] p-5 sm:p-6"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2C38B] text-xs font-bold text-[#13232C]">
                        0{i + 1}
                      </span>
                      <h3 className="font-serif text-xl text-[#13232C]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#4B5D66]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Patient Impressions + Insurance & Membership + FAQ on Porcelain (#F6F3EE) */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="bg-[#F6F3EE] text-[#13232C] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          {/* Patient Stories */}
          <div className="mb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6631] mb-2">
                  Patient Impressions · Dallas
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#13232C]">
                  Calm stays with you.
                </h2>
              </div>
              <p className="text-xs text-[#4B5D66]">
                [Verified Review Placeholders — Replace with clinic Google Business
                Profile embed prior to launch]
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PATIENT_REVIEWS.map((rev) => (
                <article
                  key={rev.id}
                  className="flex flex-col justify-between rounded-[24px] border border-[#E6E0D6] bg-[#FFFDFA] p-7 shadow-[0_24px_50px_-35px_rgba(15,95,110,0.2)]"
                >
                  <div>
                    <div className="flex items-center gap-1 text-[#8A6631] text-sm mb-4" aria-label="5 out of 5 stars">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                    <p className="font-serif text-lg leading-relaxed text-[#13232C]">
                      “{rev.quote}”
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#E6E0D6]">
                    <div className="text-xs font-semibold text-[#13232C]">
                      {rev.author}
                    </div>
                    <div className="text-xs text-[#0F5F6E] mt-0.5">
                      {rev.treatment}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Transparent Insurance & Membership Trio */}
          <div className="mb-24 rounded-[28px] border border-[#E6E0D6] bg-[#FFFDFA] p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5">
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#0F5F6E] mb-2">
                  Zero Surprise Billing
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#13232C]">
                  Clear pricing before we ever begin.
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#4B5D66]">
                  We verify your benefits before you arrive and hand you a clear
                  written summary at your visit.
                </p>
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-[#F6F3EE] p-5 border border-[#E6E0D6]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0F5F6E]">
                    01 · PPO Insurance
                  </span>
                  <h3 className="mt-1.5 font-serif text-xl text-[#13232C]">
                    All Major PPOs Welcome
                  </h3>
                  <p className="mt-2 text-sm text-[#4B5D66]">
                    Delta Dental, Cigna, Aetna, MetLife, BCBS, and Guardian
                    filed electronically on your behalf.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F6F3EE] p-5 border border-[#E6E0D6]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8A6631]">
                    02 · Studio Membership
                  </span>
                  <h3 className="mt-1.5 font-serif text-xl text-[#13232C]">
                    $39 / mo Wellness Plan
                  </h3>
                  <p className="mt-2 text-sm text-[#4B5D66]">
                    Includes 2 cleanings, annual 3D optical scan, digital X-rays,
                    and 15% off all restorative care.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F6F3EE] p-5 border border-[#E6E0D6]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#A84A33]">
                    03 · Flexible Monthly
                  </span>
                  <h3 className="mt-1.5 font-serif text-xl text-[#13232C]">
                    0% APR for 12–24 Mos
                  </h3>
                  <p className="mt-2 text-sm text-[#4B5D66]">
                    Instant soft-credit check for implants, veneers, and clear
                    aligners with zero prepayment penalty.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Item Accessible FAQ Accordion */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6631] mb-2">
                Frequently Asked Questions
              </span>
              <h2
                id="faq-heading"
                className="font-serif text-3xl sm:text-4xl font-normal text-[#13232C]"
              >
                Answers for unhurried decisions.
              </h2>
              <p className="mt-3 text-base text-[#4B5D66]">
                Have a specific question before booking? Call our Uptown Dallas
                concierge desk directly at{" "}
                <a
                  href="tel:+12145550192"
                  className="font-semibold text-[#0F5F6E] underline"
                >
                  (214) 555-0192
                </a>
                .
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#E6E0D6] rounded-[24px] border border-[#E6E0D6] bg-[#FFFDFA] px-6 sm:px-8">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                const panelId = `faq-panel-${idx}`;
                const btnId = `faq-btn-${idx}`;
                return (
                  <div key={item.question} className="py-5">
                    <h3>
                      <button
                        id={btnId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() =>
                          setOpenFaqIdx((prev) => (prev === idx ? null : idx))
                        }
                        className="flex w-full items-center justify-between gap-4 text-left font-serif text-lg sm:text-xl font-normal text-[#13232C] hover:text-[#0F5F6E] cursor-pointer py-1"
                      >
                        <span>{item.question}</span>
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6E0D6] text-sm transition-transform duration-200 ${
                            isOpen
                              ? "rotate-45 bg-[#0F5F6E] text-[#FFFDFA]"
                              : "bg-[#F6F3EE] text-[#13232C]"
                          }`}
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </button>
                    </h3>
                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        className="mt-3 pr-8 text-[15px] leading-relaxed text-[#4B5D66]"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
