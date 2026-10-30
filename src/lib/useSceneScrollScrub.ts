"use client";

import { useEffect } from "react";
import type React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const TOUCH_STICKY_MEDIA_QUERY =
  "(max-width: 1023px), (hover: none) and (pointer: coarse)";

export const DESKTOP_PIN_MEDIA_QUERY =
  "(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)";

type StageElementWithSetter = HTMLDivElement & {
  __setSceneProgress?: (progress01: number, syncInRaf?: boolean) => void;
};

interface UseSceneScrollScrubOptions {
  sceneId: string;
  scrollLengthVh: number;
  trackRef: React.RefObject<HTMLDivElement | null>;
  stageContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Dual-path 60/120Hz scene scrub controller:
 *  - Desktop / Laptop (`(min-width: 1024px) and (hover: hover)`):
 *      GSAP ScrollTrigger `pin: true, scrub: 0.35` paired with Lenis smooth wheel/trackpad inertia.
 *  - Phone / Tablet (`(max-width: 1023px)` or `(hover: none) and (pointer: coarse)`):
 *      Native GPU compositor CSS `position: sticky` track driven by a ZERO-REFLOW (`window.scrollY`
 *      against `ResizeObserver`-cached offsets) frame-rate-independent exponential `rAF` damper.
 */
export function useSceneScrollScrub({
  sceneId,
  scrollLengthVh,
  trackRef,
  stageContainerRef,
}: UseSceneScrollScrubOptions): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const trackEl = trackRef.current;
    const stageContainerEl = stageContainerRef.current;
    if (!trackEl || !stageContainerEl) return;

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMq.matches) return;

    const resolveStageNode = (): StageElementWithSetter | null =>
      stageContainerEl.querySelector<StageElementWithSetter>(
        `[data-scene-stage="${sceneId}"]`
      );

    let stageNode = resolveStageNode();

    const mm = gsap.matchMedia();

    // 1. Desktop & Touchscreen Laptops with Trackpad/Mouse (`hover: hover` + `>= 1024px`)
    mm.add(DESKTOP_PIN_MEDIA_QUERY, () => {
      const trigger = ScrollTrigger.create({
        trigger: stageContainerEl,
        start: "top top",
        end: `+=${scrollLengthVh}%`,
        pin: true,
        scrub: 0.35,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (!stageNode) stageNode = resolveStageNode();
          stageNode?.__setSceneProgress?.(self.progress, true);
        },
      });
      return () => trigger.kill();
    });

    // 2. Phones & Touch Tablets — Zero-Reflow `window.scrollY` Exponential Damper
    mm.add(
      `(max-width: 1023px) and (prefers-reduced-motion: no-preference), (hover: none) and (pointer: coarse) and (prefers-reduced-motion: no-preference)`,
      () => {
        let rafId = 0;
        let lastFrameTs = 0;
        let lastScrollEventTs = 0;
        let smoothed = -1;

        // Cached layout geometry — updated ONLY on ResizeObserver / orientationchange, NEVER during scroll!
        let trackTopDoc = 0;
        let travelPx = 1;
        let stageHeight = window.innerHeight;

        const measureGeometry = () => {
          const rect = trackEl.getBoundingClientRect();
          const sy = window.scrollY;
          stageHeight = stageContainerEl.offsetHeight || window.innerHeight;
          trackTopDoc = rect.top + sy;
          travelPx = Math.max(1, rect.height - stageHeight);
        };

        measureGeometry();

        const ro =
          typeof ResizeObserver !== "undefined"
            ? new ResizeObserver(() => {
                measureGeometry();
              })
            : null;
        ro?.observe(document.documentElement);
        ro?.observe(trackEl);

        const tick = (now: number) => {
          rafId = 0;
          const sy = window.scrollY;
          const raw = Math.max(0, Math.min(1, (sy - trackTopDoc) / travelPx));

          if (smoothed < 0) {
            smoothed = raw;
          } else {
            const dt =
              lastFrameTs > 0
                ? Math.min(0.05, Math.max(0.004, (now - lastFrameTs) * 0.001))
                : 1 / 60;
            const alpha = 1 - Math.exp(-16 * dt);
            smoothed += (raw - smoothed) * alpha;
          }
          lastFrameTs = now;

          const diff = Math.abs(raw - smoothed);
          const recentlyScrolled = now - lastScrollEventTs < 100;

          if (diff < 0.00025 && !recentlyScrolled) {
            smoothed = raw;
          }

          if (!stageNode) stageNode = resolveStageNode();
          stageNode?.__setSceneProgress?.(smoothed, true);

          const inActiveBand =
            sy >= trackTopDoc - stageHeight * 0.75 &&
            sy <= trackTopDoc + travelPx + stageHeight * 0.75;

          if (inActiveBand && (diff >= 0.00025 || recentlyScrolled)) {
            rafId = requestAnimationFrame(tick);
          } else {
            lastFrameTs = 0;
          }
        };

        const onScroll = () => {
          const sy = window.scrollY;
          // Fast bailout for off-screen scenes: zero rAF wakeups when scene isn't near viewport!
          if (
            sy < trackTopDoc - stageHeight * 0.9 ||
            sy > trackTopDoc + travelPx + stageHeight * 0.9
          ) {
            if (smoothed > 0 && sy < trackTopDoc - stageHeight * 0.9) {
              smoothed = 0;
              stageNode?.__setSceneProgress?.(0, true);
            } else if (
              smoothed < 1 &&
              sy > trackTopDoc + travelPx + stageHeight * 0.9
            ) {
              smoothed = 1;
              stageNode?.__setSceneProgress?.(1, true);
            }
            return;
          }
          lastScrollEventTs = performance.now();
          if (rafId === 0) {
            rafId = requestAnimationFrame(tick);
          }
        };

        const onOrientation = () => {
          measureGeometry();
          onScroll();
        };

        // Sync initial resting position immediately on mount
        const initRaw = Math.max(
          0,
          Math.min(1, (window.scrollY - trackTopDoc) / travelPx)
        );
        smoothed = initRaw;
        if (!stageNode) stageNode = resolveStageNode();
        stageNode?.__setSceneProgress?.(smoothed, true);

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("orientationchange", onOrientation, {
          passive: true,
        });

        return () => {
          if (rafId) cancelAnimationFrame(rafId);
          ro?.disconnect();
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("orientationchange", onOrientation);
        };
      }
    );

    return () => mm.revert();
  }, [sceneId, scrollLengthVh, stageContainerRef, trackRef]);
}
