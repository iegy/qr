# qrmo 2.0 — Validation Report

Date: 2026-08-20

## Passed

- JavaScript syntax check (`node --check`) for all project JS files.
- HTML integrity check for Arabic + English pages: no duplicate IDs and no missing local CSS/JS/icon resources.
- English pages use `lang=en`, `dir=ltr`, `/qr/en/` canonical URLs, and `../` shared assets.
- `manifest.json` parses successfully.
- `sitemap.xml` parses successfully and contains Arabic/English hreflang pairs.
- QR payload unit checks passed for vCard structured names, WhatsApp links and VEVENT dates.
- QR Health baseline test returned an excellent score for a high-contrast standard QR.
- Light-theme text contrast: ~15.55:1 (`#211E1A` on `#FBF7F1`).
- Dark-theme text contrast: ~16.33:1 (`#F4EFE7` on `#141210`).

## Environment limitation

A Chromium end-to-end localhost smoke test was attempted, but this execution environment blocks browser navigation to localhost/file URLs with `ERR_BLOCKED_BY_ADMINISTRATOR`. Static validation and unit checks above completed successfully; final browser/device testing should still be done after deployment, especially camera permissions, PWA installation and PDF download behavior.

## v2.0.1 regression checks

- Solid preset options explicitly clear stale gradient state.
- Generator draft state is restored from `qrmo-generator-draft-v2` after refresh.
- Service worker cache version bumped to `qrmo-v2.0.1`.

## v2.0.2 scanner patch

- `scanner.js`, `i18n.js`, and `sw.js` pass `node --check`.
- No duplicate HTML IDs were found after adding the torch control.
- Scanner i18n keys are present.
- Service worker cache bumped to `qrmo-v2.0.2`.
- Mobile camera algorithm now scans the centered viewfinder crop at higher effective resolution, then periodically scans the full frame.
- Native `BarcodeDetector` is used when available, with `jsQR` fallback.
- Physical-device camera behavior still needs final verification on the target phone after deployment because the build environment cannot access a real mobile camera.
