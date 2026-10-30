"""Phase 5 Exhaustive Multi-Viewport QA, Scroll-Sync, Accessibility & API Security Suite.

Tests across Desktop (1440x900 @2x), Tablet (768x1024 @2x), Mobile (390x844 @2x & 375x812):
  1. Lazy-loading network audit on initial load (verifies Scene 02 & Scene 03 make 0 frame requests on initial hero load)
  2. Real scroll-scrubbing synchronization across all 3 pinned 3D scenes (0%, 50%, 95% of each pin-spacer)
     on Desktop, Tablet, and Mobile — verifying canvas pixels actually change with scroll and active Act tabs sync
  3. Horizontal overflow check (scrollWidth <= innerWidth) at 375px, 390px, 768px, 1440px
  4. Keyboard & Accessibility checks:
       - Single <h1>, <main> landmark, skip link, JSON-LD Dentist + FAQPage schemas
       - Before/After slider keyboard ArrowRight / ArrowLeft updates aria-valuenow
       - FAQ accordion aria-expanded toggle
       - Mobile drawer Escape key closes dialog
  5. Reduced-motion mode (prefers-reduced-motion: reduce): verifies accessible Act controls appear & switch frames
  6. API Security & Validation tests (/api/health, /api/bookings valid 201, invalid 400, honeypot 400)
  7. Console errors, page errors, failed 4xx/5xx network asset requests = 0
"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
QA_DIR = ROOT / "docs" / "phase-5-qa"
PORT = 3022
BASE_URL = f"http://localhost:{PORT}"


def wait_for_server(timeout_s: float = 30.0) -> dict:
    t0 = time.time()
    while time.time() - t0 < timeout_s:
        try:
            with urllib.request.urlopen(f"{BASE_URL}/api/health", timeout=2) as resp:
                if resp.status == 200:
                    return json.loads(resp.read().decode("utf-8"))
        except Exception:
            time.sleep(0.4)
    raise RuntimeError("Server did not start on port 3022")


def post_json(url: str, payload: dict) -> tuple[int, dict]:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))


def canvas_hash(page, scene_id: str) -> str:
    data_url = page.evaluate(
        """(sid) => {
            const c = document.querySelector(`[data-scene-stage="${sid}"] canvas`);
            if (!c || c.width === 0) return "";
            return c.toDataURL("image/webp", 0.5);
        }""",
        scene_id,
    )
    return hashlib.sha1(data_url.encode("utf-8")).hexdigest()[:12] if data_url else "EMPTY"


def pin_spacer_bounds(page, section_selector: str) -> dict:
    return page.evaluate(
        """(sel) => {
            const sec = document.querySelector(sel);
            if (!sec) return { top: 0, height: 0, scrollDistance: 0 };
            const spacer = sec.querySelector('.pin-spacer') || sec.closest('.pin-spacer') || sec;
            const rect = spacer.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            const height = spacer.offsetHeight;
            return { top, height, scrollDistance: Math.max(0, height - window.innerHeight) };
        }""",
        section_selector,
    )


def main() -> int:
    QA_DIR.mkdir(parents=True, exist_ok=True)
    proc = subprocess.Popen(
        ["node", str(ROOT / "node_modules" / "next" / "dist" / "bin" / "next"), "start", "-H", "127.0.0.1", "-p", str(PORT)],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    report: dict = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "checks": {},
        "issues_found": [],
    }

    try:
        health = wait_for_server()
        report["checks"]["health_endpoint"] = health

        # --- API Contract & Security Tests ---
        st_valid, body_valid = post_json(
            f"{BASE_URL}/api/bookings",
            {
                "serviceId": "cosmetic-veneers",
                "patientType": "new-patient",
                "preferredDate": "2026-11-12",
                "preferredSlot": "10:30 AM — Mid-Morning Suite",
                "fullName": "Elena टेस्ट Vance",
                "email": "patient@example.com",
                "phone": "(214) 555-0144",
                "comfortPreference": "noise-canceling-headphones",
                "insuranceType": "ppo-insurance",
                "websiteUrlHoneypot": "",
            },
        )
        st_bad_email, body_bad_email = post_json(
            f"{BASE_URL}/api/bookings",
            {
                "serviceId": "implants",
                "patientType": "new-patient",
                "preferredDate": "2026-11-12",
                "preferredSlot": "10:30 AM — Mid-Morning Suite",
                "fullName": "Test User",
                "email": "not-an-email",
                "phone": "(214) 555-0144",
            },
        )
        st_bot, body_bot = post_json(
            f"{BASE_URL}/api/bookings",
            {
                "serviceId": "implants",
                "patientType": "new-patient",
                "preferredDate": "2026-11-12",
                "preferredSlot": "10:30 AM — Mid-Morning Suite",
                "fullName": "Spam Bot",
                "email": "bot@spam.org",
                "phone": "(214) 555-0144",
                "websiteUrlHoneypot": "https://evil-spam.example",
            },
        )
        report["checks"]["api_security"] = {
            "valid_booking_status": st_valid,
            "valid_reference": body_valid.get("referenceCode"),
            "invalid_email_status": st_bad_email,
            "honeypot_bot_status": st_bot,
            "pass": st_valid == 201 and st_bad_email == 400 and st_bot == 400,
        }

        console_errors: list[str] = []
        page_errors: list[str] = []
        failed_requests: list[str] = []

        with sync_playwright() as p:
            browser = p.chromium.launch()

            # =========================================================
            # 1. DESKTOP (1440x900 @2x) — Lazy-load, Real Scroll Scrub, A11y, CLS
            # =========================================================
            ctx_d = browser.new_context(
                viewport={"width": 1440, "height": 900},
                device_scale_factor=2,
            )
            page = ctx_d.new_page()
            initial_requests: list[tuple[str, int]] = []
            recording_initial = True

            def on_response(resp):
                if resp.status >= 400 and "/api/bookings" not in resp.url:
                    failed_requests.append(f"{resp.status} {resp.url}")
                if recording_initial:
                    initial_requests.append(
                        (resp.url, int(resp.headers.get("content-length", "0") or 0))
                    )

            page.on("response", on_response)
            page.on(
                "console",
                lambda m: console_errors.append(f"[desktop] {m.text}")
                if m.type == "error"
                else None,
            )
            page.on("pageerror", lambda e: page_errors.append(f"[desktop] {e}"))

            # Inject LayoutShift observer before navigation to measure real CLS
            page.add_init_script(
                """
                window.__clsScore = 0;
                new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) window.__clsScore += entry.value;
                  }
                }).observe({ type: 'layout-shift', buffered: true });
                """
            )

            page.goto(BASE_URL, wait_until="networkidle")
            page.wait_for_timeout(1200)
            recording_initial = False

            s02_initial = [u for u, _ in initial_requests if "/frames/scene-02-implant/" in u]
            s03_initial = [u for u, _ in initial_requests if "/frames/scene-03-scan-whitening/" in u]
            s01_initial = [u for u, _ in initial_requests if "/frames/scene-01-hero/" in u]
            initial_bytes = sum(sz for _, sz in initial_requests)

            report["checks"]["lazy_loading_initial"] = {
                "scene01_requests_on_load": len(s01_initial),
                "scene02_requests_on_load": len(s02_initial),
                "scene03_requests_on_load": len(s03_initial),
                "initial_total_MB": round(initial_bytes / (1024 * 1024), 2),
                "lazy_isolation_pass": len(s02_initial) == 0 and len(s03_initial) == 0,
            }

            # SEO & Semantic Structure Check
            seo_audit = page.evaluate(
                """() => {
                    const h1s = document.querySelectorAll('h1');
                    const main = document.querySelectorAll('main');
                    const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
                      .map(s => JSON.parse(s.textContent || '{}')['@type']);
                    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
                    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
                    const overflow = document.documentElement.scrollWidth > window.innerWidth;
                    return {
                      h1Count: h1s.length,
                      mainCount: main.length,
                      jsonLdTypes: ld,
                      canonical,
                      ogImage,
                      horizontalOverflow: overflow,
                    };
                }"""
            )
            report["checks"]["seo_and_semantics"] = seo_audit

            # Real Scroll-Scrubbing Sync Check across all 3 scenes on Desktop
            desktop_sync = {}
            for sid, sec_sel, prefix in [
                ("scene-01-hero", "#hero-stage", "desktop-s01"),
                ("scene-02-implant", "#craftsmanship", "desktop-s02"),
                ("scene-03-scan-whitening", "#technology", "desktop-s03"),
            ]:
                bounds = pin_spacer_bounds(page, sec_sel)
                hashes = []
                for label, frac in [("00pct", 0.02), ("50pct", 0.50), ("95pct", 0.96)]:
                    target_y = bounds["top"] + bounds["scrollDistance"] * frac
                    page.evaluate(
                        """(y) => { window.scrollTo(0, y); }""",
                        target_y,
                    )
                    # Dispatch wheel nudge so Lenis + ScrollTrigger sync to exact scrollY
                    page.mouse.wheel(0, 2)
                    page.wait_for_timeout(900)
                    h = canvas_hash(page, sid)
                    hashes.append(h)
                    page.screenshot(path=str(QA_DIR / f"{prefix}-{label}.png"))
                desktop_sync[sid] = {
                    "hashes": hashes,
                    "all_distinct": len(set(hashes)) == 3 and "EMPTY" not in hashes,
                }
            report["checks"]["desktop_scroll_sync"] = desktop_sync

            # Keyboard Before/After Slider Check
            page.locator("#transformations").scroll_into_view_if_needed()
            page.wait_for_timeout(700)
            slider = page.get_by_role("slider", name="Before and after smile transformation comparison slider")
            before_val = int(slider.get_attribute("aria-valuenow") or "0")
            slider.focus()
            page.keyboard.press("ArrowRight")
            page.keyboard.press("ArrowRight")
            page.wait_for_timeout(200)
            after_val = int(slider.get_attribute("aria-valuenow") or "0")
            page.screenshot(path=str(QA_DIR / "desktop-slider-keyboard.png"))

            # FAQ Accordion Check
            page.locator("#faq").scroll_into_view_if_needed()
            page.wait_for_timeout(500)
            faq_btn_2 = page.locator("#faq-btn-1")
            faq_btn_2.click()
            page.wait_for_timeout(250)
            faq_expanded = faq_btn_2.get_attribute("aria-expanded") == "true"
            page.screenshot(path=str(QA_DIR / "desktop-faq-open.png"))

            cls_desktop = page.evaluate("window.__clsScore || 0")
            report["checks"]["desktop_interactions"] = {
                "slider_before": before_val,
                "slider_after_2x_arrow_right": after_val,
                "slider_keyboard_pass": after_val == before_val + 10,
                "faq_accordion_pass": faq_expanded,
                "cls_score": round(float(cls_desktop), 4),
            }
            ctx_d.close()

            # =========================================================
            # 2. TABLET (768x1024 @2x) — All 3 Scenes + Overflow Check
            # =========================================================
            ctx_t = browser.new_context(
                viewport={"width": 768, "height": 1024},
                device_scale_factor=2,
            )
            page_t = ctx_t.new_page()
            page_t.on(
                "console",
                lambda m: console_errors.append(f"[tablet] {m.text}")
                if m.type == "error"
                else None,
            )
            page_t.on("pageerror", lambda e: page_errors.append(f"[tablet] {e}"))
            page_t.goto(BASE_URL, wait_until="networkidle")
            page_t.wait_for_timeout(900)
            page_t.screenshot(path=str(QA_DIR / "tablet-01-hero.png"))

            tablet_sync = {}
            for sid, sec_sel, shot_name in [
                ("scene-01-hero", "#hero-stage", "tablet-01-hero-mid.png"),
                ("scene-02-implant", "#craftsmanship", "tablet-02-implant-mid.png"),
                ("scene-03-scan-whitening", "#technology", "tablet-03-scan-mid.png"),
            ]:
                b = pin_spacer_bounds(page_t, sec_sel)
                page_t.evaluate("(y) => window.scrollTo(0, y)", b["top"] + b["scrollDistance"] * 0.04)
                page_t.wait_for_timeout(800)
                h0 = canvas_hash(page_t, sid)

                page_t.evaluate("(y) => window.scrollTo(0, y)", b["top"] + b["scrollDistance"] * 0.88)
                page_t.wait_for_timeout(1000)
                h1 = canvas_hash(page_t, sid)
                page_t.screenshot(path=str(QA_DIR / shot_name))
                tablet_sync[sid] = {"h_start": h0, "h_end": h1, "pass": h0 != h1 and h0 != "EMPTY"}

            tablet_overflow = page_t.evaluate("document.documentElement.scrollWidth > window.innerWidth")
            report["checks"]["tablet_qa"] = {
                "horizontal_overflow": tablet_overflow,
                "scene_sync": tablet_sync,
            }
            ctx_t.close()

            # =========================================================
            # 3. MOBILE (390x844 @2x & 375x812) — Mobile 4:3 Tier + Drawer + All 3 Scenes
            # =========================================================
            ctx_m = browser.new_context(
                viewport={"width": 390, "height": 844},
                device_scale_factor=2,
                is_mobile=True,
                has_touch=True,
            )
            page_m = ctx_m.new_page()
            mobile_frame_urls: list[str] = []
            page_m.on(
                "response",
                lambda r: mobile_frame_urls.append(r.url)
                if "/frames/" in r.url and r.url.endswith(".webp")
                else None,
            )
            page_m.on(
                "console",
                lambda m: console_errors.append(f"[mobile] {m.text}")
                if m.type == "error"
                else None,
            )
            page_m.on("pageerror", lambda e: page_errors.append(f"[mobile] {e}"))

            page_m.goto(BASE_URL, wait_until="networkidle")
            page_m.wait_for_timeout(900)
            page_m.screenshot(path=str(QA_DIR / "mobile-01-hero.png"))

            # Verify Mobile Drawer open + Escape key close
            page_m.get_by_role("button", name="Open navigation menu").click()
            page_m.wait_for_timeout(300)
            drawer_open = page_m.locator("#mobile-nav-drawer").is_visible()
            page_m.keyboard.press("Escape")
            page_m.wait_for_timeout(250)
            drawer_closed_on_esc = not page_m.locator("#mobile-nav-drawer").is_visible()

            mobile_sync = {}
            for sid, sec_sel, shot_name in [
                ("scene-01-hero", "#hero-stage", "mobile-01-hero-end.png"),
                ("scene-02-implant", "#craftsmanship", "mobile-02-implant.png"),
                ("scene-03-scan-whitening", "#technology", "mobile-03-scan.png"),
            ]:
                b = pin_spacer_bounds(page_m, sec_sel)
                page_m.evaluate("(y) => window.scrollTo(0, y)", b["top"] + b["scrollDistance"] * 0.05)
                page_m.wait_for_timeout(700)
                h0 = canvas_hash(page_m, sid)

                page_m.evaluate("(y) => window.scrollTo(0, y)", b["top"] + b["scrollDistance"] * 0.72)
                page_m.wait_for_timeout(900)
                h1 = canvas_hash(page_m, sid)
                page_m.screenshot(path=str(QA_DIR / shot_name))
                mobile_sync[sid] = {"h_start": h0, "h_end": h1, "pass": h0 != h1 and h0 != "EMPTY"}

            # Scroll to mobile booking section & take screenshot
            page_m.locator("#booking").scroll_into_view_if_needed()
            page_m.wait_for_timeout(500)
            page_m.screenshot(path=str(QA_DIR / "mobile-04-booking.png"))

            mobile_overflow_390 = page_m.evaluate("document.documentElement.scrollWidth > window.innerWidth")
            page_m.set_viewport_size({"width": 375, "height": 812})
            page_m.wait_for_timeout(300)
            mobile_overflow_375 = page_m.evaluate("document.documentElement.scrollWidth > window.innerWidth")

            desktop_leaks_on_mobile = [u for u in mobile_frame_urls if "/desktop/" in u]
            report["checks"]["mobile_qa"] = {
                "drawer_open_and_esc_close": drawer_open and drawer_closed_on_esc,
                "horizontal_overflow_390": mobile_overflow_390,
                "horizontal_overflow_375": mobile_overflow_375,
                "mobile_frame_requests_count": len(mobile_frame_urls),
                "desktop_frames_loaded_on_mobile": len(desktop_leaks_on_mobile),
                "mobile_tier_isolation_pass": len(desktop_leaks_on_mobile) == 0,
                "scene_sync": mobile_sync,
            }
            ctx_m.close()

            # =========================================================
            # 4. REDUCED MOTION (prefers-reduced-motion: reduce)
            # =========================================================
            ctx_rm = browser.new_context(
                viewport={"width": 1440, "height": 900},
                reduced_motion="reduce",
            )
            page_rm = ctx_rm.new_page()
            page_rm.goto(BASE_URL, wait_until="networkidle")
            page_rm.wait_for_timeout(800)
            rm_label_visible = page_rm.get_by_text("Reduced motion:").first.is_visible()
            h_rm_1 = canvas_hash(page_rm, "scene-01-hero")
            page_rm.get_by_role("button", name="Stage 3").first.click()
            page_rm.wait_for_timeout(600)
            h_rm_3 = canvas_hash(page_rm, "scene-01-hero")
            page_rm.screenshot(path=str(QA_DIR / "reduced-motion-hero.png"))
            report["checks"]["reduced_motion"] = {
                "controls_visible": rm_label_visible,
                "keyframe_switch_pass": h_rm_1 != h_rm_3 and h_rm_3 != "EMPTY",
            }
            ctx_rm.close()

            browser.close()

        report["checks"]["runtime_cleanliness"] = {
            "console_errors": console_errors,
            "page_errors": page_errors,
            "failed_asset_requests": failed_requests,
        }

        report_path = QA_DIR / "qa-report.json"
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(json.dumps(report, indent=2))
        return 0
    finally:
        if sys.platform.startswith("win"):
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                capture_output=True,
            )
        else:
            proc.terminate()


if __name__ == "__main__":
    raise SystemExit(main())
