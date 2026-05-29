---
'@asyncapi/cli': patch
---

fix: resolve GitHub URLs with slash-based branches and multi-dot filenames

- Replace single-candidate URL conversion with retry-on-404 logic that tries
  all possible branch/path splits for GitHub blob URLs. Branch names such as
  `feature/my-fix` are now handled correctly without requiring any API
  pre-checks.
- Fix file extension detection in `fileExists` to use `path.extname()` instead
  of `name.split('.')[1]`, which returned the wrong segment for filenames with
  multiple dots (e.g. `my.asyncapi.yaml`).

Fixes #1940.
