---
"@asyncapi/cli": patch
---

fix: prune the unused Next.js standalone build from `@asyncapi/studio` before packing so the Windows installer no longer exceeds the 260-character `MAX_PATH` limit.
