"""Empirical Mobile Scroll-Scrub Frame-Time Benchmark against http://localhost:3020 (4x CPU Throttling)."""
from __future__ import annotations

import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3020"


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
        )
        page = ctx.new_page()
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(1400)

        cdp = ctx.new_cdp_session(page)
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
        page.wait_for_timeout(300)

        # Simulate touch gesture + scroll scrub through Hero -> Scene 02 -> Scene 03
        stats = page.evaluate(
            """async () => {
                const maxScroll = Math.min(document.documentElement.scrollHeight - window.innerHeight, 6000);
                const deltas = [];
                let last = performance.now();
                const totalSteps = 160;
                for (let i = 1; i <= totalSteps; i++) {
                  await new Promise(resolve => requestAnimationFrame((now) => {
                    deltas.push(now - last);
                    last = now;
                    window.scrollTo(0, (maxScroll * i) / totalSteps);
                    resolve(null);
                  }));
                }
                const clean = deltas.slice(4);
                const sorted = [...clean].sort((a, b) => a - b);
                const avg = clean.reduce((a, b) => a + b, 0) / clean.length;
                const p95 = sorted[Math.floor(sorted.length * 0.95)];
                const p99 = sorted[Math.floor(sorted.length * 0.99)];
                const max = sorted[sorted.length - 1];
                const jankOver25ms = clean.filter(d => d > 25).length;
                return {
                  framesMeasured: clean.length,
                  avgMs: Number(avg.toFixed(2)),
                  approxFps: Number((1000 / avg).toFixed(1)),
                  p95Ms: Number(p95.toFixed(2)),
                  p99Ms: Number(p99.toFixed(2)),
                  maxMs: Number(max.toFixed(2)),
                  jankFramesOver25ms: jankOver25ms,
                };
            }"""
        )
        print(json.dumps(stats, indent=2))
        browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
