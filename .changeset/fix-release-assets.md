---
'@asyncapi/cli': patch
---

Fix installer generation and publish the GitHub Action image using native x64 and ARM64 builds.

Windows installers are x64 only, matching the existing Node.js 24 requirement.
