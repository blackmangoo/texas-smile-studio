"""Snap the background of a keyframe still to an exact website hex.

Used on Flow/Imagen keyframes BEFORE they are uploaded as the start/end frame
of a Veo "Frames to Video" generation, so Veo inherits a background that is
already pixel-exact instead of relying on the text prompt alone.

Method:
  1. Measure the actual background as the median of the outer border band.
  2. Region-grow the background: pixels within dE<thr of that colour that are
     connected to the frame border (subject interiors are never touched, even
     if they happen to be the same colour).
  3. Build a soft matte from per-pixel colour distance, feather it, and blend
     each background pixel to the exact target. Pixels fully inside the matte
     become exactly the target value (removes noise, gradients, vignettes).

Usage:
    python tools/bgfix.py in.png --bg F6F3EE [-o out.png] [--thr 8] [--feather 0.012]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.color import deltaE_ciede2000, rgb2lab

sys.path.insert(0, str(Path(__file__).parent))
from bgcheck import analyse, border_mask, hex_to_rgb  # noqa: E402


def fit_background_field(f: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Least-squares quadratic surface per channel fitted to border pixels.

    Models the generator's smooth background (drift + vignette + gradient) so a
    low-contrast subject - a white tooth on a near-white backdrop - still shows
    up as a residual instead of being swallowed as "background".
    """
    h, w, _ = f.shape
    yy, xx = np.mgrid[0:h, 0:w]
    x, y = xx / w - 0.5, yy / h - 0.5
    basis = np.stack([np.ones_like(x), x, y, x * x, y * y, x * y], -1)
    A = basis[mask][::7]
    field = np.empty_like(f)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A, f[..., c][mask][::7], rcond=None)
        field[..., c] = basis @ coef
    return field


def snap(img: np.ndarray, target: np.ndarray, thr: float, feather: float) -> tuple[np.ndarray, dict]:
    h, w, _ = img.shape
    f = img.astype(np.float64)
    bmask = border_mask(h, w)
    measured = np.median(f[bmask], axis=0)

    # Distance of every pixel from the *local* modelled background, not a single colour.
    field = fit_background_field(ndimage.gaussian_filter(f, (1.5, 1.5, 0)), bmask)
    lab = rgb2lab(ndimage.gaussian_filter(f, (1.0, 1.0, 0)) / 255.0)
    de = deltaE_ciede2000(rgb2lab(np.clip(field, 0, 255) / 255.0), lab)
    # Auto threshold from the border's own noise floor, capped by --thr.
    noise = float(np.percentile(de[bmask], 99))
    thr = min(thr, max(2.0, 2.5 * noise))

    # Edge barrier: region growth may not cross real contours (subject silhouettes).
    lum = lab[..., 0]
    grad = np.hypot(ndimage.sobel(lum, 0), ndimage.sobel(lum, 1))
    edge = grad > max(4.0, float(np.percentile(grad[bmask], 99.5)) * 3)

    # Background = close to the modelled field, not an edge, AND connected to the border.
    cand = (de < thr) & ~edge
    labels, _ = ndimage.label(cand)
    edge_labels = np.unique(labels[bmask & cand])
    edge_labels = edge_labels[edge_labels != 0]
    region = np.isin(labels, edge_labels)

    # Soft matte: 1 deep in background, fading over the last 40% of thr.
    soft = np.clip((thr - de) / (0.4 * thr), 0.0, 1.0) * region
    sigma = max(1.0, feather * w)
    matte = ndimage.gaussian_filter(soft, sigma)
    # Never let blur pull the matte INTO the subject beyond the grown region edge.
    matte = np.minimum(matte, ndimage.gaussian_filter(region.astype(float), sigma * 0.5))
    matte[soft >= 0.999] = np.maximum(matte[soft >= 0.999], 0.0)
    core = ndimage.binary_erosion(soft >= 0.999, iterations=max(1, int(sigma)))
    matte[core] = 1.0

    out = f * (1 - matte[..., None]) + target[None, None, :] * matte[..., None]
    out = np.clip(np.round(out), 0, 255).astype(np.uint8)
    stats = {
        "thr": round(thr, 2),
        "measured_hex": "#" + "".join(f"{int(round(v)):02X}" for v in measured),
        "bg_coverage": round(float(region.mean()) * 100, 1),
        "exact_pixels": round(float((matte >= 1.0).mean()) * 100, 1),
    }
    return out, stats


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file", type=Path)
    ap.add_argument("--bg", required=True)
    ap.add_argument("-o", "--out", type=Path)
    ap.add_argument("--thr", type=float, default=8.0, help="dE radius that still counts as background")
    ap.add_argument("--feather", type=float, default=0.012, help="matte feather as fraction of width")
    a = ap.parse_args()

    target = hex_to_rgb(a.bg)
    img = np.asarray(Image.open(a.file).convert("RGB"))
    before = analyse(img, target)
    if before["verdict"] == "REGENERATE" and before["dE"] > 15:
        print(f"refusing: border {before['median_hex']} is dE {before['dE']} from #{a.bg.lstrip('#').upper()} "
              f"- regenerate the still with the exact background instead")
        return 2
    out, stats = snap(img, target, a.thr, a.feather)
    after = analyse(out, target)
    dst = a.out or a.file.with_name(a.file.stem + ".fixed.png")
    Image.fromarray(out).save(dst, optimize=True)
    print(f"{a.file.name}: measured bg {stats['measured_hex']} -> #{a.bg.lstrip('#').upper()}  "
          f"background {stats['bg_coverage']}% of frame, {stats['exact_pixels']}% now exact (thr dE {stats['thr']})")
    if stats["bg_coverage"] > 97:
        print("  WARNING: background region covers almost the whole frame - subject may have no "
              "separation from the backdrop. Inspect the output.")
    print(f"  before: dE {before['dE']:5.2f} p95 {before['dE_p95']:5.2f} vignette {before['vignette']:+5.1f} {before['verdict']}")
    print(f"  after:  dE {after['dE']:5.2f} p95 {after['dE_p95']:5.2f} vignette {after['vignette']:+5.1f} {after['verdict']}")
    print(f"  wrote {dst}")
    return 0 if after["verdict"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
