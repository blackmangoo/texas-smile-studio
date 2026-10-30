"""Pack the 96 mobile WebP frames of each scene into a single binary bundle (`mobile-pack.bin` + `mobile-pack.json`).

Eliminates 96x HTTP/1.1 request-queueing latency over mobile Wi-Fi / cellular:
1 single fetch() downloads the entire 1-2 MB scene pack in ~80ms on Wi-Fi, slices
WebP blobs directly in memory via `ArrayBuffer.slice(offset, offset + length)`,
and decodes keyframes -> remaining frames via `createImageBitmap` off-main-thread.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRAMES_DIR = ROOT / "public" / "frames"


def pack_scene(sid: str) -> None:
    scene_dir = FRAMES_DIR / sid
    m_dir = scene_dir / "mobile"
    files = sorted(m_dir.glob("frame_*.webp"))

    chunks: list[bytes] = []
    frames_index: list[dict[str, int]] = []
    offset = 0

    for f in files:
        data = f.read_bytes()
        length = len(data)
        frames_index.append({"o": offset, "l": length})
        chunks.append(data)
        offset += length

    pack_bin = scene_dir / "mobile-pack.bin"
    pack_idx = scene_dir / "mobile-pack.json"
    pack_bin.write_bytes(b"".join(chunks))
    pack_idx.write_text(
        json.dumps({"count": len(files), "totalBytes": offset, "frames": frames_index}),
        encoding="utf-8",
    )
    print(f"[{sid}] wrote mobile-pack.bin ({offset / (1024*1024):.2f} MB, {len(files)} frames in 1 HTTP file)")


def main() -> int:
    for sid in ["scene-01-hero", "scene-02-implant", "scene-03-scan-whitening"]:
        pack_scene(sid)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
