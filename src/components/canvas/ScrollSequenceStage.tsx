"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ScrollSceneConfig } from "@/data/clinicData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollSequenceStageProps {
  scene: ScrollSceneConfig;
  eager?: boolean;
  className?: string;
  onActChange?: (actIndex: 0 | 1 | 2) => void;
  progressBarRef?: React.RefObject<HTMLDivElement | null>;
  actStepManual?: 0 | 1 | 2 | null;
}

function formatFrameUrl(dir: string, oneBasedIndex: number): string {
  const num = String(oneBasedIndex).padStart(4, "0");
  return `${dir}/frame_${num}.webp`;
}

export function ScrollSequenceStage({
  scene,
  eager = false,
  className = "",
  onActChange,
  progressBarRef,
  actStepManual = null,
}: ScrollSequenceStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedMaskRef = useRef<Uint8Array>(new Uint8Array(0));
  const inFlightMaskRef = useRef<Uint8Array>(new Uint8Array(0));

  const targetFrameRef = useRef<number>(0);
  const drawnFrameRef = useRef<number>(-1);
  const activeActRef = useRef<0 | 1 | 2>(0);
  const isMobileTierRef = useRef<boolean>(false);
  const totalFramesRef = useRef<number>(scene.desktop.frameCount);
  const frameDirRef = useRef<string>(scene.desktop.dir);
  const loadingStartedRef = useRef<boolean>(false);

  const [posterReady, setPosterReady] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  /**
   * Finds the nearest loaded frame index to `desiredIdx` (0-based)
   * so scrubbing never blanks or flashes even while streaming.
   */
  const findNearestLoadedIndex = useCallback((desiredIdx: number): number => {
    const mask = loadedMaskRef.current;
    const total = mask.length;
    if (total === 0) return -1;
    const clamped = Math.max(0, Math.min(total - 1, desiredIdx));
    if (mask[clamped] === 1) return clamped;

    for (let delta = 1; delta < total; delta++) {
      const prev = clamped - delta;
      if (prev >= 0 && mask[prev] === 1) return prev;
      const next = clamped + delta;
      if (next < total && mask[next] === 1) return next;
    }
    return -1;
  }, []);

  /**
   * Draws a specific 0-based frame onto the canvas with cover/contain math
   * and zero DOM layout reads inside the hot path.
   */
  const drawFrame = useCallback(
    (desiredIdx: number, forceRedraw = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const bestIdx = findNearestLoadedIndex(desiredIdx);
      if (bestIdx < 0) return;
      if (!forceRedraw && bestIdx === drawnFrameRef.current) return;

      const img = imagesRef.current[bestIdx];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      const cw = canvas.width;
      const ch = canvas.height;
      if (cw === 0 || ch === 0) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill background with exact calibrated section color before drawing
      ctx.fillStyle = scene.sectionBgHex;
      ctx.fillRect(0, 0, cw, ch);

      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.min(cw / iw, ch / ih);
      const dw = Math.round(iw * scale);
      const dh = Math.round(ih * scale);
      const dx = Math.round((cw - dw) * 0.5);
      const dy = Math.round((ch - dh) * 0.5);

      ctx.drawImage(img, dx, dy, dw, dh);
      drawnFrameRef.current = bestIdx;
      if (!posterReady) setPosterReady(true);
    },
    [findNearestLoadedIndex, posterReady, scene.sectionBgHex]
  );

  /**
   * Public imperative progress setter called by parent GSAP ScrollTrigger `onUpdate`.
   * Zero React state updates unless the discrete act index (0, 1, 2) changes.
   */
  const setProgressImperative = useCallback(
    (progress01: number) => {
      const p = Math.max(0, Math.min(1, progress01));
      const total = totalFramesRef.current;
      const frameIdx = Math.min(total - 1, Math.round(p * (total - 1)));
      targetFrameRef.current = frameIdx;
      drawFrame(frameIdx, false);

      if (progressBarRef?.current) {
        progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      }

      const nextAct: 0 | 1 | 2 = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
      if (nextAct !== activeActRef.current) {
        activeActRef.current = nextAct;
        onActChange?.(nextAct);
      }
    },
    [drawFrame, onActChange, progressBarRef]
  );

  // Expose imperative setter on the DOM node so parent ScrollTrigger can call it without re-renders
  useEffect(() => {
    const el = containerRef.current as
      | (HTMLDivElement & { __setSceneProgress?: (p: number) => void })
      | null;
    if (el) {
      el.__setSceneProgress = setProgressImperative;
    }
  }, [setProgressImperative]);

  // Handle manual act selection (used in reduced-motion mode or when clicking act tabs)
  useEffect(() => {
    if (actStepManual === null || actStepManual === undefined) return;
    const keyProgress = actStepManual === 0 ? 0.04 : actStepManual === 1 ? 0.5 : 0.96;
    setProgressImperative(keyProgress);
  }, [actStepManual, setProgressImperative]);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Size canvas backing store on mount and width resize only (ignores mobile address bar height jitter)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let lastWidth = 0;

    const updateCanvasSize = (force = false) => {
      const rect = container.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width === 0 || height === 0) return;
      if (!force && Math.abs(width - lastWidth) < 2) return;
      lastWidth = width;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.min(1920, Math.round(width * dpr));
      const targetH = Math.min(1080, Math.round(height * dpr));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        drawnFrameRef.current = -1;
        drawFrame(targetFrameRef.current, true);
      }
    };

    updateCanvasSize(true);
    let timer: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => updateCanvasSize(false), 90);
    });
    ro.observe(container);

    return () => {
      if (timer) clearTimeout(timer);
      ro.disconnect();
    };
  }, [drawFrame]);

  // Scroll-priority progressive loader with IntersectionObserver gate for non-hero scenes
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const isMobile = window.innerWidth < 768;
    isMobileTierRef.current = isMobile;
    const tier = isMobile ? scene.mobile : scene.desktop;
    const total = tier.frameCount;
    totalFramesRef.current = total;
    frameDirRef.current = tier.dir;

    imagesRef.current = new Array(total).fill(null);
    loadedMaskRef.current = new Uint8Array(total);
    inFlightMaskRef.current = new Uint8Array(total);
    loadingStartedRef.current = false;

    const loadSingleFrame = (idx0: number): Promise<void> => {
      return new Promise((resolve) => {
        if (
          cancelled ||
          loadedMaskRef.current[idx0] === 1 ||
          inFlightMaskRef.current[idx0] === 1
        ) {
          resolve();
          return;
        }
        inFlightMaskRef.current[idx0] = 1;
        const img = new Image();
        img.decoding = "async";
        img.src = formatFrameUrl(tier.dir, idx0 + 1);

        const finalize = () => {
          if (cancelled) {
            resolve();
            return;
          }
          imagesRef.current[idx0] = img;
          loadedMaskRef.current[idx0] = 1;
          inFlightMaskRef.current[idx0] = 0;

          // If this newly decoded frame is closer to the current scroll target than what's drawn, redraw immediately!
          const curTarget = targetFrameRef.current;
          const curDrawn = drawnFrameRef.current;
          if (
            curDrawn < 0 ||
            Math.abs(idx0 - curTarget) <= Math.abs(curDrawn - curTarget)
          ) {
            drawFrame(curTarget, true);
          }
          resolve();
        };

        img.onload = () => {
          if (typeof img.decode === "function") {
            img.decode().then(finalize).catch(finalize);
          } else {
            finalize();
          }
        };
        img.onerror = () => {
          inFlightMaskRef.current[idx0] = 0;
          resolve();
        };
      });
    };

    const startStreaming = async () => {
      if (loadingStartedRef.current || cancelled) return;
      loadingStartedRef.current = true;

      // 1. Load frame 0, midpoint, and end frame first so even reduced-motion or fast jumps have anchors
      await loadSingleFrame(0);
      if (cancelled) return;

      // 2. Load 18 stride keyframes across the timeline (every 10th frame)
      const strideIndices: number[] = [];
      const step = Math.max(1, Math.floor(total / 18));
      for (let i = 0; i < total; i += step) {
        if (loadedMaskRef.current[i] === 0) strideIndices.push(i);
      }
      if (loadedMaskRef.current[total - 1] === 0) {
        strideIndices.push(total - 1);
      }

      // Run a dynamic concurrency pool of 6 workers that always picks the unloaded frame
      // closest to `targetFrameRef.current` (with stride keyframes prioritized first)
      const pickNextFrame = (strideOnly: boolean): number => {
        const target = targetFrameRef.current;
        let bestIdx = -1;
        let bestDist = Infinity;

        if (strideOnly) {
          for (const idx of strideIndices) {
            if (
              loadedMaskRef.current[idx] === 0 &&
              inFlightMaskRef.current[idx] === 0
            ) {
              const d = Math.abs(idx - target);
              if (d < bestDist) {
                bestDist = d;
                bestIdx = idx;
              }
            }
          }
          if (bestIdx >= 0) return bestIdx;
        }

        for (let i = 0; i < total; i++) {
          if (
            loadedMaskRef.current[i] === 0 &&
            inFlightMaskRef.current[i] === 0
          ) {
            const d = Math.abs(i - target);
            if (d < bestDist) {
              bestDist = d;
              bestIdx = i;
            }
          }
        }
        return bestIdx;
      };

      const worker = async () => {
        while (!cancelled) {
          let nextIdx = pickNextFrame(true);
          if (nextIdx < 0) {
            nextIdx = pickNextFrame(false);
          }
          if (nextIdx < 0) break;
          await loadSingleFrame(nextIdx);
        }
      };

      const concurrency = isMobile ? 4 : 6;
      await Promise.all(Array.from({ length: concurrency }, () => worker()));
    };

    if (eager) {
      startStreaming();
      return () => {
        cancelled = true;
      };
    }

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      startStreaming();
      return () => {
        cancelled = true;
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startStreaming();
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "125% 0px 125% 0px" }
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [drawFrame, eager, scene]);

  return (
    <div
      ref={containerRef}
      data-scene-stage={scene.id}
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
      style={{ backgroundColor: scene.sectionBgHex }}
      role="img"
      aria-label={scene.title}
    >
      {/* Instant high-res poster fallback until Frame 1 paints on canvas */}
      <picture
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          posterReady ? "opacity-0" : "opacity-100"
        }`}
        style={{
          WebkitMaskImage: scene.canvasMaskCss,
          maskImage: scene.canvasMaskCss,
        }}
      >
        <source media="(max-width: 767px)" srcSet={scene.mobile.poster} />
        <img
          src={scene.desktop.poster}
          alt={scene.title}
          className="w-full h-full object-contain"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
        />
      </picture>

      {/* Hardware-accelerated 2D Scrubbing Canvas with 360-degree elliptical radial feather */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none block w-full h-full"
        style={{
          WebkitMaskImage: scene.canvasMaskCss,
          maskImage: scene.canvasMaskCss,
        }}
      />

      {/* Accessible Reduced-Motion Keyframe Switcher (shown only when OS prefers-reduced-motion is active) */}
      {reducedMotion && (
        <div className="pointer-events-auto absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-white/25 bg-[#0A1C24]/90 px-3.5 py-1.5 text-xs text-white shadow-lg">
          <span className="opacity-85 whitespace-nowrap">Reduced motion:</span>
          {[0, 1, 2].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setProgressImperative(step * 0.48)}
              className="rounded-full px-2.5 py-1 font-medium bg-white/15 hover:bg-white/30 transition-colors cursor-pointer whitespace-nowrap"
            >
              Stage {step + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
