---
"@asyncapi/cli": patch
---

fix: remove duplicate AsyncAPI spec loading in fromTemplate command

The fromTemplate command was loading the AsyncAPI file twice. Reuse the result from loadAsyncAPIInput() instead of loading again.
