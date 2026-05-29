---
'@asyncapi/cli': patch
---

fix: github URL parsing for slash-based branches and multi-dot filenames

- Update GitHub blob URL regex to support branch names with slashes (e.g., feature/new-validation)
- Use path.extname() instead of split('.') for reliable file extension detection
- Fixes issue #1940 where URLs with slash-based branch names failed to parse
