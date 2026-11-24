
# AsyncAPI CLI Configuration Guide

This guide explains how to use the `asyncapi config` command to manage configuration settings for the AsyncAPI CLI.

## Overview

The `asyncapi config` command provides several subcommands to manage different aspects of the CLI configuration:

- **`config`**: Main configuration command
- **`config analytics`**: Manage analytics settings
- **`config auth add`**: Add authentication configurations
- **`config context`**: Manage context configurations (short aliases for AsyncAPI documents)
- **`config versions`**: Show versions of AsyncAPI tools used

## Using the `asyncapi config` Command

### 1. Managing Analytics Settings

The AsyncAPI CLI collects anonymous usage analytics to improve the product. You can enable, disable, or check the current status of analytics:

```bash
# Enable analytics
asyncapi config analytics --enable

# Disable analytics
asyncapi config analytics --disable

# Check current analytics status
asyncapi config analytics --status
```

### 2. Managing Authentication Configurations

Add authentication configurations for resolving $ref files that require HTTP Authorization:

```bash
# Add authentication configuration
asyncapi config auth add PATTERN TOKEN [--auth-type AUTH_TYPE] [--header HEADER]

# Example: Add GitHub authentication
asyncapi config auth add "github.com/**/*.*" $GITHUB_TOKEN --auth-type Bearer
```

**Flags:**
- `--auth-type`: Authentication type (default is "Bearer")
- `--header`: Additional header in key=value format (can be used multiple times)

### 3. Managing Context Configurations

Context configurations allow you to create short aliases for full paths to AsyncAPI documents, making it easier to work with multiple specifications.

#### Initialize Context Configuration

```bash
# Initialize context configuration in the current directory
asyncapi config context init

# Initialize context configuration in the root of the current repository
asyncapi config context init ./

# Initialize context configuration in the user's home directory
asyncapi config context init ~

# Initialize context configuration in a specific directory
asyncapi config context init /path/to/directory
```

#### Add a New Context

```bash
# Add a new context
asyncapi config context add CONTEXT-NAME SPEC-FILE-PATH

# Example: Add a context named "my-api" pointing to an AsyncAPI spec
asyncapi config context add my-api ./asyncapi.yaml

# Set the context being added as the current context
asyncapi config context add my-api ./asyncapi.yaml --set-current
```

#### List All Contexts

```bash
# List all stored contexts
asyncapi config context list
```

#### View Current Context

```bash
# Show the current context that is being used
asyncapi config context current
```

#### Use a Specific Context

```bash
# Set a context as current
asyncapi config context use CONTEXT-NAME

# Example: Use the "my-api" context
asyncapi config context use my-api
```

#### Edit a Context

```bash
# Edit an existing context
asyncapi config context edit CONTEXT-NAME NEW-SPEC-FILE-PATH

# Example: Update the "my-api" context with a new spec file
asyncapi config context edit my-api ./new-asyncapi.yaml
```

#### Remove a Context

```bash
# Delete a context from the store
asyncapi config context remove CONTEXT-NAME

# Example: Remove the "my-api" context
asyncapi config context remove my-api
```

### 4. Viewing Tool Versions

```bash
# Show versions of AsyncAPI tools used
asyncapi config versions
```

## Configuration File Location

The configuration files are stored in the following locations:

- **Context files**: Stored in `.asyncapi-cli` file in the current directory, repository root, or user's home directory. The CLI automatically searches for this file in the following locations:
  - Current directory: `.asyncapi-cli`
  - Repository root: `.asyncapi-cli`
  - User's home directory: `~/.asyncapi-cli`

- **Authentication configurations**: Stored in the same `.asyncapi-cli` file as context configurations (JSON format)
- **Analytics settings**: Stored in the same `.asyncapi-cli` file as context configurations (JSON format)

## Best Practices

1. **Use contexts** to manage multiple AsyncAPI specifications in your projects
2. **Set a default context** using the `--set-current` flag when adding new contexts
3. **Use environment variables** for sensitive tokens in authentication configurations
4. **Check analytics status** periodically to ensure you're comfortable with the data collection

## Troubleshooting

If you encounter issues with configuration:
- Verify the configuration file locations
- Check file permissions
- Ensure you're using the latest version of the AsyncAPI CLI
- Check the CLI logs for detailed error messages

## Summary

The AsyncAPI CLI provides powerful configuration options to customize your workflow. The `asyncapi config` command allows you to:
- Manage analytics settings
- Configure authentication for protected resources
- Create and manage context aliases for AsyncAPI documents
- View tool versions

This configuration system helps you maintain a consistent and efficient workflow when working with multiple AsyncAPI specifications.

---
Completed configuration guide for [asyncapi/cli]
