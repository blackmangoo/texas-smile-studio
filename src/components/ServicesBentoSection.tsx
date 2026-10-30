"use client";

import React from "react";
import { DENTAL_SERVICES } from "@/data/clinicData";
import { ServiceIcon, ArrowUpRightIcon } from "@/components/icons/DentalIcons";
import { smoothScrollTo } from "@/lib/scrollBus";
import type { ServiceId } from "@/lib/bookingSchema";

interface ServicesBentoSectionProps {
  onSelectServiceForBooking: (serviceId: ServiceId) => void;
}

export function ServicesBentoSection({
  onSelectServiceForBooking,
}: ServicesBentoSectionProps) {
  const handleCardPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${(-y * 3.5).toFixed(
      2
    )}deg) rotateY(${(x * 3.5).toFixed(2)}deg) translateY(-4px)`;
  };

  const handleCardPointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="bg-[#F6F3EE] text-[#13232C] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Section Header + Unhurried Philosophy Trio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-7">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6631] mb-3">
              Six Comprehensive Specialties · One Calm Roof
            </span>
            <h2
              id="services-heading"
              className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#13232C] leading-[1.1]"
            >
              Unhurried by design.
              <br />
              <span className="text-[#0F5F6E]">
                Engineered around your comfort.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg leading-relaxed text-[#4B5D66]">
              Whether you are visiting for a 60-second digital scan, clear
              aligners, a single-visit microscopic root canal, or your child’s
              first happy checkup, every suite is scheduled for one patient at a
              time.
            </p>
          </div>
        </div>

        {/* 6-Service Architectural Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {DENTAL_SERVICES.map((service) => {
            const chipClasses =
              service.accentTone === "lagoon"
                ? "bg-[#DCEFEC] text-[#0F5F6E]"
                : service.accentTone === "bronze"
                ? "bg-[#F3EBDD] text-[#8A6631]"
                : "bg-[#F7E4D8] text-[#A84A33]";

            return (
              <article
                key={service.id}
                onPointerMove={handleCardPointerMove}
                onPointerLeave={handleCardPointerLeave}
                className="group relative flex flex-col justify-between rounded-[24px] border border-[#E6E0D6] bg-[#FFFDFA] p-7 sm:p-8 shadow-[0_30px_60px_-35px_rgba(15,95,110,0.22)] transition-transform duration-300 ease-out"
              >
                <div>
                  {/* Top Row: Number, Custom SVG Line Icon, Accent Pill */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6F3EE] text-[#0F5F6E] border border-[#E6E0D6] group-hover:bg-[#0F5F6E] group-hover:text-[#FFFDFA] transition-colors">
                        <ServiceIcon serviceId={service.id} className="w-6 h-6" />
                      </span>
                      <span className="font-serif text-sm text-[#8A6631]">
                        /{service.number}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide ${chipClasses}`}
                    >
                      {service.accentTag}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-serif text-2xl font-normal text-[#13232C] group-hover:text-[#0F5F6E] transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#13232C]/90">
                    {service.tagline}
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#4B5D66]">
                    {service.description}
                  </p>

                  {/* 3 Clinical Highlights */}
                  <ul className="mt-5 space-y-2 border-t border-[#E6E0D6] pt-4 text-sm text-[#13232C]">
                    {service.highlights.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F5F6E]"
                          aria-hidden="true"
                        />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Comfort Meta + Action Buttons */}
                <div className="mt-6 border-t border-[#E6E0D6] pt-5">
                  <div className="flex items-center justify-between text-xs text-[#4B5D66] mb-4">
                    <span className="font-semibold text-[#13232C]">
                      {service.duration}
                    </span>
                    <span className="text-right">{service.comfortNote}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectServiceForBooking(service.id);
                        smoothScrollTo("#booking");
                      }}
                      className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0F5F6E] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#FFFDFA] hover:bg-[#0B3A45] transition-colors cursor-pointer"
                    >
                      <span>Book {service.title.split(" ").slice(-1)[0]}</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => smoothScrollTo(service.linkedSceneAnchor)}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[#13232C]/25 px-4 text-xs font-semibold text-[#13232C] hover:border-[#0F5F6E] hover:text-[#0F5F6E] transition-colors cursor-pointer"
                    >
                      3D View
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
