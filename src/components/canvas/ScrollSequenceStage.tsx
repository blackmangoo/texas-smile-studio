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
  version: number;
  width: number;
  height: number;
  count: number;
  totalBytes: number;
  frames: { o: number; l: number }[];
}

// Global scroll timestamp so offscreen decodes yield while user is actively scrolling
let globalLastScrollTs = 0;
if (typeof window !== "undefined") {
  const markScroll = () => {
    globalLastScrollTs = performance.now();
  };
  window.addEventListener("scroll", markScroll, { passive: true });
  window.addEventListener("touchmove", markScroll, { passive: true });
}

function formatFrameUrl(dir: string, oneBasedIndex: number): string {
  const num = String(oneBasedIndex).padStart(4, "0");
  return `${dir}/frame_${num}.webp`;
}

function getFrameDimensions(frame: DecodedFrame): { w: number; h: number } {
  if ("naturalWidth" in frame) {
    return { w: frame.naturalWidth, h: frame.naturalHeight };
  }
  return { w: frame.width, h: frame.height };
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
  const targetProgressRef = useRef<number>(0);
  const drawnFrameRef = useRef<number>(-1);
  const activeActRef = useRef<0 | 1 | 2>(0);
  const totalFramesRef = useRef<number>(scene.desktop.frameCount);
  const posterHiddenRef = useRef<boolean>(false);
  const rafIdRef = useRef<number>(0);

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
   * Aspect-safe, centered 5-argument hardware canvas draw (`ctx.drawImage(frame, dx, dy, dw, dh)`).
   * Guarantees frames are ALWAYS 100% centered and fit inside `canvas.width x canvas.height` —
   * never cropped or shifted regardless of source resolution.
   */
  const flushDraw = useCallback(
    (forceRedraw = false) => {
      rafIdRef.current = 0;
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (progressBarRef?.current) {
        progressBarRef.current.style.transform = `scaleX(${targetProgressRef.current.toFixed(
          4
        )})`;
      }

      const bestIdx = findNearestLoadedIndex(targetFrameRef.current);
      if (bestIdx < 0) return;
      if (!forceRedraw && bestIdx === drawnFrameRef.current) return;

      const frame = framesRef.current[bestIdx];
      if (!frame) return;

      const { w: fw, h: fh } = getFrameDimensions(frame);
      if (fw === 0 || fh === 0) return;

      const cw = canvas.width;
      const ch = canvas.height;
      if (cw === 0 || ch === 0) return;

      let ctx = ctxRef.current;
      if (!ctx) {
        ctx = canvas.getContext("2d", { alpha: false });
        ctxRef.current = ctx;
      }
      if (!ctx) return;

      // Exact 1:1 fast path when intrinsic size matches canvas size; centered contain fit otherwise
      if (fw === cw && fh === ch) {
        ctx.drawImage(frame, 0, 0, cw, ch);
      } else {
        ctx.fillStyle = scene.sectionBgHex;
        ctx.fillRect(0, 0, cw, ch);
        const scale = Math.min(cw / fw, ch / fh);
        const dw = Math.round(fw * scale);
        const dh = Math.round(fh * scale);
        const dx = Math.round((cw - dw) * 0.5);
        const dy = Math.round((ch - dh) * 0.5);
        ctx.drawImage(frame, dx, dy, dw, dh);
      }

      drawnFrameRef.current = bestIdx;

      if (!posterHiddenRef.current) {
        posterHiddenRef.current = true;
        if (posterElRef.current) {
          posterElRef.current.style.opacity = "0";
        }
      }
    },
    [findNearestLoadedIndex, progressBarRef, scene.sectionBgHex]
  );

  const scheduleDraw = useCallback(
    (immediate = false) => {
      if (immediate) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = 0;
        }
        flushDraw(true);
        return;
      }
      if (rafIdRef.current === 0) {
        rafIdRef.current = requestAnimationFrame(() => flushDraw(false));
      }
    },
    [flushDraw]
  );

  /**
   * Imperative progress setter invoked by GSAP ScrollTrigger (`scrub: 0.22` mobile / `0.35` desktop).
   */
  const setProgressImperative = useCallback(
    (progress01: number, snapImmediate = false) => {
      const p = Math.max(0, Math.min(1, progress01));
      const total = totalFramesRef.current;
      targetProgressRef.current = p;
      targetFrameRef.current = Math.min(total - 1, Math.round(p * (total - 1)));

      scheduleDraw(snapImmediate);

      const nextAct: 0 | 1 | 2 = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
      if (nextAct !== activeActRef.current) {
        activeActRef.current = nextAct;
        onActChange?.(nextAct);
      }
    },
    [onActChange, scheduleDraw]
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
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Frame streaming & active-scene memory lifecycle
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const mobile = window.innerWidth < 768;
    const tier = mobile ? scene.mobile : scene.desktop;
    const total = tier.frameCount;
    totalFramesRef.current = total;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = tier.width;
      canvas.height = tier.height;
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

      const curTarget = targetFrameRef.current;
      const curDrawn = drawnFrameRef.current;
      if (
        curDrawn < 0 ||
        Math.abs(idx0 - curTarget) <= Math.abs(curDrawn - curTarget)
      ) {
        scheduleDraw(curDrawn < 0);
      }
    };

    if (mobile) {
      // MOBILE V3 16:9 (854x480 x 144 frames) PACK ENGINE WITH ACTIVE-SCENE VRAM WINDOW
      let packMeta: MobilePackIndex | null = null;
      let packBuffer: ArrayBuffer | null = null;
      let isNearViewport = eager;
      let decodeLoopRunning = false;

      const strideSet = new Set<number>();
      for (let i = 0; i < total; i += 6) strideSet.add(i);
      strideSet.add(total - 1);

      const evictNonStrideFrames = () => {
        for (let i = 0; i < total; i++) {
          if (!strideSet.has(i) && loadedMaskRef.current[i] === 1) {
            const f = framesRef.current[i];
            if (f && "close" in f) f.close();
            framesRef.current[i] = null;
            loadedMaskRef.current[i] = 0;
          }
        }
        if (drawnFrameRef.current >= 0 && !strideSet.has(drawnFrameRef.current)) {
          drawnFrameRef.current = -1;
          scheduleDraw(true);
        }
      };

      const pumpDecodeLoop = async () => {
        if (decodeLoopRunning || cancelled || !packMeta || !packBuffer) return;
        decodeLoopRunning = true;

        try {
          const count = Math.min(total, packMeta.frames.length);
          while (!cancelled) {
            if (performance.now() - globalLastScrollTs < 90) {
              await new Promise((r) => setTimeout(r, 45));
              continue;
            }

            const target = targetFrameRef.current;
            let bestIdx = -1;
            let bestDist = Infinity;

            // 1. Always decode all 24 stride keyframes first
            for (const sIdx of strideSet) {
              if (sIdx < count && loadedMaskRef.current[sIdx] === 0) {
                const d = Math.abs(sIdx - target);
                if (d < bestDist) {
                  bestDist = d;
                  bestIdx = sIdx;
                }
              }
            }

            // 2. When near viewport, decode all 144 frames for full laptop-grade smoothness
            if (bestIdx < 0 && isNearViewport) {
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
            if (isNearViewport) {
              for (let i = 0; i < count && batch.length < 3; i++) {
                if (loadedMaskRef.current[i] === 0 && i !== bestIdx) {
                  batch.push(i);
                }
              }
            }

            const metaRef = packMeta;
            const bufRef = packBuffer;
            await Promise.all(
              batch.map(async (fIdx) => {
                const entry = metaRef.frames[fIdx];
                const slice = new Blob([bufRef.slice(entry.o, entry.o + entry.l)], {
                  type: "image/webp",
                });
                const bmp = await decodeBlob(slice);
                storeDecodedFrame(fIdx, bmp);
              })
            );

            await new Promise((r) => setTimeout(r, 4));
          }
        } finally {
          decodeLoopRunning = false;
        }
      };

      const initMobilePack = async () => {
        try {
          // Paint Frame 0 immediately from v3 poster
          const pResp = await fetch(scene.mobile.poster, { cache: "force-cache" });
          if (pResp.ok && !cancelled && loadedMaskRef.current[0] === 0) {
            const pBmp = await decodeBlob(await pResp.blob());
            if (pBmp && loadedMaskRef.current[0] === 0) {
              storeDecodedFrame(0, pBmp);
            }
          }

          const [idxResp, binResp] = await Promise.all([
            fetch(scene.mobile.packJson, { cache: "force-cache" }),
            fetch(scene.mobile.packBin, { cache: "force-cache" }),
          ]);
          if (!idxResp.ok || !binResp.ok || cancelled) return;

          packMeta = (await idxResp.json()) as MobilePackIndex;
          packBuffer = await binResp.arrayBuffer();
          if (cancelled) return;

          pumpDecodeLoop();
        } catch {
          // Ignore network abort on unmount
        }
      };

      const staggerMs = eager
        ? 0
        : scene.id === "scene-02-implant"
        ? 450
        : 1050;
      const startTimer = setTimeout(() => {
        if (!cancelled) initMobilePack();
      }, staggerMs);

      const el = containerRef.current;
      let io: IntersectionObserver | null = null;
      if (el && typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                isNearViewport = true;
                pumpDecodeLoop();
              } else {
                isNearViewport = false;
                evictNonStrideFrames();
              }
            }
          },
          { rootMargin: "130% 0px 130% 0px" }
        );
        io.observe(el);
      }

      return () => {
        cancelled = true;
        clearTimeout(startTimer);
        io?.disconnect();
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
        for (const f of framesRef.current) {
          if (f && "close" in f) f.close();
        }
      };
    }

    // DESKTOP 1920x1080 PROGRESSIVE STREAMER (Unchanged laptop excellence)
    let desktopStarted = false;
    const startDesktop = async () => {
      if (desktopStarted || cancelled) return;
      desktopStarted = true;

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
          const resp = await fetch(formatFrameUrl(scene.desktop.dir, idx0 + 1), {
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

    if (eager) {
      startDesktop();
    } else {
      const el = containerRef.current;
      if (!el || typeof IntersectionObserver === "undefined") {
        startDesktop();
      } else {
        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                startDesktop();
                io.disconnect();
                break;
              }
            }
          },
          { rootMargin: "150% 0px 150% 0px" }
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
  }, [eager, scene, scheduleDraw]);

  const maskStyle = {
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
