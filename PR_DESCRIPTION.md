Title: fix: preserve underlying error when validating registry URL

Summary

The `registryValidation` function in `src/utils/generate/registry.ts` previously caught all errors during registry URL validation and rethrew a generic Error that discarded the original error details. This made troubleshooting impossible for users because the underlying cause (DNS resolution, network timeout, TLS/SSL, proxy issues, etc.) was lost.

What I changed

- Capture the original error in the catch block and include its message in the thrown error text (`Caused by: ...`).
- Attach the original error to the thrown Error's `cause` property when possible so callers can inspect it programmatically.

Why

Preserving the original error helps users and maintainers diagnose registry connection issues more effectively.

Testing

- Ran `npm ci` and executed the CLI test suite (`npm run cli:test`). The repository has many test suites; I ran the CLI tests locally to validate behavior. The change is small and focused; adding a dedicated unit test for `registryValidation` is straightforward and I can add it if you'd like.

Notes

- I avoided changing the public API; callers still receive an Error but with helpful details and `error.cause` populated when available.

Suggested PR body for GitHub

This PR fixes #2013 — preserve the underlying error when validating `--registry-url` so users can see the root cause of failures (DNS, network, SSL, proxy, etc.).

Would you like me to create the GitHub PR automatically using the GitHub CLI (`gh`) or open a draft PR URL for you?