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
 *      Native GPU compositor CSS `position: sticky` track driven by a frame-rate-independent
 *      exponential critically-damped `requestAnimationFrame` interpolator (`1 - exp(-15 * dt)`).
 *      Eliminates `position: fixed` reparenting jumps AND GSAP scroll-tween phase jitter on
 *      60Hz/120Hz iOS Safari & Android Chrome, auto-sleeping at 0% CPU when settled.
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

    // 2. Phones & Touch Tablets (`<= 1023px` or `(hover: none) and (pointer: coarse)`)
    mm.add(
      `(max-width: 1023px) and (prefers-reduced-motion: no-preference), (hover: none) and (pointer: coarse) and (prefers-reduced-motion: no-preference)`,
      () => {
        let rafId = 0;
        let lastFrameTs = 0;
        let lastScrollEventTs = 0;
        let smoothed = -1;
        let stageHeight = stageContainerEl.offsetHeight || window.innerHeight;

        const ro =
          typeof ResizeObserver !== "undefined"
            ? new ResizeObserver(() => {
                stageHeight =
                  stageContainerEl.offsetHeight || window.innerHeight;
              })
            : null;
        ro?.observe(stageContainerEl);

        const computeRawProgress = (): {
          raw: number;
          inRange: boolean;
        } => {
          // Read geometry at the start of rAF before any DOM mutations (clean layout, zero forced reflow)
          const rect = trackEl.getBoundingClientRect();
          const travel = Math.max(1, rect.height - stageHeight);
          const raw = Math.max(0, Math.min(1, -rect.top / travel));
          const inRange =
            rect.bottom > -stageHeight * 0.5 &&
            rect.top < stageHeight * 1.5;
          return { raw, inRange };
        };

        const tick = (now: number) => {
          rafId = 0;
          const { raw, inRange } = computeRawProgress();

          if (smoothed < 0) {
            smoothed = raw;
          } else {
            const dt =
              lastFrameTs > 0
                ? Math.min(0.05, Math.max(0.004, (now - lastFrameTs) * 0.001))
                : 1 / 60;
            // Frame-rate-independent exponential glide (tau ~ 67ms):
            // silky frame-by-frame stepping on both 60Hz and 120Hz ProMotion touchscreens
            const alpha = 1 - Math.exp(-15 * dt);
            smoothed += (raw - smoothed) * alpha;
          }
          lastFrameTs = now;

          const diff = Math.abs(raw - smoothed);
          const recentlyScrolled = now - lastScrollEventTs < 120;

          if (diff < 0.0002 && !recentlyScrolled) {
            smoothed = raw;
          }

          if (!stageNode) stageNode = resolveStageNode();
          stageNode?.__setSceneProgress?.(smoothed, true);

          if (inRange && (diff >= 0.0002 || recentlyScrolled)) {
            rafId = requestAnimationFrame(tick);
          } else {
            lastFrameTs = 0;
          }
        };

        const wakeLoop = () => {
          lastScrollEventTs = performance.now();
          if (rafId === 0) {
            rafId = requestAnimationFrame(tick);
          }
        };

        // Sync initial resting position immediately on mount
        const init = computeRawProgress();
        smoothed = init.raw;
        if (!stageNode) stageNode = resolveStageNode();
        stageNode?.__setSceneProgress?.(smoothed, true);

        window.addEventListener("scroll", wakeLoop, { passive: true });
        window.addEventListener("touchmove", wakeLoop, { passive: true });
        window.addEventListener("orientationchange", wakeLoop, {
          passive: true,
        });

        return () => {
          if (rafId) cancelAnimationFrame(rafId);
          ro?.disconnect();
          window.removeEventListener("scroll", wakeLoop);
          window.removeEventListener("touchmove", wakeLoop);
          window.removeEventListener("orientationchange", wakeLoop);
        };
      }
    );

    return () => mm.revert();
  }, [sceneId, scrollLengthVh, stageContainerRef, trackRef]);
}
