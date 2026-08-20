# qrmo Changelog

## 2.0.2 — 2026-08-20

- Fixed mobile camera scanning reliability: the scanner now decodes the viewfinder area at higher effective resolution before trying the full frame.
- Added native `BarcodeDetector` on supported Android/Chromium browsers with `jsQR` as a fallback.
- Increased full-frame fallback resolution without returning to a 60fps CPU-heavy loop.
- Requests continuous focus/exposure/white-balance when the camera supports them.
- Added a torch/flash control on supported rear cameras.
- Added a second CDN fallback for `jsQR` plus an explicit decoder-load error instead of silently failing.
- Bumped the service-worker cache to `qrmo-v2.0.2`.

## 2.0.1 — 2026-08-20

- Fixed preset/color rendering where an old gradient could remain active after choosing a solid-color template.
- Added automatic generator draft persistence: the current QR type, form data, colors, gradient, shapes, error correction, size, frame, print settings and folder are restored after refresh.
- Template highlighting now reflects the actual current design instead of staying selected after manual customization.
- Bumped the service-worker cache so deployed clients receive the corrected generator files.

## 2.0.0 — 2026-08-20

- Aligned light/dark theme with the visual system used on iegy.net (warm cream, ink, sage, sand and ember palette) and switched the interface typography to Cairo + JetBrains Mono.
- Fixed vCard `N` field escaping so structured name separators stay valid.
- Added WhatsApp, calendar event, social profile and review QR types (12 generator types total).
- Added six design templates and an iegy-branded default preset.
- Added QR Health score (contrast, density, logo/error-correction and real decode round-trip).
- Added high-resolution print PNG, A4 PDF and printable sticker-sheet tools.
- Replaced the 20-item localStorage saved library with IndexedDB, including logos, folders, search, favorites, duplicate, JSON backup and restore.
- Improved camera scanning performance with throttled/downscaled frames and inverted-code support.
- Added CSV header detection and column mapping for label, value, type and per-row color in bulk generation.
- Added indexable `/en/` URLs with English metadata, canonical/hreflang signals and sitemap entries.
- Updated the service worker to precache the new pages and third-party QR/ZIP/scan/PDF libraries for offline use.
