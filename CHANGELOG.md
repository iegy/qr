# qrmo Changelog

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
