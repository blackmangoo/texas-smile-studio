import type Lenis from "lenis";

let activeLenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null): void {
  activeLenis = instance;
}

export function getLenis(): Lenis | null {
  return activeLenis;
}

/**
 * Smoothly scrolls to a section selector or element ID, resolving GSAP ScrollTrigger's
 * `.pin-spacer` parent when the target section is pinned. Never calls native
 * `scrollIntoView` while Lenis is active (prevents Watch Project Bug #24).
 */
export function smoothScrollTo(targetSelectorOrId: string, offsetPx = 0): void {
  if (typeof window === "undefined") return;
  const selector = targetSelectorOrId.startsWith("#")
    ? targetSelectorOrId
    : `#${targetSelectorOrId}`;
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;

  const pinSpacer = el.closest<HTMLElement>(".pin-spacer");
  const resolvedTarget = pinSpacer ?? el;

  if (activeLenis) {
    activeLenis.scrollTo(resolvedTarget, {
      offset: offsetPx,
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
  } else {
    const top =
      resolvedTarget.getBoundingClientRect().top + window.scrollY + offsetPx;
    window.scrollTo({ top, behavior: "smooth" });
  }
}
