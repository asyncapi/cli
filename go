package cmd

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/asyncapi/cli/internal/validation"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

// validateCmd represents the validate command
var validateCmd = &cobra.Command{
	Use:   "validate [file]",
	Short: "Validate an AsyncAPI document",
	Long: `Validate an AsyncAPI document against the AsyncAPI specification.

Supports both YAML and JSON formats. The command will automatically detect
the AsyncAPI version and validate accordingly.

Examples:
  asyncapi validate asyncapi.yaml
  asyncapi validate --verbose asyncapi.json
  asyncapi validate --strict asyncapi.yaml`,
	Args: cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		filePath := args[0]
		verbose, _ := cmd.Flags().GetBool("verbose")
		strict, _ := cmd.Flags().GetBool("strict")

		// Read the file
		data, err := ioutil.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read file %s: %w", filePath, err)
		}

		// Parse the document
		doc, err := parseDocument(data, filePath)
		if err != nil {
			return fmt.Errorf("failed to parse document: %w", err)
		}

		// Validate the document
		validator := validation.NewValidator()
		result, err := validator.ValidateDocument(doc)
		if err != nil {
			return fmt.Errorf("validation failed: %w", err)
		}

		// Display results
		if result.Valid {
			fmt.Printf("\n✅ Document is valid AsyncAPI %s\n", result.Version)
			return nil
		}

		// Format and display errors
		errorMsg := validation.FormatErrors(result.Errors)
		fmt.Fprintf(os.Stderr, "%s", errorMsg)

		if verbose {
			fmt.Fprintf(os.Stderr, "\n📋 Detailed Validation Report:\n")
			fmt.Fprintf(os.Stderr, "==============================\n")
			fmt.Fprintf(os.Stderr, "  File: %s\n", filePath)
			fmt.Fprintf(os.Stderr, "  Version: %s\n", result.Version)
			fmt.Fprintf(os.Stderr, "  Errors: %d\n", len(result.Errors))
			fmt.Fprintf(os.Stderr, "  Strict mode: %v\n", strict)
		}

		if strict {
			return fmt.Errorf("validation failed with %d error(s)", len(result.Errors))
		}

		os.Exit(1)
		return nil
	},
}

// parseDocument parses a YAML or JSON document
func parseDocument(data []byte, filePath string) (map[string]interface{}, error) {
	var doc map[string]interface{}

	// Detect format based on file extension
	if strings.HasSuffix(strings.ToLower(filePath), ".json") {
		if err := json.Unmarshal(data, &doc); err != nil {
			return nil, fmt.Errorf("invalid JSON: %w", err)
		}
	} else {
		// Assume YAML for .yaml, .yml, or unknown extensions
		if err := yaml.Unmarshal(data, &doc); err != nil {
			return nil, fmt.Errorf("invalid YAML: %w", err)
		}
	}

	return doc, nil
}

func init() {
	rootCmd.AddCommand(validateCmd)

	validateCmd.Flags().BoolP("verbose", "v", false, "Show detailed validation output")
	validateCmd.Flags().BoolP("strict", "s", false, "Exit with non-zero code on validation errors")
}