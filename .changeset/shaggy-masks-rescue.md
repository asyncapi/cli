---
'@asyncapi/cli': major
---

## Major release with important security updates

- Keeping in mind the recent Shai-Hulud attack, we have adopted trusted publishing with NPM.
- This requires us to use node >= 24 and npm >= 11
- Next.js version is in sync with Studio, and is currently 14.2.35 deemed safe by CVE. [For more details](https://nextjs.org/blog/CVE-2025-66478)

### Breaking Changes
- Node.js version 24 or higher is now required.
- NPM version 11 or higher is now required.
- Next.js version is now 14.2.35 or higher.

Please make sure to update your environment accordingly before upgrading to this version.
