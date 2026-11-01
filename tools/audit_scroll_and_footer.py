"""Comprehensive audit of site scrolling, navigation anchors, 3D scrubbing, and footer portfolio attribution."""
from __future__ import annotations

import json
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3020"
OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "phase-5-qa"


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    report = {}

    with sync_playwright() as p:
        browser = p.chromium.launch()

        # ======================================================================
        # 1. DESKTOP AUDIT (1440x900)
        # ======================================================================
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1.5)
        page = ctx.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(800)

        # A. Check Footer "Designed by Ammar" & ammar.works link
        footer_el = page.locator("footer")
        footer_el.scroll_into_view_if_needed()
        page.wait_for_timeout(500)

        ammar_link = page.locator('footer a[href="https://ammar.works"]')
        link_count = ammar_link.count()
        target_attr = ammar_link.get_attribute("target") if link_count > 0 else None
        rel_attr = ammar_link.get_attribute("rel") if link_count > 0 else None
        link_text = ammar_link.inner_text() if link_count > 0 else ""

        print(f"[Footer] ammar.works link found: {link_count == 1}")
        print(f"[Footer] target: {target_attr}, rel: {rel_attr}")
        print(f"[Footer] innerText: {repr(link_text)}")

        footer_el.screenshot(path=str(OUT_DIR / "v7-footer-desktop.png"))

        # B. Test Navbar Navigation Links
        nav_results = {}
        links_to_test = [
            ("Services", "#services"),
            ("Craftsmanship", "#craftsmanship"),
            ("3D Technology", "#technology"),
            ("Results & Team", "#transformations"),
            ("Kids & Family", "#kids-family"),
            ("FAQ", "#faq"),
            ("Home", "#hero-stage"),
        ]

        for label, expected_hash in links_to_test:
            btn = page.locator(f"header nav button:has-text('{label}')")
            btn.click()
            page.wait_for_timeout(800)
            cur_y = page.evaluate("() => window.scrollY")
            target_el = page.locator(expected_hash)
            target_rect = target_el.bounding_box() if target_el.count() > 0 else None
            nav_results[label] = {
                "scrollY": cur_y,
                "targetTop": target_rect["y"] if target_rect else None,
                "targetVisible": target_rect is not None,
            }
            print(f"[Nav] Clicked '{label}': scrollY={cur_y:.0f}, targetTop={target_rect['y'] if target_rect else 'N/A'}")

        # C. Test Continuous Full-Page Smooth Scroll from Top to Bottom
        page.evaluate("() => window.scrollTo(0, 0)")
        page.wait_for_timeout(500)

        scroll_audit = page.evaluate(
            """async () => {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                const steps = 120;
                let lastY = 0;
                let monotonic = true;
                for (let i = 1; i <= steps; i++) {
                    const y = (totalHeight * i) / steps;
                    window.scrollTo(0, y);
                    await new Promise(r => requestAnimationFrame(r));
                    const cur = window.scrollY;
                    if (cur < lastY - 2) monotonic = false;
                    lastY = cur;
                }
                return {
                    reachedBottom: Math.abs(window.scrollY - totalHeight) < 50,
                    finalScrollY: Math.round(window.scrollY),
                    totalHeight: Math.round(totalHeight),
                    monotonic,
                };
            }"""
        )
        print(f"[Scroll Audit Desktop]: {scroll_audit}")

        # D. Test 3D Canvas Progress Scrubbing in each scene
        scene_stages = ["scene-01-hero", "scene-02-implant", "scene-03-scan-whitening"]
        scene_progress = {}
        for sid in scene_stages:
            stage_el = page.locator(f'[data-scene-stage="{sid}"]')
            stage_el.scroll_into_view_if_needed()
            page.wait_for_timeout(600)
            drawn_idx = stage_el.evaluate(
                """(el) => {
                    const canvas = el.querySelector('canvas');
                    return {
                        canvasWidth: canvas ? canvas.width : 0,
                        canvasHeight: canvas ? canvas.height : 0,
                        hasContext: canvas && !!canvas.getContext('2d'),
                    };
                }"""
            )
            scene_progress[sid] = drawn_idx

        report["desktop"] = {
            "footerLink": {
                "exists": link_count == 1,
                "target": target_attr,
                "rel": rel_attr,
                "text": link_text,
            },
            "navigation": nav_results,
            "continuousScroll": scroll_audit,
            "scenes": scene_progress,
            "errors": errors,
        }
        ctx.close()

        # ======================================================================
        # 2. MOBILE VIEWPORT AUDIT (390x844 - iPhone 14 / modern phone)
        # ======================================================================
        mob_ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
        )
        mob_page = mob_ctx.new_page()
        mob_errors: list[str] = []
        mob_page.on("pageerror", lambda err: mob_errors.append(str(err)))

        mob_page.goto(BASE_URL, wait_until="networkidle")
        mob_page.wait_for_timeout(800)

        # A. Check mobile footer
        mob_footer = mob_page.locator("footer")
        mob_footer.scroll_into_view_if_needed()
        mob_page.wait_for_timeout(500)
        mob_ammar_link = mob_page.locator('footer a[href="https://ammar.works"]')
        mob_link_visible = mob_ammar_link.is_visible()
        mob_footer.screenshot(path=str(OUT_DIR / "v7-footer-mobile.png"))
        print(f"[Mobile Footer] Link visible: {mob_link_visible}")

        # B. Test mobile drawer navigation
        menu_btn = mob_page.locator("header button[aria-label='Open navigation menu']")
        menu_btn.click()
        mob_page.wait_for_timeout(300)
        drawer_visible = mob_page.locator("#mobile-nav-drawer").is_visible()
        print(f"[Mobile Drawer] Open: {drawer_visible}")

        # Click "Services" in mobile drawer
        mob_page.locator("#mobile-nav-drawer button:has-text('Services')").click()
        mob_page.wait_for_timeout(600)
        mob_services_y = mob_page.evaluate("() => window.scrollY")
        print(f"[Mobile Nav] Clicked Services, scrollY: {mob_services_y}")

        # C. Run throttled mobile scroll benchmark to ensure perfect 60fps
        cdp = mob_ctx.new_cdp_session(mob_page)
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
        mob_page.wait_for_timeout(300)

        mob_bench = mob_page.evaluate(
            """async () => {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                const deltas = [];
                let last = performance.now();
                const steps = 140;
                for (let i = 1; i <= steps; i++) {
                    await new Promise(res => requestAnimationFrame(now => {
                        deltas.push(now - last);
                        last = now;
                        window.scrollTo(0, (totalHeight * i) / steps);
                        res(null);
                    }));
                }
                const clean = deltas.slice(4);
                const sorted = [...clean].sort((a, b) => a - b);
                const avg = clean.reduce((a, b) => a + b, 0) / clean.length;
                const p95 = sorted[Math.floor(sorted.length * 0.95)];
                const max = sorted[sorted.length - 1];
                return {
                    framesMeasured: clean.length,
                    avgMs: Number(avg.toFixed(2)),
                    fps: Number((1000 / avg).toFixed(1)),
                    p95Ms: Number(p95.toFixed(2)),
                    maxMs: Number(max.toFixed(2)),
                    jankOver28ms: clean.filter(d => d > 28).length,
                };
            }"""
        )
        print(f"[Mobile Scroll Bench 4x CPU Throttled]: {mob_bench}")

        report["mobile"] = {
            "footerLinkVisible": mob_link_visible,
            "drawerWorking": drawer_visible,
            "benchmark": mob_bench,
            "errors": mob_errors,
        }

        browser.close()

    print("\n" + "="*60)
    print("FINAL AUDIT REPORT:")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
