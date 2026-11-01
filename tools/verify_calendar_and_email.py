"""Verify ElegantCalendarPicker UI, ammar.akbar2002@gmail.com routing, and tightened copy."""
from __future__ import annotations

import json
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3020"
OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "phase-5-qa"


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1.5,
        )
        page = ctx.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(800)

        # 1. Scroll directly to booking section
        page.evaluate("() => document.querySelector('#booking').scrollIntoView()")
        page.wait_for_timeout(400)

        # 2. Check Step 1 -> Advance to Step 2
        step1_title = page.locator("#booking h3").text_content()
        print(f"Step 1 Title: {step1_title}")

        continue_to_date_btn = page.locator("#booking button:has-text('Continue to Calendar')")
        continue_to_date_btn.click()
        page.wait_for_timeout(400)

        # 3. Verify ElegantCalendarPicker is mounted
        cal_mounted = page.locator("#booking [aria-label^='Select ']").count()
        print(f"Calendar interactive days mounted: {cal_mounted}")

        # Screenshot the calendar UI
        page.screenshot(path=str(OUT_DIR / "v5-calendar-ui-desktop.png"))

        # Click an available date in the calendar
        available_days = page.locator("#booking button[aria-label^='Select ']")
        if available_days.count() > 3:
            available_days.nth(3).click()
            page.wait_for_timeout(200)

        selected_date_text = page.locator("#booking .font-semibold.text-\\[\\#0F5F6E\\]").first.text_content()
        print(f"Calendar Selected Date: {selected_date_text}")

        # 4. Advance to Step 3
        continue_to_contact_btn = page.locator("#booking button:has-text('Continue to Contact')")
        continue_to_contact_btn.click()
        page.wait_for_timeout(400)

        # Fill in contact coordinates
        page.fill("#booking-name", "Ammar Akbar")
        page.fill("#booking-email", "ammar.akbar2002@gmail.com")
        page.fill("#booking-phone", "(214) 555-0199")

        page.screenshot(path=str(OUT_DIR / "v5-contact-step-desktop.png"))

        # 5. Submit appointment request
        submit_btn = page.locator("#booking button[type='submit']")
        submit_btn.click()
        page.wait_for_timeout(900)

        # Check confirmation status
        conf_header = page.locator("#booking h3").text_content()
        print(f"Confirmation Header: {conf_header}")

        email_link = page.locator("#booking a[href^='mailto:ammar.akbar2002@gmail.com']").first
        email_href = email_link.get_attribute("href")
        print(f"Direct Mailto Link: {email_href[:120]}...")

        page.screenshot(path=str(OUT_DIR / "v5-confirmation-card.png"))

        # Mobile viewport check for calendar
        mob_ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
        )
        mob_page = mob_ctx.new_page()
        mob_page.goto(f"{BASE_URL}#booking", wait_until="networkidle")
        mob_page.wait_for_timeout(600)
        mob_page.locator("#booking button:has-text('Continue to Calendar')").click()
        mob_page.wait_for_timeout(300)
        mob_page.screenshot(path=str(OUT_DIR / "v5-calendar-mobile.png"))

        # Verify no placeholder text anywhere in visible body
        body_text = page.locator("body").inner_text()
        placeholders_found = []
        for word in ["[Placeholder Profile]", "Replace with clinic Google", "[Verified Review", "shark-tooth"]:
            if word in body_text:
                placeholders_found.append(word)

        print(f"Errors: {errors}")
        print(f"Old Placeholders Remaining: {placeholders_found}")

        browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
