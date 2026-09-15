

# asyncapi generate

Generates code from AsyncAPI documents using AsyncAPI Generator templates.

## Description

The `asyncapi generate` command generates code from AsyncAPI documents using AsyncAPI Generator templates. This allows developers to quickly implement API clients, servers, documentation, and more based on their AsyncAPI specifications.

The command supports three main subcommands:

1. **Generate from template**: `asyncapi generate fromTemplate <asyncapi-spec> <template>`
2. **Generate models**: `asyncapi generate models <asyncapi-spec>`
3. **Generate client**: `asyncapi generate client <language> <asyncapi-spec>`

## Common Options

### For all subcommands:

- `--output, -o <directory>`: Specify the output directory for generated code
- `--install`: Install the template and its dependencies
- `--force-write`: Force writing of generated files even if the output directory is not empty
- `--param, -p <key=value>`: Additional parameters to pass to the template
- `--map-base-url`: Maps all schema references from base URL to local folder
- `--registry-url`: Specifies the URL of the private registry for fetching templates
- `--registry-auth`: The registry username and password encoded with base64
- `--registry-token`: The npm registry authentication token
- `--no-interactive`: Disable interactive mode and run with provided flags
- `--debug`: Enable more specific errors in the console

## Common Flags

| Flag | Description |
|------|-------------|
| `--output, -o` | Directory where generated code will be saved |
| `--install` | Install the template and its dependencies |
| `--force-write` | Force writing of generated files |
| `--param, -p` | Additional parameters to pass to the template |
| `--map-base-url` | Maps all schema references from base URL to local folder |
| `--registry-url` | Specifies the URL of the private registry |
| `--registry-auth` | The registry username and password encoded with base64 |
| `--registry-token` | The npm registry authentication token |
| `--no-interactive` | Disable interactive mode |
| `--debug` | Enable more specific errors |

## Examples

1. Generate models from AsyncAPI specification:
   ```bash
   asyncapi generate models spec.yaml
   ```

2. Generate client for a specific language:
   ```bash
   asyncapi generate client javascript spec.yaml --param version=1.0.0 --output ./client
   ```

3. Generate code from template with specific parameters:
   ```bash
   asyncapi generate fromTemplate spec.yaml @asyncapi/html-template --param version=1.0.0 --output ./docs
   ```

4. Generate code with force-write option:
   ```bash
   asyncapi generate fromTemplate spec.yaml @asyncapi/html-template --force-write --output ./generated
   ```

5. Generate code with registry configuration:
   ```bash
   asyncapi generate fromTemplate spec.yaml @asyncapi/html-template --registry-url https://custom-registry.com --registry-token mytoken
   ```

