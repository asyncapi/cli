---
'@asyncapi/cli': major
---

Removal of postman -> asyncapi conversion functionality

## ⚠ BREAKING CHANGES

Remove postman conversion utilities due to unmaintained dependencies and compatibility issues.

**Why this change?**
- The `postman2openapi` dependency causes multiple issues due to its WASM involvement
- WASM file loading causes browser compatibility issues after webpack updates
- Alternative libraries like `postman-to-openapi` did not provide adequate functionality
- The underlying dependencies are unmaintained and pose long-term maintenance risks

**Impact:**
- The `convert` command no longer supports postman format conversion
- Users relying on postman conversion will need to find alternative solutions

**Future:**
We can consider re-adding this feature after community discussion and establishing a sustainable maintenance plan with actively maintained dependencies.

Related: https://github.com/asyncapi/converter-js/pull/311