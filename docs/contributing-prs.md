---
title: 'Contributing via Pull Requests'
weight: 50
---

# Contributing via Pull Requests

## Before You Start

1. **Open an issue first** (unless it's a typo or trivial fix)
2. **Set up environment** - Follow [DEVELOPMENT.md](../DEVELOPMENT.md)
3. **Create a branch** - Use `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, or `chore/` prefix

## PR Checklist

### Before Submission

- [ ] Issue exists and is linked (if required)
- [ ] Branch synced with `main`
- [ ] `npm run build` passes
- [ ] `npm run cli:test` passes
- [ ] `npm run lint` passes (max 5 warnings)
- [ ] PR title follows [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] Changeset added (for `feat:` or `fix:` PRs)
- [ ] Documentation updated (if needed)
- [ ] No `console.log` or commented code

### Code Quality

- [ ] Follows existing code patterns
- [ ] TypeScript types (avoid `any`)
- [ ] Error handling implemented
- [ ] Tests added for new functionality
- [ ] Meaningful variable/function names

## PR Title Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>
```

**Types:**
- `feat:` - New feature (MINOR release)
- `fix:` - Bug fix (PATCH release)
- `docs:` - Documentation (no release)
- `chore:` - Maintenance (no release)
- `test:` - Tests only (no release)
- `refactor:` - Refactoring (no release)

**Breaking changes:** Add `!` → `feat!:`, `fix!:`

**Examples:**
- ✅ `feat: add AsyncAPI 3.0 validation support`
- ✅ `fix: resolve context loading with special characters`
- ❌ `Added new feature`
- ❌ `fix bug`

## PR Description Template

```markdown
## Description
Brief description of changes.

## Related Issue
Closes #123

## Changes Made
- Change 1
- Change 2

## Testing
- [ ] Tests added/updated
- [ ] All tests pass locally
```

## Code Standards

- **TypeScript**: Explicit types, interfaces for objects, prefer `const`
- **Organization**: Follow existing structure, use path aliases (`@/`, `@cli/`, `@domains/`)
- **Errors**: Use custom errors from `src/errors/`, return `ServiceResult<T>` from services
- **Commands**: Extend base `Command`, use domain services for business logic

## Testing

**Add tests for:**
- New commands or API endpoints
- Bug fixes (regression tests)
- New domain services
- Complex business logic

```bash
npm run cli:test      # All tests
npm run unit:test     # Unit tests only
```

## Changesets

**Add changeset if:**
- `feat:` or `fix:` PR (triggers release)
- Breaking changes (`feat!:`, `fix!:`)

**No changeset for:**
- `docs:`, `test:`, `refactor:`, `chore:`

**Create changeset:**
```bash
npx -p @changesets/cli@2.27.7 changeset
```

Or manually: `.changeset/<name>.md`
```markdown
---
"@asyncapi/cli": minor
---

Description of changes
```

## Common Mistakes

❌ **Avoid:**
- Large PRs (>500 lines) - Keep focused
- Multiple concerns in one PR
- Skipping tests
- Hardcoded values
- `console.log` statements
- Force push to main

✅ **Do:**
- Small, focused PRs
- One issue per PR
- Comprehensive tests
- Externalize configuration
- Clean commit messages
- Rebase instead of merge

## Review Process

1. CI runs automated checks
2. Maintainers review code
3. Address feedback promptly
4. PR merged when approved

**Responding to reviews:**
- Address feedback within a few days
- Ask questions if unclear
- Mark conversations as resolved

## Quick Reference

```bash
# Setup
npm install && npx lefthook install

# Before PR
npm run build && npm run lint && npm run cli:test
```

**Commit examples:**
- `feat: add custom validation rules`
- `fix: resolve context loading issue`
- `docs: update installation guide`

---

**Quality over speed** - Write good code, tests, and documentation.
