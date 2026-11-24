---
"@asyncapi/cli": patch
---

Pack the `NOTICE` file. npm always includes `README` and `LICENSE` from the package root regardless of
`files`, but `NOTICE` needs an explicit entry, so it had never reached the published tarball.
