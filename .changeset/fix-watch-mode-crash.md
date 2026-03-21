---
"@asyncapi/cli": patch
---

fix: call standalone isLocalTemplate function instead of thisArg.isLocalTemplate in runWatchMode to prevent TypeError crash when using --watch flag
