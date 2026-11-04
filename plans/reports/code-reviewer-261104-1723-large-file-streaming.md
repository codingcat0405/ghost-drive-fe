# Code review: large-file streaming decrypt

Status: DONE_WITH_CONCERNS → fixes applied. Format backward compatible (25MB chunks, IV|ct|tag, single-PUT <25MB unchanged).

| # | Sev | Finding | Outcome |
|---|-----|---------|---------|
| 1 | High | Download sessions never released → AES key + decrypted chunks survive logout | Fixed: one-shot download sessions dropped by SW on finish/cancel/error (`stream-finished`/`stream-error`), 6h TTL, `clearAllDecryptStreams()` on `aesKeyPlain` cleared |
| 2 | High | SW may be terminated mid long download | Fixed: page keep-alive ping every 20s while downloads active (no `waitUntil` — 5-min event cap) |
| 3 | High | Presigned URL expiry mid-stream; 403 retried pointlessly | Fixed: on 403 SW asks page for fresh URL once; 4xx (≠429) not retried |
| 4 | High | Seeking piles up 25MB fetches; no cancel | Fixed: ref-counted chunk entries, unreferenced in-flight loads aborted, stream `cancel()`, `highWaterMark: 0` |
| 5 | Med | completeMultipart retry non-idempotent; axios 4xx retried | Fixed retry policy (network/5xx/429 only). If complete succeeded but reply lost, entry deletion also deletes object on BE → consistent |
| 6 | Med | Preview blob URL revoked right after Download click | Fixed: revoke delayed 60s |
| 7 | Med | Streamed download fails silently | Fixed: SW broadcasts `stream-error` → toast |
| 8 | Med | Hard reload adds 3s wait each time | Fixed: detect pre-existing active SW + no controller → cache `false` |
| 9 | Med | Orphan cleanup maybe no-op | Verified: BE returns File entity w/ `id`; `DELETE /files/:id` removes MinIO object |
| 10 | Med | Concurrent session recovery race; sequential client asks | Fixed: memoized lookup, parallel asks |
| 13 | Low | HEAD triggers chunk fetch | Fixed |
| 16 | Low | Empty reason when no PIN | Fixed |
| 11,12,14,15,17 | Low | Pool onerror scope, lanes after failure, image limit 50MB fallback only, no abort of blob decrypt, no resumable downloads | Accepted |

## Unresolved
- Real-device verification on Chrome Android: SW attachment download handoff, downloads > 5 min, playback of large MP4.
