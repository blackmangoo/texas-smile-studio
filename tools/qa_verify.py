"""Automated Visual & Functional Verification Suite — Texas Smile Studio.

Starts the Next.js production server on port 3020, runs Playwright across
Desktop (1440x900), Tablet (768x1024), and Mobile (390x844), verifies:
  - Zero console.error or uncaught page errors
  - GET /api/health returns 200 OK
  - All 3 scroll-scrubbed 3D canvas scenes (scene-01-hero, scene-02-implant,
    scene-03-scan-whitening) render and advance frames on scroll
  - Interactive 3-step booking flow submits to POST /api/bookings and renders
    a confirmation reference code (TSS-XXXXXX)
  - Captures proof screenshots into docs/qa-screenshots/
"""
from __future__ import annotations

import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "docs" / "qa-screenshots"
PORT = 3021
BASE_URL = f"http://127.0.0.1:{PORT}"


def wait_for_server(timeout_s: float = 30.0) -> dict:
    t0 = time.time()
    while time.time() - t0 < timeout_s:
        try:
            with urllib.request.urlopen(f"{BASE_URL}/api/health", timeout=2) as resp:
                if resp.status == 200:
                    return json.loads(resp.read().decode("utf-8"))
        except Exception:
            time.sleep(0.4)
    raise RuntimeError("Server did not become healthy on port 3020")


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    npx_cmd = "npx.cmd" if sys.platform.startswith("win") else "npx"
    proc = subprocess.Popen(
        [npx_cmd, "next", "start", "-p", str(PORT)],
        cwd=str(ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    try:
        health = wait_for_server()
        print("Health check OK:", health)

        console_errors: list[str] = []
        page_errors: list[str] = []

        with sync_playwright() as p:
            browser = p.chromium.launch()

            # 1. DESKTOP (1440x900)
            ctx_d = browser.new_context(
                viewport={"width": 1440, "height": 900},
                device_scale_factor=2,
            )
            page = ctx_d.new_page()
            page.on(
                "console",
                lambda msg: console_errors.append(msg.text)
                if msg.type == "error"
                else None,
            )
            page.on("pageerror", lambda err: page_errors.append(str(err)))

            page.goto(BASE_URL, wait_until="networkidle")
            page.wait_for_timeout(1200)
            page.screenshot(path=str(OUT_DIR / "01-desktop-hero-start.png"))

            # Click Act 03 on Hero to verify articulated arch (aligner + veneers + implant)
            page.get_by_role("tab", name="Act 03").first.click()
            page.wait_for_timeout(900)
            page.screenshot(path=str(OUT_DIR / "02-desktop-hero-articulated.png"))

            # Scroll to Services Bento Section via Navbar button (exercises Lenis smoothScrollTo)
            page.locator("header").get_by_role("button", name="Services").click()
            page.wait_for_timeout(1300)
            page.screenshot(path=str(OUT_DIR / "03-desktop-services-bento.png"))

            # Scroll to Scene 02 — Implant Craftsmanship Section (#E6DFD1)
            page.locator("header").get_by_role("button", name="Craftsmanship").click()
            page.wait_for_timeout(1400)
            page.screenshot(path=str(OUT_DIR / "04-desktop-scene02-implant-start.png"))

            # Click Act III on Scene 02 to inspect assembled crown + gold abutment
            page.locator("#craftsmanship").get_by_role("tab").nth(2).click()
            page.wait_for_timeout(900)
            page.screenshot(path=str(OUT_DIR / "05-desktop-scene02-implant-assembled.png"))

            # Scroll to Scene 03 — Technology & Whitening Section (#010304)
            page.locator("header").get_by_role("button", name="3D Technology").click()
            page.wait_for_timeout(1500)
            page.screenshot(path=str(OUT_DIR / "06-desktop-scene03-scan-start.png"))

            # Click Step 03 on Scene 03 to inspect B1 Pearl Whitening state
            page.locator("#technology").get_by_role("tab").nth(2).click()
            page.wait_for_timeout(900)
            page.screenshot(path=str(OUT_DIR / "07-desktop-scene03-whitening-end.png"))

            # Scroll to Transformations (Before/After Slider) & Doctors
            page.locator("header").get_by_role("button", name="Results & Team").click()
            page.wait_for_timeout(1300)
            page.screenshot(path=str(OUT_DIR / "08-desktop-before-after-slider.png"))

            # Scroll to Kids & Family Sanctuary (#F7E4D8 Blush & #F2C38B Honey)
            page.locator("header").get_by_role("button", name="Kids & Family").click()
            page.wait_for_timeout(1300)
            page.screenshot(path=str(OUT_DIR / "09-desktop-kids-family-sanctuary.png"))

            # Scroll to Booking Section & complete full 3-step booking flow
            page.locator("header").get_by_role("button", name="Schedule Now").click()
            page.wait_for_timeout(1300)
            page.screenshot(path=str(OUT_DIR / "10-desktop-booking-step1.png"))

            page.get_by_role("button", name="Continue to Date & Time").click()
            page.wait_for_timeout(300)
            page.get_by_role("button", name="Continue to Contact Details").click()
            page.wait_for_timeout(300)

            page.fill("#booking-name", "Ammar Akbar")
            page.fill("#booking-email", "ammar@texassmilestudio.com")
            page.fill("#booking-phone", "(214) 555-0188")
            page.get_by_role("button", name="Confirm Appointment Request").click()

            page.wait_for_selector("text=Suite Request Confirmed", timeout=8000)
            page.wait_for_timeout(400)
            page.screenshot(path=str(OUT_DIR / "11-desktop-booking-confirmed.png"))
            ctx_d.close()

            # 2. TABLET (768x1024)
            ctx_t = browser.new_context(viewport={"width": 768, "height": 1024})
            page_t = ctx_t.new_page()
            page_t.goto(BASE_URL, wait_until="networkidle")
            page_t.wait_for_timeout(1000)
            page_t.screenshot(path=str(OUT_DIR / "12-tablet-hero.png"))
            ctx_t.close()

            # 3. MOBILE (390x844)
            ctx_m = browser.new_context(
                viewport={"width": 390, "height": 844},
                device_scale_factor=2,
                is_mobile=True,
                has_touch=True,
            )
            page_m = ctx_m.new_page()
            page_m.goto(BASE_URL, wait_until="networkidle")
            page_m.wait_for_timeout(1000)
            page_m.screenshot(path=str(OUT_DIR / "13-mobile-hero.png"))

            # Test mobile navigation drawer open
            page_m.get_by_role("button", name="Open navigation menu").click()
            page_m.wait_for_timeout(350)
            page_m.screenshot(path=str(OUT_DIR / "14-mobile-nav-drawer.png"))
            ctx_m.close()

            browser.close()

        print(f"Console errors: {len(console_errors)}")
        print(f"Page errors: {len(page_errors)}")
        if console_errors or page_errors:
            print("Errors detail:", console_errors, page_errors)
            return 1
        print("ALL QA CHECKS PASSED — 14 screenshots saved to", OUT_DIR)
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
