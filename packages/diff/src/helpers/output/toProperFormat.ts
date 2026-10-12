import {FormatterConfig} from '../../types';
import convertToYAML from './convertToYAML';
import convertToMarkdown from './convertToMarkdown';

/**
 * Converts diff data to the specified format
 * @param config: Configuration options for the target format
 * @param config.data The diff data
 * @param config.outputType The intended type of the output
 * @param config.markdownSubtype the format to display the dropdown data in
 * @returns formatted diff output
 */
export default function toProperFormat<T>(config: FormatterConfig<T>): T | string {
  if (config.outputType === 'yaml' || config.outputType === 'yml') {
    return convertToYAML(config.data);
  } else if (config.outputType === 'markdown' || config.outputType === 'md') {
    return convertToMarkdown(config.data, config.markdownSubtype);
  }

  return config.data;
}
