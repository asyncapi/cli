---
"@asyncapi/cli": minor
---

feat: reduce install/image size by making AsyncAPI Studio an on-demand dependency

`@asyncapi/studio` (and its transitive `next`) is no longer a hard dependency, cutting the default `npm install` and the Docker image size by roughly ~450MB. The first time you run `start studio`, `start preview`, or `new --studio`, the CLI installs Studio on-demand into its data directory. Pass `--yes`/`-y` (or set `ASYNCAPI_STUDIO_AUTO_INSTALL=1`) to install it without a prompt in non-interactive environments. The dead `generator-v2` dependency was also removed and the Docker image was slimmed further (removed the unused build toolchain, kept chromium for PDF generation).
