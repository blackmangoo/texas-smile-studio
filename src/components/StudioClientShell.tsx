"use client";

import React, { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { registerLenis } from "@/lib/scrollBus";
import type { ServiceId } from "@/lib/bookingSchema";
import { Navbar } from "@/components/Navbar";
import { HeroSceneSection } from "@/components/HeroSceneSection";
import { ServicesBentoSection } from "@/components/ServicesBentoSection";
import { ImplantCraftsmanshipSection } from "@/components/ImplantCraftsmanshipSection";
import { TechnologyWhiteningSection } from "@/components/TechnologyWhiteningSection";
import { BeforeAfterAndDoctorsSection } from "@/components/BeforeAfterAndDoctorsSection";
import { PediatricAndFaqSection } from "@/components/PediatricAndFaqSection";
import { BookingAndFooterSection } from "@/components/BookingAndFooterSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Prevent iOS Safari / Android Chrome URL-bar collapse from triggering mid-swipe ScrollTrigger.refresh() jank
  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
  });
}

export function StudioClientShell() {
  const [selectedService, setSelectedService] = useState<ServiceId>("implants");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarseTouch = window.matchMedia("(pointer: coarse)").matches;

    // On touch phones/tablets, let native 60/120Hz hardware touch inertia run directly
    // without a redundant Lenis rAF ticker competing on the main thread.
    if (reducedMotion || isCoarseTouch) {
      registerLenis(null);
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
    });
    registerLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      registerLenis(null);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F3EE] text-[#13232C] selection:bg-[#0F5F6E] selection:text-[#FFFDFA]">
      <a
        href="#services"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-[#C8A26B] focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[#13232C]"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <HeroSceneSection />

        <ServicesBentoSection
          onSelectServiceForBooking={setSelectedService}
        />

        <ImplantCraftsmanshipSection
          onSelectServiceForBooking={setSelectedService}
        />

        <TechnologyWhiteningSection
          onSelectServiceForBooking={setSelectedService}
        />

        <BeforeAfterAndDoctorsSection />

        <PediatricAndFaqSection
          onSelectServiceForBooking={setSelectedService}
        />

        <BookingAndFooterSection
          selectedService={selectedService}
          onChangeService={setSelectedService}
        />
      </main>
    </div>
  );
}
