"""Comprehensive v4 Layout Clearance + Live-Network Throttled Mobile & Hybrid Laptop Scroll QA."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3020"
OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "phase-5-qa"


def check_desktop_viewport(p, width: int, height: int, dpr: float, has_touch: bool, tag: str) -> dict:
    browser = p.chromium.launch()
    ctx = browser.new_context(
        viewport={"width": width, "height": height},
        device_scale_factor=dpr,
        is_mobile=False,
        has_touch=has_touch,
    )
    page = ctx.new_page()
    errors: list[str] = []
    page.on("pageerror", lambda err: errors.append(str(err)))

    page.goto(BASE_URL, wait_until="networkidle")
    page.wait_for_timeout(900)

    # 1. Check Navbar height & zero multi-line link wrapping
    nav_metrics = page.evaluate(
        """() => {
            const header = document.querySelector('header');
            const hRect = header.getBoundingClientRect();
            const navBtns = Array.from(document.querySelectorAll('header nav button'));
            const maxBtnHeight = Math.max(...navBtns.map(b => b.getBoundingClientRect().height));
            const subtitle = header.querySelector('button span span:nth-child(2)');
            const subRect = subtitle ? subtitle.getBoundingClientRect() : { height: 0 };
            return {
              headerBottom: Number(hRect.bottom.toFixed(1)),
              navLinkCount: navBtns.length,
              maxNavBtnHeight: Number(maxBtnHeight.toFixed(1)),
              subtitleHeight: Number(subRect.height.toFixed(1)),
            };
        }"""
    )

    # 2. Scroll right into the middle of pinned ImplantCraftsmanshipSection (#craftsmanship)
    implant_metrics = page.evaluate(
        """async () => {
            const sec = document.querySelector('#craftsmanship');
            const spacer = sec.querySelector('.pin-spacer') || sec;
            const targetY = spacer.getBoundingClientRect().top + window.scrollY + window.innerHeight * 0.65;
            window.scrollTo(0, targetY);
            await new Promise(r => setTimeout(r, 550));

            const headerBottom = document.querySelector('header').getBoundingClientRect().bottom;
            const heading = document.querySelector('#craftsmanship-heading');
            const eyebrow = heading.previousElementSibling;
            const cta = Array.from(sec.querySelectorAll('button')).find(b => b.textContent.includes('Plan Implant Visit'));
            const prog = sec.querySelector('.origin-left');

            return {
              headerBottom: Number(headerBottom.toFixed(1)),
              eyebrowTop: Number(eyebrow.getBoundingClientRect().top.toFixed(1)),
              clearanceBelowHeaderPx: Number((eyebrow.getBoundingClientRect().top - headerBottom).toFixed(1)),
              headingTop: Number(heading.getBoundingClientRect().top.toFixed(1)),
              ctaBottom: Number(cta.getBoundingClientRect().bottom.toFixed(1)),
              clearanceAboveViewportBottomPx: Number((window.innerHeight - cta.getBoundingClientRect().bottom).toFixed(1)),
              progressTransform: prog ? prog.style.transform : '',
            };
        }"""
    )
    if tag == "1534x726":
        page.screenshot(path=str(OUT_DIR / "v4-1534x726-implant.png"))

    # 3. Scroll right into the middle of pinned TechnologyWhiteningSection (#technology)
    tech_metrics = page.evaluate(
        """async () => {
            const sec = document.querySelector('#technology');
            const spacer = sec.querySelector('.pin-spacer') || sec;
            const targetY = spacer.getBoundingClientRect().top + window.scrollY + window.innerHeight * 0.75;
            window.scrollTo(0, targetY);
            await new Promise(r => setTimeout(r, 550));

            const headerBottom = document.querySelector('header').getBoundingClientRect().bottom;
            const heading = document.querySelector('#technology-heading');
            const eyebrow = heading.previousElementSibling;
            const cta = Array.from(sec.querySelectorAll('button')).find(b => b.textContent.includes('Book'));
            const prog = sec.querySelector('.origin-left');
            const activeCardHeader = sec.querySelector('[data-s3-card="0"] > div:first-child');

            return {
              headerBottom: Number(headerBottom.toFixed(1)),
              eyebrowTop: Number(eyebrow.getBoundingClientRect().top.toFixed(1)),
              clearanceBelowHeaderPx: Number((eyebrow.getBoundingClientRect().top - headerBottom).toFixed(1)),
              headingTop: Number(heading.getBoundingClientRect().top.toFixed(1)),
              ctaBottom: Number(cta.getBoundingClientRect().bottom.toFixed(1)),
              clearanceAboveViewportBottomPx: Number((window.innerHeight - cta.getBoundingClientRect().bottom).toFixed(1)),
              cardHeaderHeightPx: activeCardHeader ? Number(activeCardHeader.getBoundingClientRect().height.toFixed(1)) : 0,
              progressTransform: prog ? prog.style.transform : '',
            };
        }"""
    )
    if tag == "1534x726":
        page.screenshot(path=str(OUT_DIR / "v4-1534x726-tech.png"))

    browser.close()
    return {
        "tag": tag,
        "viewport": f"{width}x{height}@{dpr}x (touch={has_touch})",
        "errors": errors,
        "navbar": nav_metrics,
        "implant": implant_metrics,
        "technology": tech_metrics,
    }


def check_mobile_scroll_smoothness(p) -> dict:
    browser = p.chromium.launch()
    ctx = browser.new_context(
        viewport={"width": 390, "height": 844},
        device_scale_factor=2,
        is_mobile=True,
        has_touch=True,
    )
    page = ctx.new_page()
    errors: list[str] = []
    page.on("pageerror", lambda err: errors.append(str(err)))

    cdp = ctx.new_cdp_session(page)
    # 4x CPU throttle + realistic 20 Mbps / 28ms RTT Wi-Fi/LTE network profile
    cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
    cdp.send(
        "Network.emulateNetworkConditions",
        {
            "offline": False,
            "latency": 28,
            "downloadThroughput": int(20 * 1024 * 1024 / 8),
            "uploadThroughput": int(8 * 1024 * 1024 / 8),
        },
    )

    page.goto(BASE_URL, wait_until="domcontentloaded")
    # Wait only 450ms before starting scroll (simulating an impatient phone user!)
    page.wait_for_timeout(450)
    page.screenshot(path=str(OUT_DIR / "v4-mob-390x844-hero.png"))

    scroll_bench = page.evaluate(
        """async () => {
            const deltas = [];
            let last = performance.now();

            // Helper to sample canvas center patch signature so we count UNIQUE rendered frames during live scroll
            const sampleCanvasSig = (sceneId) => {
              const c = document.querySelector(`[data-scene-stage="${sceneId}"] canvas`);
              if (!c) return '';
              const ctx = c.getContext('2d');
              const d = ctx.getImageData(Math.floor(c.width * 0.35), Math.floor(c.height * 0.35), 24, 24).data;
              let acc = 0;
              for (let i = 0; i < d.length; i += 16) acc = ((acc * 31) + d[i]) >>> 0;
              return String(acc);
            };

            const uniqueFramesPerScene = {
              'scene-01-hero': new Set(),
              'scene-02-implant': new Set(),
              'scene-03-scan-whitening': new Set(),
            };

            const techSec = document.querySelector('#technology');
            const maxScroll = techSec.getBoundingClientRect().bottom + window.scrollY;
            const totalSteps = 260;

            for (let i = 1; i <= totalSteps; i++) {
              await new Promise(resolve => requestAnimationFrame((now) => {
                deltas.push(now - last);
                last = now;
                window.scrollTo(0, (maxScroll * i) / totalSteps);
                for (const sid of Object.keys(uniqueFramesPerScene)) {
                  uniqueFramesPerScene[sid].add(sampleCanvasSig(sid));
                }
                resolve(null);
              }));
            }
            // Let exponential damper glide to rest (~180ms)
            for (let k = 0; k < 12; k++) {
              await new Promise(r => requestAnimationFrame(() => {
                for (const sid of Object.keys(uniqueFramesPerScene)) {
                  uniqueFramesPerScene[sid].add(sampleCanvasSig(sid));
                }
                r(null);
              }));
            }

            const clean = deltas.slice(4);
            const sorted = [...clean].sort((a, b) => a - b);
            const avg = clean.reduce((a, b) => a + b, 0) / clean.length;
            const p95 = sorted[Math.floor(sorted.length * 0.95)];

            return {
              framesMeasured: clean.length,
              avgMs: Number(avg.toFixed(2)),
              approxFps: Number((1000 / avg).toFixed(1)),
              p95Ms: Number(p95.toFixed(2)),
              jankFramesOver28ms: clean.filter(d => d > 28).length,
              uniqueRenderedFramesDuringContinuousScroll: {
                hero: uniqueFramesPerScene['scene-01-hero'].size,
                implant: uniqueFramesPerScene['scene-02-implant'].size,
                scanWhitening: uniqueFramesPerScene['scene-03-scan-whitening'].size,
              },
            };
        }"""
    )

    # Capture mid-scrub mobile screenshots of Scene 02 and Scene 03
    page.evaluate(
        """() => {
            const s2 = document.querySelector('#craftsmanship .scene-sticky-track');
            window.scrollTo(0, s2.getBoundingClientRect().top + window.scrollY + window.innerHeight * 0.95);
        }"""
    )
    page.wait_for_timeout(350)
    page.screenshot(path=str(OUT_DIR / "v4-mob-390x844-implant.png"))

    page.evaluate(
        """() => {
            const s3 = document.querySelector('#technology .scene-sticky-track');
            window.scrollTo(0, s3.getBoundingClientRect().top + window.scrollY + window.innerHeight * 1.05);
        }"""
    )
    page.wait_for_timeout(350)
    page.screenshot(path=str(OUT_DIR / "v4-mob-390x844-tech.png"))

    browser.close()
    return {"errors": errors, "benchmark": scroll_bench}


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        d_1534 = check_desktop_viewport(p, 1534, 726, 1.25, False, "1534x726")
        d_hybrid = check_desktop_viewport(p, 1534, 726, 1.25, True, "1534x726-touch-laptop")
        d_1280 = check_desktop_viewport(p, 1280, 650, 1.5, False, "1280x650-compact")
        mob = check_mobile_scroll_smoothness(p)

    report = {
        "desktop_1534x726": d_1534,
        "hybrid_touch_laptop_1534x726": d_hybrid,
        "compact_laptop_1280x650": d_1280,
        "mobile_390x844_throttled": mob,
    }
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
