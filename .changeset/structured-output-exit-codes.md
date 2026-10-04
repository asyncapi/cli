---
"@asyncapi/cli": minor
---

Add a global `--json` flag that returns a stable `{ status, message, data, errors }` envelope for every command, and replace the generic exit code `1` with categorized exit codes (10-19 validation, 20-29 generation, 30-39 file, 40-49 network, 50-59 CLI input/config, 60-69 server/runtime, 90-92 dependency/internal, 127 unknown command, 130 interrupted). Watch and server commands emit NDJSON lifecycle events in JSON mode. Scripts that checked for exit code `1` should switch to the new codes documented in `docs/codes.md`.
