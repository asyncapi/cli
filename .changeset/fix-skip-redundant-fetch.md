---
"@asyncapi/cli": patch
---

fix: skip redundant AsyncAPI examples fetching during build

The fetch-asyncapi-example.js script was running on every build, even when examples already existed. Now it checks if examples.json exists before fetching.
