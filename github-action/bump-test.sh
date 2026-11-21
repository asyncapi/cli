#!/usr/bin/env bash
set -euo pipefail

# Validate semantic version and the whole generated action contract from any cwd.
script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
node "$script_directory/lib/bump-action-version.js" --check
