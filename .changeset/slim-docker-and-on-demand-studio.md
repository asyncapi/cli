---
"@asyncapi/cli": minor
---

feat: reduce install/image size by making AsyncAPI Studio an on-demand dependency

`@asyncapi/studio` (and its transitive `next`) is no longer a runtime dependency — it is now a `devDependency`, so end-user (`npm install -g`) and Docker (`--omit=dev`) installs are ~450MB smaller, while its version stays tracked and locked for development. The first time you run `start studio`, `start preview`, or `new --studio` without Studio present, the CLI installs it on-demand into its data directory (the version is read from the CLI's declared `@asyncapi/studio` range). Pass `--yes`/`-y` (or set `ASYNCAPI_STUDIO_AUTO_INSTALL=1`) to install it without a prompt in non-interactive environments. The dead `generator-v2` dependency was also removed and the Docker image was slimmed further (removed the unused build toolchain, kept chromium for PDF generation).
