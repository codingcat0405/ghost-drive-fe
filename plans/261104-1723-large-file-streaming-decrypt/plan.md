# Large file performance & mobile streaming playback

Status: done (pending real-device verification) | Branch: master | FE only (no BE / data format change)

## Problem
- Preview/download decrypts whole file into one in-memory Blob → OOM / tab crash / unplayable video on Chrome Android (600MB+).
- Worker pool created but chunks processed strictly sequentially → network & CPU never overlap.
- No retry on chunk PUT/GET → one flaky request kills whole upload on mobile.
- Bugs: preview size limit unit mismatch (limit never applies), blob has no MIME type, download duplicates blob in memory, object URLs never revoked, success toast fired before multipart complete, hooks after early return.

## Key insight
Existing format = fixed 25MB plaintext chunks, each `IV(12) | ciphertext | tag(16)`; small files = 1 chunk. Any plaintext byte range maps to exact encrypted byte ranges → random access possible without re-encryption.

## Phases
| # | Phase | Status |
|---|-------|--------|
| 1 | Bug fixes (preview limit, MIME, URL revoke, hooks order, success timing, orphan file entry cleanup) | done |
| 2 | Shared chunk layout + worker pool w/ task ids + cached CryptoKey + retry/concurrency helpers; parallel upload/download (2 mobile / 4 desktop) + wake lock | done |
| 3 | Service Worker `public/decrypt-stream-sw.js`: intercepts `/__ghost-stream/<id>/<name>`, serves Range (206) by fetching+decrypting only needed chunks, pull-based stream (bounded memory, 1 chunk prefetch) | done |
| 4 | Streaming download via SW (`Content-Disposition: attachment`, hidden iframe) → no Blob in RAM; Blob fallback when SW unavailable | done |
| 5 | Review fixes: one-shot download sessions + logout wipe, SW keep-alive pings, 403 → refresh presigned URL, ref-counted abortable chunk loads + stream cancel, narrowed retry policy, blob revoke delay, SW→page error reporting, hard-reload detection, memoized session recovery, HEAD short-circuit | done |

## Files
- create: `src/utils/encrypted-chunk-layout.ts`, `src/utils/crypto-worker-pool.ts`, `src/utils/async-retry-and-concurrency.ts`, `src/utils/screen-wake-lock.ts`, `src/utils/decrypt-stream-service-worker-client.ts`, `public/decrypt-stream-sw.js`
- create (also): `src/utils/chunked-encrypted-file-transfer.ts`, `src/utils/download-decrypted-file.ts`, `src/hooks/use-decrypted-file-preview.ts`
- modify: `src/utils/crypto.ts`, `src/utils/crypto-worker.ts`, `src/components/file-management/preview-file-dialog.tsx`, `src/components/file-management/upload-dialog.tsx`, `src/main.tsx`, `src/utils/README.md`

## Security
- AES key only held in memory (page registry + SW memory map), never persisted; SW re-requests session from page via MessageChannel if it was terminated.
- Stream URLs use random UUID ids, same-origin only, unregistered on dialog close.

## Risks
- SW needs secure context (HTTPS/localhost); hard-reload bypasses SW → automatic Blob fallback (≤100MB for media preview).
- 25MB chunk → first frame / far seek waits for ~25MB download+decrypt. Smaller chunks for new uploads need BE `chunkSize` column (future).
- Incomplete multipart parts on failure: no BE abort endpoint; MinIO stale-upload cleanup handles them.

## Verification
- `bun run build` (tsc -b + vite) passes. ESLint config broken pre-existing (`@typescript-eslint/no-explicit-any` key) — not run.
- Ad-hoc Bun e2e test of SW against real AES-GCM data: 48/48 checks (ranges, cross-chunk, suffix, 416, HEAD, cache, cancel→abort, one-shot download, 403 refresh, session recovery, clear-all, wrong key).
- Review report: `plans/reports/code-reviewer-261104-1723-large-file-streaming.md`

## Unresolved
- Real-device check: Chrome Android SW attachment download handoff + downloads > 5 min.
- Add BE `chunkSize` column (smaller chunks for faster first frame/seek) + abort-multipart endpoint later?
