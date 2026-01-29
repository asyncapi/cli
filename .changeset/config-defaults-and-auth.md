---
"@asyncapi/cli": minor
---

Add per-command config defaults and authentication commands for private $refs

**New Features:**

1. **Config Defaults** (#1914): Set default flags for commands to avoid repetitive typing
   - `asyncapi config defaults set <command> <flags>` - Set defaults for a command
   - `asyncapi config defaults list` - List all configured defaults
   - `asyncapi config defaults remove <command>` - Remove defaults for a command
   - Defaults are automatically applied when running commands
   - CLI flags still override defaults (precedence: CLI > defaults > oclif defaults)

2. **Auth Commands** (#1796): Configure authentication for private schema repositories
   - `asyncapi config auth list` - List configured auth entries
   - `asyncapi config auth remove <pattern>` - Remove auth configuration
   - `asyncapi config auth test <url>` - Test URL pattern matching
   - Tokens are stored as `${ENV_VAR}` templates and resolved at runtime
   - Enables validation of AsyncAPI files with private $refs

**Examples:**

```bash
# Set defaults to avoid typing same flags
asyncapi config defaults set validate --log-diagnostics --fail-severity error
asyncapi validate test.yaml  # Automatically uses defaults

# Configure authentication for private schemas
export GITHUB_TOKEN=ghp_your_token
asyncapi config auth add "https://github.com/myorg/*" '$GITHUB_TOKEN'
asyncapi validate asyncapi.yaml  # Private $refs now work!
```

**Technical Details:**
- Zero breaking changes - all changes are additive
- 98% test coverage on ConfigService
- Backward compatible with existing config files
- Security: Tokens resolved from environment variables at runtime
