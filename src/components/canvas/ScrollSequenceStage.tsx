"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { ScrollSceneConfig } from "@/data/clinicData";

interface ScrollSequenceStageProps {
  scene: ScrollSceneConfig;
  eager?: boolean;
  className?: string;
  onActChange?: (actIndex: 0 | 1 | 2) => void;
  progressBarRef?: React.RefObject<HTMLDivElement | null>;
  actStepManual?: 0 | 1 | 2 | null;
}

type DecodedFrame = ImageBitmap | HTMLImageElement;

interface MobilePackIndex {
  count: number;
  totalBytes: number;
  frames: { o: number; l: number }[];
}

// Global scroll timestamp shared across all ScrollSequenceStage instances
// so an offscreen scene NEVER decodes frames while the user is actively scrolling ANYWHERE on the page!
let globalLastScrollTs = 0;
if (typeof window !== "undefined") {
  window.addEventListener(
    "scroll",
    () => {
      globalLastScrollTs = performance.now();
    },
    { passive: true }
  );
  window.addEventListener(
    "touchmove",
    () => {
      globalLastScrollTs = performance.now();
    },
    { passive: true }
  );
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
  const posterElRef = useRef<HTMLElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const framesRef = useRef<(DecodedFrame | null)[]>([]);
  const loadedMaskRef = useRef<Uint8Array>(new Uint8Array(0));
  const inFlightMaskRef = useRef<Uint8Array>(new Uint8Array(0));

  const targetFrameRef = useRef<number>(0);
  const smoothFrameRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  const drawnFrameRef = useRef<number>(-1);
  const activeActRef = useRef<0 | 1 | 2>(0);
  const totalFramesRef = useRef<number>(scene.desktop.frameCount);
  const isMobileRef = useRef<boolean>(false);
  const reducedMotionRef = useRef<boolean>(false);
  const loadingStartedRef = useRef<boolean>(false);
  const posterHiddenRef = useRef<boolean>(false);
  const rafIdRef = useRef<number>(0);
  const lastRafTimeRef = useRef<number>(0);
  const lastScrollTsRef = useRef<number>(0);

  const [isMobileTier, setIsMobileTier] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

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
   * 1:1 Hardware Pixel Blit (`< 0.15ms` on mobile GPU).
   */
  const blitIndex = useCallback(
    (desiredIdx: number, forceRedraw = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const bestIdx = findNearestLoadedIndex(desiredIdx);
      if (bestIdx < 0) return;

      if (!forceRedraw && bestIdx === drawnFrameRef.current) return;

      const frame = framesRef.current[bestIdx];
      if (!frame) return;

      let ctx = ctxRef.current;
      if (!ctx) {
        ctx = canvas.getContext("2d", { alpha: false });
        ctxRef.current = ctx;
      }
      if (!ctx) return;

      ctx.drawImage(frame, 0, 0);
      drawnFrameRef.current = bestIdx;

      if (!posterHiddenRef.current) {
        posterHiddenRef.current = true;
        if (posterElRef.current) {
          posterElRef.current.style.opacity = "0";
        }
      }
    },
    [findNearestLoadedIndex]
  );

  /**
   * Self-terminating VSync follower loop.
   * On mobile touch swipes, smoothly glides `smoothFrameRef` toward `targetFrameRef`
   * at 60/120fps so fast thumb flicks play silky consecutive frames just like laptop
   * Lenis wheel glide, then sleeps at 0% CPU the instant it settles.
   */
  const startFollowerLoop = useCallback(() => {
    if (rafIdRef.current !== 0) return;
    lastRafTimeRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(50, Math.max(4, now - lastRafTimeRef.current));
      lastRafTimeRef.current = now;

      const target = targetFrameRef.current;
      let nextFloat = target;

      if (isMobileRef.current && !reducedMotionRef.current) {
        const diff = target - smoothFrameRef.current;
        if (Math.abs(diff) > 0.22) {
          // Frame-rate-normalized exponential smoothing (matches laptop Lenis feel on 60Hz & 120Hz phones)
          const alpha = 1 - Math.pow(0.74, dt / 16.667);
          smoothFrameRef.current += diff * alpha;
          nextFloat = smoothFrameRef.current;
        } else {
          smoothFrameRef.current = target;
          nextFloat = target;
        }
      } else {
        smoothFrameRef.current = target;
      }

      const desiredInt = Math.round(nextFloat);
      blitIndex(desiredInt, false);

      if (progressBarRef?.current) {
        const total = Math.max(1, totalFramesRef.current - 1);
        const visualP = Math.max(0, Math.min(1, nextFloat / total));
        progressBarRef.current.style.transform = `scaleX(${visualP.toFixed(4)})`;
      }

      if (Math.abs(target - smoothFrameRef.current) > 0.22) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = 0;
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [blitIndex, progressBarRef]);

  /**
   * Imperative progress setter called by GSAP ScrollTrigger or manual Act buttons.
   */
  const setProgressImperative = useCallback(
    (progress01: number, snapImmediate = false) => {
      const p = Math.max(0, Math.min(1, progress01));
      const total = totalFramesRef.current;
      const exactIdx = Math.min(total - 1, Math.round(p * (total - 1)));

      targetProgressRef.current = p;
      targetFrameRef.current = exactIdx;
      lastScrollTsRef.current = performance.now();

      if (snapImmediate || reducedMotionRef.current) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = 0;
        }
        smoothFrameRef.current = exactIdx;
        blitIndex(exactIdx, true);
        if (progressBarRef?.current) {
          progressBarRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
        }
      } else {
        startFollowerLoop();
      }

      const nextAct: 0 | 1 | 2 = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
      if (nextAct !== activeActRef.current) {
        activeActRef.current = nextAct;
        onActChange?.(nextAct);
      }
    },
    [blitIndex, onActChange, progressBarRef, startFollowerLoop]
  );

  useEffect(() => {
    const el = containerRef.current as
      | (HTMLDivElement & {
          __setSceneProgress?: (p: number, snap?: boolean) => void;
        })
      | null;
    if (el) {
      el.__setSceneProgress = setProgressImperative;
    }
  }, [setProgressImperative]);

  useEffect(() => {
    if (actStepManual === null || actStepManual === undefined) return;
    const keyProgress =
      actStepManual === 0 ? 0.04 : actStepManual === 1 ? 0.5 : 0.96;
    setProgressImperative(keyProgress, true);
  }, [actStepManual, setProgressImperative]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      setReducedMotion(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Mobile Single-Pack Loader (1 HTTP request!) + Desktop Progressive Loader
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const mobile = window.innerWidth < 768;
    isMobileRef.current = mobile;
    setIsMobileTier(mobile);

    const tier = mobile ? scene.mobile : scene.desktop;
    const total = tier.frameCount;
    totalFramesRef.current = total;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = tier.width;
      canvas.height = tier.height;
      // Eagerly allocate the GPU 2D backing store on mount (never lazily on first scroll frame!)
      ctxRef.current = canvas.getContext("2d", { alpha: false });
      if (ctxRef.current) {
        ctxRef.current.fillStyle = scene.sectionBgHex;
        ctxRef.current.fillRect(0, 0, tier.width, tier.height);
      }
    }

    framesRef.current = new Array(total).fill(null);
    loadedMaskRef.current = new Uint8Array(total);
    inFlightMaskRef.current = new Uint8Array(total);
    drawnFrameRef.current = -1;
    loadingStartedRef.current = false;

    const supportsBitmap = typeof createImageBitmap === "function";

    const decodeBlob = async (blob: Blob): Promise<DecodedFrame | null> => {
      if (supportsBitmap) {
        try {
          return await createImageBitmap(blob);
        } catch {
          return null;
        }
      }
      const objUrl = URL.createObjectURL(blob);
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          URL.revokeObjectURL(objUrl);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objUrl);
          resolve(null);
        };
        img.src = objUrl;
      });
    };

    const storeDecodedFrame = (idx0: number, decoded: DecodedFrame | null) => {
      if (cancelled || !decoded) {
        if (decoded && "close" in decoded) decoded.close();
        inFlightMaskRef.current[idx0] = 0;
        return;
      }
      framesRef.current[idx0] = decoded;
      loadedMaskRef.current[idx0] = 1;
      inFlightMaskRef.current[idx0] = 0;

      const curTarget = Math.round(smoothFrameRef.current);
      const curDrawn = drawnFrameRef.current;
      if (
        curDrawn < 0 ||
        Math.abs(idx0 - curTarget) <= Math.abs(curDrawn - curTarget)
      ) {
        blitIndex(curTarget, curDrawn < 0);
      }
    };

    /**
     * MOBILE FAST PATH: 1 single binary pack fetch (`mobile-pack.bin`) instead of 96 HTTP requests!
     * Eliminates 100% of Wi-Fi / 4G HTTP/1.1 connection queueing.
     */
    const streamMobilePack = async () => {
      try {
        // Paint Frame 0 immediately from poster while the single 1-2 MB pack downloads
        const posterResp = await fetch(scene.mobile.poster, {
          cache: "force-cache",
        });
        if (posterResp.ok && !cancelled) {
          const posterBmp = await decodeBlob(await posterResp.blob());
          if (posterBmp && loadedMaskRef.current[0] === 0) {
            storeDecodedFrame(0, posterBmp);
          }
        }

        const baseDir = `/frames/${scene.id}`;
        const [idxResp, binResp] = await Promise.all([
          fetch(`${baseDir}/mobile-pack.json`, { cache: "force-cache" }),
          fetch(`${baseDir}/mobile-pack.bin`, { cache: "force-cache" }),
        ]);
        if (!idxResp.ok || !binResp.ok || cancelled) return;

        const packMeta = (await idxResp.json()) as MobilePackIndex;
        const arrayBuf = await binResp.arrayBuffer();
        if (cancelled) return;

        // Build priority decode order: 16 stride keyframes first, then remaining frames
        const count = Math.min(total, packMeta.frames.length);
        const strideSet = new Set<number>();
        const step = Math.max(1, Math.floor(count / 16));
        for (let i = 0; i < count; i += step) strideSet.add(i);
        strideSet.add(count - 1);

        // Decode Frame 0 immediately so canvas is live
        if (loadedMaskRef.current[0] === 0 && packMeta.frames[0]) {
          const e0 = packMeta.frames[0];
          const bmp0 = await decodeBlob(
            new Blob([arrayBuf.slice(e0.o, e0.o + e0.l)], { type: "image/webp" })
          );
          storeDecodedFrame(0, bmp0);
        }

        // Cooperatively decode 1 frame per slice, pausing whenever user's finger is scrolling ANYWHERE on the page!
        while (!cancelled) {
          const activelyScrolling =
            performance.now() - Math.max(lastScrollTsRef.current, globalLastScrollTs) <
            120;
          if (activelyScrolling) {
            await new Promise((r) => setTimeout(r, 60));
            continue;
          }

          const target = targetFrameRef.current;
          let bestIdx = -1;
          let bestDist = Infinity;

          // Prioritize unloaded stride keyframes first
          for (const sIdx of strideSet) {
            if (loadedMaskRef.current[sIdx] === 0) {
              const d = Math.abs(sIdx - target);
              if (d < bestDist) {
                bestDist = d;
                bestIdx = sIdx;
              }
            }
          }

          // Then fill in all remaining intermediate frames nearest the current scroll position
          if (bestIdx < 0) {
            for (let i = 0; i < count; i++) {
              if (loadedMaskRef.current[i] === 0) {
                const d = Math.abs(i - target);
                if (d < bestDist) {
                  bestDist = d;
                  bestIdx = i;
                }
              }
            }
          }

          if (bestIdx < 0) break;

          const batch: number[] = [bestIdx];
          for (let i = 0; i < count && batch.length < 2; i++) {
            if (loadedMaskRef.current[i] === 0 && i !== bestIdx) {
              batch.push(i);
            }
          }

          await Promise.all(
            batch.map(async (fIdx) => {
              const entry = packMeta.frames[fIdx];
              const slice = new Blob([arrayBuf.slice(entry.o, entry.o + entry.l)], {
                type: "image/webp",
              });
              const bmp = await decodeBlob(slice);
              storeDecodedFrame(fIdx, bmp);
            })
          );

          await new Promise((r) => setTimeout(r, 4));
        }
      } catch {
        // Fallback handled silently
      }
    };

    /**
     * DESKTOP PROGRESSIVE LOADER (1920x1080 WebP)
     */
    const streamDesktopFrames = async () => {
      const loadOne = async (idx0: number) => {
        if (
          cancelled ||
          loadedMaskRef.current[idx0] === 1 ||
          inFlightMaskRef.current[idx0] === 1
        ) {
          return;
        }
        inFlightMaskRef.current[idx0] = 1;
        try {
          const resp = await fetch(formatFrameUrl(tier.dir, idx0 + 1), {
            cache: "force-cache",
          });
          if (!resp.ok) {
            inFlightMaskRef.current[idx0] = 0;
            return;
          }
          const bmp = await decodeBlob(await resp.blob());
          storeDecodedFrame(idx0, bmp);
        } catch {
          inFlightMaskRef.current[idx0] = 0;
        }
      };

      await loadOne(0);
      if (cancelled) return;

      const strideIndices: number[] = [];
      const step = Math.max(1, Math.floor(total / 18));
      for (let i = 0; i < total; i += step) {
        if (loadedMaskRef.current[i] === 0) strideIndices.push(i);
      }
      if (loadedMaskRef.current[total - 1] === 0) {
        strideIndices.push(total - 1);
      }

      const pickNext = (strideOnly: boolean): number => {
        const target = targetFrameRef.current;
        let bestIdx = -1;
        let bestDist = Infinity;
        const pool = strideOnly ? strideIndices : null;
        if (pool) {
          for (const idx of pool) {
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
          return bestIdx;
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
          let next = pickNext(true);
          if (next < 0) next = pickNext(false);
          if (next < 0) break;
          await loadOne(next);
        }
      };
      await Promise.all(Array.from({ length: 6 }, () => worker()));
    };

    const startStreaming = () => {
      if (loadingStartedRef.current || cancelled) return;
      loadingStartedRef.current = true;
      if (mobile) {
        streamMobilePack();
      } else {
        streamDesktopFrames();
      }
    };

    if (eager) {
      startStreaming();
    } else if (mobile) {
      // On mobile, all 3 single-file packs total only 5.01 MB (3 HTTP requests total).
      // Stagger Scene 02 (+650ms) and Scene 03 (+1400ms) during initial idle time so
      // 0 network arrayBuffer() allocations ever fire mid-swipe on the first scroll down!
      const delayMs = scene.id === "scene-02-implant" ? 500 : 1200;
      const timer = setTimeout(() => {
        if (!cancelled) startStreaming();
      }, delayMs);
      return () => {
        cancelled = true;
        clearTimeout(timer);
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
        for (const f of framesRef.current) {
          if (f && "close" in f) f.close();
        }
      };
    } else {
      const el = containerRef.current;
      if (!el || typeof IntersectionObserver === "undefined") {
        startStreaming();
      } else {
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
          { rootMargin: "250% 0px 250% 0px" }
        );
        io.observe(el);
        return () => {
          cancelled = true;
          io.disconnect();
          if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = 0;
          for (const f of framesRef.current) {
            if (f && "close" in f) f.close();
          }
        };
      }
    }

    return () => {
      cancelled = true;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
      for (const f of framesRef.current) {
        if (f && "close" in f) f.close();
      }
    };
  }, [blitIndex, eager, scene]);

  const maskStyle = isMobileTier
    ? undefined
    : {
        WebkitMaskImage: scene.canvasMaskCss,
        maskImage: scene.canvasMaskCss,
      };

  return (
    <div
      ref={containerRef}
      data-scene-stage={scene.id}
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
      style={{ backgroundColor: scene.sectionBgHex }}
      role="img"
      aria-label={scene.title}
    >
      <picture
        ref={posterElRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-100"
        style={maskStyle}
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

      <canvas
        ref={canvasRef}
        className="pointer-events-none block w-full h-full object-contain"
        style={maskStyle}
      />

      {reducedMotion && (
        <div className="pointer-events-auto absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-white/25 bg-[#0A1C24]/90 px-3.5 py-1.5 text-xs text-white shadow-lg">
          <span className="opacity-85 whitespace-nowrap">Reduced motion:</span>
          {[0, 1, 2].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setProgressImperative(step * 0.48, true)}
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
