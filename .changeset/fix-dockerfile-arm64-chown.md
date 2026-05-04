---
"@asyncapi/cli": patch
---

Fix Docker arm64 build failure by using COPY --chown instead of recursive chown (fixes #1966)
