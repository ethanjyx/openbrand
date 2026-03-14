# Changelog

## [0.2.0] - 2026-03-14

### Changed

- **Breaking:** `extractBrandAssets()` now returns `{ ok: true, data }` or `{ ok: false, error }` instead of `data | null`
- Error responses include structured codes: `ACCESS_BLOCKED`, `NOT_FOUND`, `SERVER_ERROR`, `NETWORK_ERROR`, `EMPTY_CONTENT`
- Each error includes a human-readable `message` explaining the issue

## [0.1.1] - 2026-03-07

### Fixed

- Initial stable release with brand asset extraction (logos, colors, backdrops)
