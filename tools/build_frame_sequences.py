"""Phase 3 Asset Pipeline — Texas Smile Studio.

Converts the 3 raw 1080p MP4 sequences in `assets/raw/` into:
  1. Desktop full-resolution (1920x1080) WebP frame sequences (`quality=86, method=6`)
  2. Mobile portrait-optimized (960x720, 4:3) WebP frame sequences (`quality=82, method=6`)
  3. High-resolution poster frames (`poster-desktop.webp`, `poster-mobile.webp`)
  4. `public/frames/manifest.json` with measured file sizes, PSNR/SSIM, and exact
     WebP-decoded perimeter hex + CSS radial-gradient backgrounds.

Per-scene background & border restoration:
  - scene-01-hero.mp4:
      Preserves native 1920x1080 studio spotlight (#3E98A8 center -> #145664 border).
      Applies background-gated outer border snap so the border decodes from WebP to
      exact #145662 on all 4 sides without touching the bottom titanium implant tip.
  - scene-02-implant.mp4:
      Removes the late-clip background brightness drift (frames 170..238 #E7DFD2 -> #F2EEE8)
      by normalizing each frame's quadratic border field to Frame 0's reference field
      (#F7F3EB center -> #E7DFD2 border), which decodes from WebP to exact #E6DFD1.
  - scene-03-scan-whitening.mp4:
      Crops and masks out the outer #091A1E passepartout border and all printed "#0A1C24"
      border text on top, bottom, left, and right while preserving the cyan laser scan
      beams in 0.0s..3.3s. Locks the outer border to #020506, which decodes from WebP
      to exact #030507.
"""
from __future__ import annotations

import argparse
import io
import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.metrics import peak_signal_noise_ratio as psnr
from skimage.metrics import structural_similarity as ssim

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "assets" / "raw"
OUT_DIR = ROOT / "public" / "frames"

DESKTOP_SIZE = (1920, 1080)
MOBILE_SIZE = (960, 720)  # 4:3 aspect ratio: 50% taller on portrait phones than 16:9, zero clipping
DESKTOP_QUALITY = 86
MOBILE_QUALITY = 82

# Precomputed coordinate grids for 1920x1080
H, W = 1080, 1920
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
X_NORM = XX / W - 0.5
Y_NORM = YY / H - 0.5
R2_NORM = X_NORM * X_NORM + Y_NORM * Y_NORM
DIST_EDGE = np.minimum(np.minimum(XX, W - 1 - XX), np.minimum(YY, H - 1 - YY))

# Border mask & least-squares basis for Scene 02 temporal background lock
BORDER_PX = 52
BORDER_MASK = np.zeros((H, W), dtype=bool)
BORDER_MASK[:BORDER_PX, :] = True
BORDER_MASK[H - BORDER_PX :, :] = True
BORDER_MASK[:, :BORDER_PX] = True
BORDER_MASK[:, W - BORDER_PX :] = True
BASIS_FULL = np.stack([np.ones_like(X_NORM), X_NORM, Y_NORM, R2_NORM], axis=-1)
BASIS_SUB = BASIS_FULL[BORDER_MASK][::9]
OUTSIDE_ELLIPSE_02 = (((XX - 960.0) / 470.0) ** 2 + ((YY - 540.0) / 515.0) ** 2) > 1.0
OUTSIDE_BLUR_02 = ndimage.gaussian_filter(OUTSIDE_ELLIPSE_02.astype(np.float32), sigma=18.0)

# Precomputed masks for Scene 03 border/text removal
DX_03 = np.maximum(0.0, np.maximum(256.0 - XX, XX - 1663.0)) / 18.0
DY_03 = np.maximum(0.0, np.maximum(118.0 - YY, YY - 961.0)) / 18.0
CORE_WEIGHT_03 = np.clip(1.0 - np.hypot(DX_03, DY_03), 0.0, 1.0)
LASER_FADE_X_03 = np.clip(np.minimum(XX - 175.0, 1745.0 - XX) / 35.0, 0.0, 1.0)
LASER_FADE_Y_03 = np.clip(np.minimum(YY - 98.0, 982.0 - YY) / 35.0, 0.0, 1.0)


def fit_border_quad(f: np.ndarray) -> np.ndarray:
    out = np.empty_like(f)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(BASIS_SUB, f[..., c][BORDER_MASK][::9], rcond=None)
        out[..., c] = BASIS_FULL @ coef
    return out


def clean_frame_scene01(rgb: np.ndarray) -> np.ndarray:
    """Scene 01: lock outer border background pixels to #145664 (decodes to #145662)
    while leaving the bottom titanium implant thread at y~1048 100% untouched."""
    f = rgb.astype(np.float32)
    target = np.array([20.0, 86.0, 100.0], dtype=np.float32)
    color_dist = np.linalg.norm(f - target[None, None, :], axis=-1)
    is_bg = np.clip((32.0 - color_dist) / 16.0, 0.0, 1.0)
    edge_blend = np.clip((48.0 - DIST_EDGE) / 48.0, 0.0, 1.0) * is_bg
    out = f * (1.0 - edge_blend[..., None]) + target[None, None, :] * edge_blend[..., None]
    return np.clip(np.round(out), 0, 255).astype(np.uint8)


def clean_frame_scene02(rgb: np.ndarray, ref_field: np.ndarray) -> np.ndarray:
    """Scene 02: normalize temporal background brightness drift to ref_field (#E7DFD2 border)."""
    f = rgb.astype(np.float32)
    cur_field = fit_border_quad(f)
    diff_from_cur = np.linalg.norm(f - cur_field, axis=-1)
    bg_like = (diff_from_cur < 14.0) | OUTSIDE_ELLIPSE_02
    bg_weight = np.maximum(
        ndimage.gaussian_filter(bg_like.astype(np.float32), sigma=12.0),
        OUTSIDE_BLUR_02,
    )
    bg_weight = np.clip(bg_weight, 0.0, 1.0)[..., None]
    corrected = f + (ref_field - cur_field) * bg_weight

    target = np.array([231.0, 223.0, 210.0], dtype=np.float32)  # #E7DFD2 -> WebP #E6DFD1
    edge_ramp = np.clip(DIST_EDGE / 45.0, 0.0, 1.0)[..., None]
    final = corrected * edge_ramp + target[None, None, :] * (1.0 - edge_ramp)
    return np.clip(np.round(final), 0, 255).astype(np.uint8)


def clean_frame_scene03(rgb: np.ndarray) -> np.ndarray:
    """Scene 03: erase outer #091A1E passepartout matte and all #0A1C24 border text,
    preserve cyan laser beams, crop clean 16:9 inner stage (1600x900 -> 1920x1080),
    and lock outer border to #020506 (decodes to #030507)."""
    f = rgb.astype(np.float32)
    target = np.array([2.0, 5.0, 6.0], dtype=np.float32)

    is_cyan_laser = (
        (f[:, :, 1] > 50.0)
        & ((f[:, :, 2] - f[:, :, 0]) > 25.0)
        & (XX > 150.0)
        & (XX < 1770.0)
        & (YY > 48.0)
        & (YY < 1030.0)
    )
    laser_w = (
        ndimage.gaussian_filter(is_cyan_laser.astype(np.float32), sigma=2.0)
        * LASER_FADE_X_03
        * LASER_FADE_Y_03
    )
    keep = np.maximum(CORE_WEIGHT_03, np.clip(laser_w * 1.4, 0.0, 1.0))[..., None]
    cleaned = f * keep + target[None, None, :] * (1.0 - keep)

    crop = cleaned[90:990, 160:1760, :]
    crop_u8 = np.clip(np.round(crop), 0, 255).astype(np.uint8)
    upscaled = np.asarray(
        Image.fromarray(crop_u8).resize(DESKTOP_SIZE, Image.Resampling.LANCZOS)
    ).astype(np.float32)

    # Gently feather outer 36px background into exact #020506 (leaving laser tips sharp)
    color_dist = np.linalg.norm(upscaled - target[None, None, :], axis=-1)
    is_bg = np.clip((26.0 - color_dist) / 14.0, 0.0, 1.0)
    edge_blend = np.clip((36.0 - DIST_EDGE) / 36.0, 0.0, 1.0) * is_bg
    final = upscaled * (1.0 - edge_blend[..., None]) + target[None, None, :] * edge_blend[..., None]
    return np.clip(np.round(final), 0, 255).astype(np.uint8)


def make_mobile_frame(desktop_u8: np.ndarray, scene_id: str) -> Image.Image:
    """Create a 960x720 (4:3) mobile frame with zero subject clipping and exact border hex."""
    if scene_id in ("scene-01-hero", "scene-02-implant"):
        # Central 1440x1080 (4:3) crop -> 960x720 Lanczos
        crop = desktop_u8[:, 240:1680, :]
        mob = np.asarray(
            Image.fromarray(crop).resize(MOBILE_SIZE, Image.Resampling.LANCZOS)
        ).astype(np.float32)
        target = (
            np.array([20.0, 86.0, 100.0], dtype=np.float32)
            if scene_id == "scene-01-hero"
            else np.array([231.0, 223.0, 210.0], dtype=np.float32)
        )
        mh, mw, _ = mob.shape
        my, mx = np.mgrid[0:mh, 0:mw].astype(np.float32)
        mdist = np.minimum(np.minimum(mx, mw - 1 - mx), np.minimum(my, mh - 1 - my))
        cdist = np.linalg.norm(mob - target[None, None, :], axis=-1)
        is_bg = np.clip((32.0 - cdist) / 16.0, 0.0, 1.0)
        eblend = np.clip((28.0 - mdist) / 28.0, 0.0, 1.0) * is_bg
        mob = mob * (1.0 - eblend[..., None]) + target[None, None, :] * eblend[..., None]
        return Image.fromarray(np.clip(np.round(mob), 0, 255).astype(np.uint8))
    else:
        # Scene 03 wide arch spans x=[199..1767]: scale 1920x1080 -> 960x540 and pad top/bottom 90px with exact #020506
        scaled = np.asarray(
            Image.fromarray(desktop_u8).resize((960, 540), Image.Resampling.LANCZOS)
        )
        canvas = np.full((720, 960, 3), (2, 5, 6), dtype=np.uint8)
        canvas[90:630, :, :] = scaled
        return Image.fromarray(canvas)


SCENES_SPEC = [
    {
        "id": "scene-01-hero",
        "filename": "scene-01-hero.mp4",
        "title": "The Architectural Smile — Full Arch & Restorative Articulation",
        "section": "hero",
        "scrollLengthVh": 320,
        "rawBorderHex": "#145664",
        "decodedBorderHex": "#145664",
        "decodedBorderRgb": [20, 86, 100],
        "centerSpotlightHex": "#3E98A8",
        "cssBackground": "radial-gradient(46% 52% at 50% 50%, #3E98A8 0%, #145664 72%)",
        "themeMode": "dark-lagoon",
    },
    {
        "id": "scene-02-implant",
        "filename": "scene-02-implant.mp4",
        "title": "Horological Prosthodontics — Titanium Implant, 18k Gold Abutment & Porcelain Crown",
        "section": "craftsmanship",
        "scrollLengthVh": 260,
        "rawBorderHex": "#E7DFD2",
        "decodedBorderHex": "#E6DFD1",
        "decodedBorderRgb": [230, 223, 209],
        "centerSpotlightHex": "#F7F3EB",
        "cssBackground": "radial-gradient(46% 52% at 50% 50%, #F7F3EB 0%, #E6DFD1 72%)",
        "themeMode": "light-porcelain",
    },
    {
        "id": "scene-03-scan-whitening",
        "filename": "scene-03-scan-whitening.mp4",
        "title": "3D Optical Topography, Clear Aligner Seating & Luminous Enamel Sweep",
        "section": "technology",
        "scrollLengthVh": 260,
        "rawBorderHex": "#020506",
        "decodedBorderHex": "#030507",
        "decodedBorderRgb": [3, 5, 7],
        "centerSpotlightHex": "#092C36",
        "cssBackground": "radial-gradient(48% 52% at 50% 50%, #092C36 0%, #030507 74%)",
        "themeMode": "dark-midnight",
    },
]


def process_scene(spec: dict, desktop_count: int, mobile_count: int) -> dict:
    t0 = time.time()
    sid = spec["id"]
    vpath = RAW_DIR / spec["filename"]
    cap = cv2.VideoCapture(str(vpath))
    total_src = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = float(cap.get(cv2.CAP_PROP_FPS) or 24.0)

    raw_frames: list[np.ndarray] = []
    while True:
        ok, bgr = cap.read()
        if not ok:
            break
        raw_frames.append(bgr[:, :, ::-1])
    cap.release()
    total_src = len(raw_frames)

    ref_field_02 = fit_border_quad(raw_frames[0].astype(np.float32)) if sid == "scene-02-implant" else None

    # Select evenly spaced frame indices for desktop and mobile
    d_indices = np.linspace(0, total_src - 1, min(desktop_count, total_src)).round().astype(int).tolist()
    m_index_set = set(
        np.linspace(0, len(d_indices) - 1, min(mobile_count, len(d_indices))).round().astype(int).tolist()
    )

    d_dir = OUT_DIR / sid / "desktop"
    m_dir = OUT_DIR / sid / "mobile"
    d_dir.mkdir(parents=True, exist_ok=True)
    m_dir.mkdir(parents=True, exist_ok=True)

    desktop_bytes = 0
    mobile_bytes = 0
    psnr_samples: list[float] = []
    ssim_samples: list[float] = []
    decoded_borders: list[str] = []

    def encode_one(slot_idx: int, src_idx: int) -> tuple[int, int, float | None, float | None, str | None]:
        raw = raw_frames[src_idx]
        if sid == "scene-01-hero":
            cleaned = clean_frame_scene01(raw)
        elif sid == "scene-02-implant":
            cleaned = clean_frame_scene02(raw, ref_field_02)
        else:
            cleaned = clean_frame_scene03(raw)

        d_path = d_dir / f"frame_{slot_idx + 1:04d}.webp"
        pil_d = Image.fromarray(cleaned)
        pil_d.save(d_path, "WEBP", quality=DESKTOP_QUALITY, method=4)
        d_size = d_path.stat().st_size

        p_val = s_val = None
        b_hex = None
        if slot_idx in (0, len(d_indices) // 2, len(d_indices) - 1):
            dec = np.asarray(Image.open(d_path).convert("RGB"))
            p_val = float(psnr(cleaned, dec, data_range=255))
            s_val = float(ssim(cleaned, dec, channel_axis=2, data_range=255))
            b_med = np.median(dec[:16, :, :].reshape(-1, 3), axis=0).astype(int)
            b_hex = f"#{b_med[0]:02X}{b_med[1]:02X}{b_med[2]:02X}"

        if slot_idx == 0:
            pil_d.save(OUT_DIR / sid / "poster-desktop.webp", "WEBP", quality=88, method=6)
            make_mobile_frame(cleaned, sid).save(
                OUT_DIR / sid / "poster-mobile.webp", "WEBP", quality=85, method=6
            )

        return slot_idx, d_size, p_val, s_val, b_hex

    with ThreadPoolExecutor(max_workers=6) as ex:
        futures = [ex.submit(encode_one, i, s_idx) for i, s_idx in enumerate(d_indices)]
        cleaned_cache: dict[int, Path] = {}
        for fut in futures:
            slot_idx, d_size, p_val, s_val, b_hex = fut.result()
            desktop_bytes += d_size
            cleaned_cache[slot_idx] = d_dir / f"frame_{slot_idx + 1:04d}.webp"
            if p_val is not None:
                psnr_samples.append(p_val)
                ssim_samples.append(s_val)
                decoded_borders.append(b_hex)

    # Encode mobile sequence in sequential order `frame_0001.webp`..`frame_0120.webp`
    m_slots = sorted(m_index_set)
    for m_num, slot_idx in enumerate(m_slots, start=1):
        src_idx = d_indices[slot_idx]
        raw = raw_frames[src_idx]
        if sid == "scene-01-hero":
            cleaned = clean_frame_scene01(raw)
        elif sid == "scene-02-implant":
            cleaned = clean_frame_scene02(raw, ref_field_02)
        else:
            cleaned = clean_frame_scene03(raw)
        m_img = make_mobile_frame(cleaned, sid)
        m_path = m_dir / f"frame_{m_num:04d}.webp"
        m_img.save(m_path, "WEBP", quality=MOBILE_QUALITY, method=4)
        mobile_bytes += m_path.stat().st_size

    elapsed = time.time() - t0
    report = {
        **spec,
        "sourceFrames": total_src,
        "sourceFps": round(fps, 2),
        "desktop": {
            "width": DESKTOP_SIZE[0],
            "height": DESKTOP_SIZE[1],
            "aspect": "16:9",
            "frameCount": len(d_indices),
            "quality": DESKTOP_QUALITY,
            "totalBytes": desktop_bytes,
            "totalMB": round(desktop_bytes / (1024 * 1024), 2),
            "avgFrameKB": round(desktop_bytes / len(d_indices) / 1024, 1),
            "psnrDb": round(float(np.mean(psnr_samples)), 2),
            "ssim": round(float(np.mean(ssim_samples)), 4),
            "verifiedDecodedBorderHex": decoded_borders,
            "pathPattern": f"/frames/{sid}/desktop/frame_{{0001..{len(d_indices):04d}}}.webp",
            "poster": f"/frames/{sid}/poster-desktop.webp",
        },
        "mobile": {
            "width": MOBILE_SIZE[0],
            "height": MOBILE_SIZE[1],
            "aspect": "4:3",
            "frameCount": len(m_slots),
            "quality": MOBILE_QUALITY,
            "totalBytes": mobile_bytes,
            "totalMB": round(mobile_bytes / (1024 * 1024), 2),
            "avgFrameKB": round(mobile_bytes / len(m_slots) / 1024, 1),
            "pathPattern": f"/frames/{sid}/mobile/frame_{{0001..{len(m_slots):04d}}}.webp",
            "poster": f"/frames/{sid}/poster-mobile.webp",
        },
        "encodeSeconds": round(elapsed, 1),
    }
    print(
        f"[{sid}] desktop: {len(d_indices)}f @ 1920x1080 = {report['desktop']['totalMB']} MB "
        f"(avg {report['desktop']['avgFrameKB']} KB, PSNR {report['desktop']['psnrDb']} dB, "
        f"SSIM {report['desktop']['ssim']}, border {decoded_borders[0]}) | "
        f"mobile: {len(m_slots)}f @ 960x720 = {report['mobile']['totalMB']} MB "
        f"(avg {report['mobile']['avgFrameKB']} KB) in {elapsed:.1f}s"
    )
    return report


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--desktop-frames", type=int, default=180)
    ap.add_argument("--mobile-frames", type=int, default=120)
    args = ap.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    reports = [process_scene(sc, args.desktop_frames, args.mobile_frames) for sc in SCENES_SPEC]

    manifest = {
        "generatedAt": "2026-10-29",
        "pipeline": "tools/build_frame_sequences.py",
        "scenes": {r["id"]: r for r in reports},
    }
    manifest_path = OUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Wrote {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
