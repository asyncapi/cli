DEFAULT_VERSION = 'latest'
DEFAULT_COMMAND = 'generate'
TEST_FILEPATH = 'test/asyncapi.yml'
DEFAULT_TEMPLATE = '@asyncapi/markdown-template@0.10.0'
DEFAULT_LANGUAGE = ''
DEFAULT_OUTPUT = 'output'
DEFAULT_PARAMETERS = ''
DEFAULT_CUSTOM_COMMANDS = ''
CUSTOM_COMMANDS = 'validate test/asyncapi.yml'

# Add env variables to the shell
export GITHUB_WORKSPACE = $(shell pwd)

run:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

test: test-default test-validate-success test-custom-output test-custom-commands test-optimize test-bundle test-convert

# Test cases

# Tests if the action has been bumped greater than the latest release
test-action-bump:
	@bash bump-test.sh

# Tests the default configuration without any inputs
test-default:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

# Tests the validate command with a valid specification
test-validate-success:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) 'validate' $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

# Tests the validate command with an invalid specification
test-validate-fail:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) 'validate' './test/specification-invalid.yml' $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

# Tests if the generator can output to a custom directory
test-custom-output:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) 'typescript' './output/custom-output' $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

# Tests if the action prefers custom commands over the default command
test-custom-commands:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) 'typescript' './output/custom-output' $(DEFAULT_PARAMETERS) $(CUSTOM_COMMANDS) 

# Tests if the action fails when the input is invalid (e.g. invalid template as is the case here) 
fail-test:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) '' $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

# Tests if the action optimizes the specification
test-optimize:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) 'optimize' 'test/unoptimized.yml' $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) '-o new-file --no-tty' $(DEFAULT_CUSTOM_COMMANDS)

# Tests if the action can bundle the specification with custom commands
BUNDLE_COMMAND='bundle ./test/bundle/asyncapi.yaml ./test/bundle/features.yaml --base ./test/bundle/asyncapi.yaml -o ./output/bundle/asyncapi.yaml'
test-bundle:
	mkdir -p ./output/bundle
	@bash ./entrypoint.sh $(DEFAULT_VERSION) 'bundle' 'test/bundle/asyncapi.yaml' $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) '-o output/bundle/asyncapi.yaml' $(BUNDLE_COMMAND)

# Tests if the action can convert the specification with custom commands
test-convert:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) 'convert' 'test/asyncapi.yml' $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) 'output/convert/asyncapi.yaml' '' $(DEFAULT_CUSTOM_COMMANDS)
