"use client";

import React, { useState, useEffect, useRef } from "react";
import { smoothScrollTo } from "@/lib/scrollBus";
import { ArrowUpRightIcon } from "@/components/icons/DentalIcons";

const NAV_LINKS = [
  { label: "Home", href: "#hero-stage" },
  { label: "Services", href: "#services" },
  { label: "Craftsmanship", href: "#craftsmanship" },
  { label: "3D Technology", href: "#technology" },
  { label: "Results & Team", href: "#transformations" },
  { label: "Kids & Family", href: "#kids-family" },
  { label: "FAQ", href: "#faq" },
] as const;

export function Navbar() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Zero-React-re-render scroll styling via imperative data attribute
  useEffect(() => {
    let lastState = false;
    const onScroll = () => {
      const isPast = window.scrollY > 48;
      if (isPast !== lastState && headerRef.current) {
        lastState = isPast;
        headerRef.current.dataset.scrolled = isPast ? "true" : "false";
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    smoothScrollTo(href);
  };

  return (
    <header
      ref={headerRef}
      data-scrolled="false"
      className="fixed top-0 left-0 right-0 z-50 bg-transparent text-[#FFFDFA] transition-colors duration-300 data-[scrolled=true]:bg-[#13232C]/95 data-[scrolled=true]:border-b data-[scrolled=true]:border-white/10 data-[scrolled=true]:shadow-lg"
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Brand Wordmark with Custom Sculpted Medallion Emblem */}
        <button
          type="button"
          onClick={() => handleNavClick("#hero-stage")}
          className="group flex items-center gap-2.5 sm:gap-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63E6D9] cursor-pointer"
          aria-label="Texas Smile Studio — Return to top"
        >
          <img
            src="/brand/logo-emblem.webp"
            alt="Texas Smile Studio Emblem"
            width={44}
            height={44}
            className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
          />
          <span className="flex flex-col">
            <span className="font-serif text-base sm:text-xl font-normal tracking-tight text-[#FFFDFA] leading-none whitespace-nowrap">
              Texas Smile Studio
            </span>
            <span className="hidden sm:block mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#C8A26B]">
              Dallas · Architectural Dentistry
            </span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {NAV_LINKS.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNavClick(item.href)}
              className="py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#EAF7FA]/90 hover:text-[#C8A26B] transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <a
            href="tel:+12145550192"
            className="hidden xl:inline-flex items-center text-xs font-medium tracking-[0.08em] text-[#EAF7FA]/85 hover:text-white px-3 py-2"
          >
            (214) 555-0192
          </a>

          <button
            type="button"
            onClick={() => handleNavClick("#booking")}
            className="inline-flex h-11 items-center gap-1.5 sm:gap-2 rounded-full border border-white/45 bg-white/10 px-3.5 sm:px-5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-[#FFFDFA] hover:bg-[#FFFDFA] hover:text-[#13232C] transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Schedule Now</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
          </button>

          {/* Accessible Mobile Menu Button (44x44px min target) */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="inline-flex lg:hidden h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <>
                  <path d="M6 6L18 18" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7H20" />
                  <path d="M4 12H20" />
                  <path d="M4 17H14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-label="Mobile Navigation"
          className="lg:hidden border-b border-white/15 bg-[#0A1C24] px-6 py-6 text-[#FFFDFA] shadow-2xl"
        >
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className="flex h-12 items-center justify-between rounded-xl px-4 text-left text-base font-medium text-[#EAF7FA] hover:bg-white/10"
              >
                <span>{item.label}</span>
                <ArrowUpRightIcon className="w-4 h-4 text-[#C8A26B]" />
              </button>
            ))}
            <div className="mt-4 pt-4 border-t border-white/15 flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+12145550192"
                className="flex h-12 items-center justify-center rounded-full border border-white/30 px-5 text-sm font-medium text-[#EAF7FA]"
              >
                Call Dallas Studio · (214) 555-0192
              </a>
              <button
                type="button"
                onClick={() => handleNavClick("#booking")}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#C8A26B] px-6 text-sm font-semibold text-[#13232C]"
              >
                <span>Book Your Visit</span>
                <ArrowUpRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
