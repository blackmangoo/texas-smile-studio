"""Background-match checker for Texas Smile Studio scene assets.

Measures how closely the border region of a still image or video matches the
website background hex it is supposed to blend into, so seamlessness is
verified numerically instead of by eye.

Usage:
    python tools/bgcheck.py <file> --bg F6F3EE [--bg-end 0A1C24] [--samples 5]

For videos, frames are decoded by ffmpeg with an explicit BT.709 limited-range
-> full-range RGB conversion (what browsers do for untagged HD H.264), so the
numbers reflect what the visitor's browser will actually paint.

Verdicts (CIEDE2000 between median border colour and target):
    PASS        dE <= 2.0   indistinguishable on screen
    GRADE       dE <= 10 and border is uniform -> fixable by the Phase 3 grade
    REGENERATE  otherwise (wrong colour, gradient/vignette/props at the edges)
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from skimage.color import deltaE_ciede2000, rgb2lab

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".avif"}
BORDER_FRAC = 0.06  # outer 6% band on every side is the "must blend" zone


def hex_to_rgb(h: str) -> np.ndarray:
    h = h.lstrip("#")
    if len(h) != 6:
        raise argparse.ArgumentTypeError(f"bad hex: {h}")
    return np.array([int(h[i : i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)


def probe(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets",
         "-show_entries",
         "stream=width,height,nb_read_packets,r_frame_rate,color_space,color_transfer,color_primaries,color_range,pix_fmt",
         "-show_entries", "format=duration", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    data = json.loads(out.stdout)
    s = data["streams"][0]
    s["duration"] = float(data["format"].get("duration", 0) or 0)
    return s


def read_video_frame(path: Path, t: float, w: int, h: int) -> np.ndarray:
    # Force BT.709 limited->full on input regardless of (often missing) tags.
    vf = "scale=in_color_matrix=bt709:in_range=limited:out_range=full,format=rgb24"
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(path), "-frames:v", "1",
         "-vf", vf, "-f", "rawvideo", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3)


def read_image(path: Path) -> np.ndarray:
    from PIL import Image
    try:
        import pillow_avif  # noqa: F401  registers AVIF
    except ImportError:
        pass
    return np.asarray(Image.open(path).convert("RGB"))


def border_mask(h: int, w: int) -> np.ndarray:
    b = max(2, int(round(min(h, w) * BORDER_FRAC)))
    m = np.zeros((h, w), bool)
    m[:b, :] = m[-b:, :] = True
    m[:, :b] = m[:, -b:] = True
    return m


def analyse(frame: np.ndarray, target: np.ndarray) -> dict:
    h, w, _ = frame.shape
    f = frame.astype(np.float64)
    mask = border_mask(h, w)
    border = f[mask]
    med = np.median(border, axis=0)

    lab_t = rgb2lab((target / 255.0).reshape(1, 1, 3))
    lab_med = rgb2lab((med / 255.0).reshape(1, 1, 3))
    de = float(deltaE_ciede2000(lab_t, lab_med)[0, 0])

    # Per-pixel dE over the border to catch props/gradients reaching the edge.
    lab_b = rgb2lab((border / 255.0).reshape(-1, 1, 3))
    de_px = deltaE_ciede2000(np.broadcast_to(lab_t, lab_b.shape), lab_b).ravel()
    p95 = float(np.percentile(de_px, 95))

    # Vignette: corners vs. edge midpoints (same distance band).
    c = max(4, int(min(h, w) * 0.04))
    corners = np.concatenate([q.reshape(-1, 3) for q in (f[:c, :c], f[:c, -c:], f[-c:, :c], f[-c:, -c:])])
    mids = np.concatenate([
        f[:c, w // 2 - c : w // 2 + c].reshape(-1, 3), f[-c:, w // 2 - c : w // 2 + c].reshape(-1, 3),
        f[h // 2 - c : h // 2 + c, :c].reshape(-1, 3), f[h // 2 - c : h // 2 + c, -c:].reshape(-1, 3),
    ])
    vignette = float(np.mean(mids) - np.mean(corners))  # >0 means darker corners

    sides = {
        "top": np.median(f[: max(2, int(h * BORDER_FRAC))].reshape(-1, 3), 0),
        "bottom": np.median(f[-max(2, int(h * BORDER_FRAC)) :].reshape(-1, 3), 0),
        "left": np.median(f[:, : max(2, int(w * BORDER_FRAC))].reshape(-1, 3), 0),
        "right": np.median(f[:, -max(2, int(w * BORDER_FRAC)) :].reshape(-1, 3), 0),
    }
    if de <= 2.0 and p95 <= 4.0:
        verdict = "PASS"
    elif de <= 10.0 and p95 <= de + 6.0 and abs(vignette) <= 6.0:
        verdict = "GRADE"
    else:
        verdict = "REGENERATE"
    return {
        "median_rgb": med.round().astype(int).tolist(),
        "median_hex": "#" + "".join(f"{int(round(v)):02X}" for v in med),
        "dE": round(de, 2),
        "dE_p95": round(p95, 2),
        "vignette": round(vignette, 1),
        "sides_hex": {k: "#" + "".join(f"{int(round(x)):02X}" for x in v) for k, v in sides.items()},
        "verdict": verdict,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file", type=Path)
    ap.add_argument("--bg", required=True, help="target hex for the first frame (and all frames unless --bg-end)")
    ap.add_argument("--bg-end", help="target hex for the last frame (scenes that transition backgrounds)")
    ap.add_argument("--samples", type=int, default=5)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    start, end = hex_to_rgb(a.bg), hex_to_rgb(a.bg_end or a.bg)
    path: Path = a.file
    results = []
    meta: dict = {}

    if path.suffix.lower() in IMAGE_EXT:
        results.append({"t": None, **analyse(read_image(path), start)})
    else:
        meta = probe(path)
        w, h, dur = int(meta["width"]), int(meta["height"]), meta["duration"]
        n = max(2, a.samples)
        for i in range(n):
            frac = i / (n - 1)
            t = min(dur - 0.05, frac * dur)
            # Transition scenes: only first/last are constrained.
            if a.bg_end and 0 < i < n - 1:
                continue
            target = start if frac < 0.5 else end
            res = analyse(read_video_frame(path, max(0.0, t), w, h), target)
            results.append({"t": round(t, 2), "target": "#" + (a.bg if frac < 0.5 else (a.bg_end or a.bg)).lstrip("#").upper(), **res})

    worst = max(results, key=lambda r: ("PASS", "GRADE", "REGENERATE").index(r["verdict"]))
    if a.json:
        print(json.dumps({"file": str(path), "meta": meta, "frames": results, "overall": worst["verdict"]}, indent=2))
    else:
        if meta:
            print(f"{path.name}: {meta['width']}x{meta['height']} {meta.get('r_frame_rate')} "
                  f"{meta.get('nb_read_packets')} frames {meta['duration']:.2f}s "
                  f"tags(space={meta.get('color_space','?')}, range={meta.get('color_range','?')})")
        for r in results:
            t = "still" if r["t"] is None else f"t={r['t']:>5}s"
            print(f"  {t}  border {r['median_hex']}  dE {r['dE']:5.2f}  p95 {r['dE_p95']:5.2f}  "
                  f"vignette {r['vignette']:+5.1f}  {r['verdict']}")
        print(f"  OVERALL: {worst['verdict']}")
    return 0 if worst["verdict"] != "REGENERATE" else 2


if __name__ == "__main__":
    sys.exit(main())
