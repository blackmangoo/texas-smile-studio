"""Build v3 cache-busted 16:9 (854x480, 144-frame) radially-feathered mobile packs.

Fixes:
  1. Preserves exact 16:9 desktop framing (854x480 = 2x Retina for 427px phones)
     so teeth, implants, and aligners are 100% centered and NEVER cropped.
  2. Uses 144 frames per scene (matching desktop smoothness!) packed into a single
     cache-busted `mobile-pack-v3.bin` + `poster-mobile-v3.webp` so phones & CDNs
     never serve stale cached files.
  3. Bakes a smooth 360-degree elliptical radial feather directly into the 16:9
     frame borders against each scene's exact Chromium background hex.
"""
from __future__ import annotations

import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FRAMES_DIR = ROOT / "public" / "frames"

MOB_W, MOB_H = 854, 480
MOB_COUNT = 144
MOB_QUALITY = 82

# Precompute 360-degree elliptical radial feather for 854x480 (16:9)
YY, XX = np.mgrid[0:MOB_H, 0:MOB_W].astype(np.float32)
RX = (XX - MOB_W * 0.5) / (MOB_W * 0.49)
RY = (YY - MOB_H * 0.5) / (MOB_H * 0.49)
RAD = np.hypot(RX, RY)
T_RAMP = np.clip((RAD - 0.66) / (0.98 - 0.66), 0.0, 1.0)
RADIAL_ALPHA = (0.5 * (1.0 + np.cos(np.pi * T_RAMP)))[..., None].astype(np.float32)

SCENE_TARGETS = {
    "scene-01-hero": np.array([20.0, 86.0, 100.0], dtype=np.float32),       # #135865
    "scene-02-implant": np.array([231.0, 223.0, 210.0], dtype=np.float32),  # #E6DFD1
    "scene-03-scan-whitening": np.array([1.0, 3.0, 4.0], dtype=np.float32), # #010304
}


def build_v3_scene(sid: str, target_rgb: np.ndarray) -> dict:
    t0 = time.time()
    scene_dir = FRAMES_DIR / sid
    d_dir = scene_dir / "desktop"
    m_dir = scene_dir / "mobile"

    # Remove old unversioned mobile packs & frames to keep repo lean
    for old_pack in ["mobile-pack.bin", "mobile-pack.json"]:
        p = scene_dir / old_pack
        if p.exists():
            p.unlink()
    for old_f in m_dir.glob("frame_*.webp"):
        old_f.unlink()

    d_files = sorted(d_dir.glob("frame_*.webp"))
    picks = np.linspace(0, len(d_files) - 1, MOB_COUNT).round().astype(int).tolist()

    def encode_frame(pair: tuple[int, int]) -> tuple[int, bytes]:
        m_idx0, d_idx0 = pair
        src = Image.open(d_files[d_idx0]).convert("RGB")
        scaled = np.asarray(
            src.resize((MOB_W, MOB_H), Image.Resampling.LANCZOS)
        ).astype(np.float32)

        # For Scene 01 bottom titanium implant tip (around x=500..570 in 854w, y>430),
        # gate feather by background similarity so metal threads stay 100% opaque
        if sid == "scene-01-hero":
            cdist = np.linalg.norm(scaled - target_rgb[None, None, :], axis=-1, keepdims=True)
            is_not_bg = np.clip((cdist - 28.0) / 22.0, 0.0, 1.0)
            eff_alpha = np.maximum(RADIAL_ALPHA, is_not_bg)
        else:
            eff_alpha = RADIAL_ALPHA

        baked = scaled * eff_alpha + target_rgb[None, None, :] * (1.0 - eff_alpha)
        baked_u8 = np.clip(np.round(baked), 0, 255).astype(np.uint8)
        pil_out = Image.fromarray(baked_u8)

        if m_idx0 == 0:
            pil_out.save(scene_dir / "poster-mobile-v3.webp", "WEBP", quality=86, method=6)
        # Also save key Before/After mobile frames used in <picture> comparator
        if sid == "scene-03-scan-whitening" and m_idx0 in (47, MOB_COUNT - 1):
            pil_out.save(m_dir / f"frame_v3_{m_idx0 + 1:04d}.webp", "WEBP", quality=85, method=6)

        import io
        buf = io.BytesIO()
        pil_out.save(buf, "WEBP", quality=MOB_QUALITY, method=5)
        return m_idx0, buf.getvalue()

    with ThreadPoolExecutor(max_workers=8) as ex:
        encoded = list(ex.map(encode_frame, enumerate(picks)))

    encoded.sort(key=lambda item: item[0])
    chunks: list[bytes] = []
    index_entries: list[dict[str, int]] = []
    offset = 0
    for _, raw_bytes in encoded:
        length = len(raw_bytes)
        index_entries.append({"o": offset, "l": length})
        chunks.append(raw_bytes)
        offset += length

    (scene_dir / "mobile-pack-v3.bin").write_bytes(b"".join(chunks))
    (scene_dir / "mobile-pack-v3.json").write_text(
        json.dumps(
            {
                "version": 3,
                "width": MOB_W,
                "height": MOB_H,
                "count": MOB_COUNT,
                "totalBytes": offset,
                "frames": index_entries,
            }
        ),
        encoding="utf-8",
    )

    dt = time.time() - t0
    info = {
        "version": 3,
        "width": MOB_W,
        "height": MOB_H,
        "aspect": "16:9",
        "frameCount": MOB_COUNT,
        "quality": MOB_QUALITY,
        "totalBytes": offset,
        "totalMB": round(offset / (1024 * 1024), 2),
        "avgFrameKB": round(offset / MOB_COUNT / 1024, 1),
        "packBin": f"/frames/{sid}/mobile-pack-v3.bin",
        "packJson": f"/frames/{sid}/mobile-pack-v3.json",
        "poster": f"/frames/{sid}/poster-mobile-v3.webp",
    }
    print(
        f"[{sid}] v3 16:9 854x480 x {MOB_COUNT}f = {info['totalMB']} MB "
        f"(avg {info['avgFrameKB']} KB/frame) in {dt:.1f}s"
    )
    return info


def main() -> int:
    manifest_path = FRAMES_DIR / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for sid, tgt in SCENE_TARGETS.items():
        manifest["scenes"][sid]["mobile"] = build_v3_scene(sid, tgt)
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
