"""Batch background-match verification against assets/scenes.json.

Run once videos are dropped into assets/raw/:
    python tools/bgcheck_all.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from bgcheck import analyse, hex_to_rgb, probe, read_video_frame  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SCENES_FILE = ROOT / "assets" / "scenes.json"
RAW_DIR = ROOT / "assets" / "raw"


def main() -> int:
    cfg = json.loads(SCENES_FILE.read_text(encoding="utf-8"))
    any_missing = False
    any_regen = False

    print(f"{'SCENE FILE':<24} {'TARGET':<9} {'RESOLUTION':<11} {'DUR':<6} {'MEASURED':<9} {'dE00':<6} {'VIG':<6} {'VERDICT'}")
    print("-" * 88)

    for sc in cfg["scenes"]:
        fn = sc["filename"]
        path = RAW_DIR / fn
        target_hex = sc["bgHex"]
        if not path.exists():
            print(f"{fn:<24} {target_hex:<9} {'-':<11} {'-':<6} {'-':<9} {'-':<6} {'-':<6} MISSING")
            any_missing = True
            continue

        meta = probe(path)
        w, h, dur = int(meta["width"]), int(meta["height"]), float(meta["duration"])
        target_rgb = hex_to_rgb(target_hex)
        samples = [0.05, dur * 0.5, max(0.05, dur - 0.1)]
        frame_reports = [analyse(read_video_frame(path, t, w, h), target_rgb) for t in samples]
        worst = max(frame_reports, key=lambda r: (r["dE"], r["dE_p95"]))
        if worst["verdict"] == "REGENERATE":
            any_regen = True
        print(
            f"{fn:<24} {target_hex:<9} {f'{w}x{h}':<11} {f'{dur:.1f}s':<6} "
            f"{worst['median_hex']:<9} {worst['dE']:<6.2f} {worst['vignette']:<+6.1f} {worst['verdict']}"
        )

    return 2 if (any_missing or any_regen) else 0


if __name__ == "__main__":
    sys.exit(main())
