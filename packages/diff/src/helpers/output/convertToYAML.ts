import yaml from 'js-yaml';

/**
 * Converts an object to YAML
 * @param object The input object
 * @returns YAML output
 */
export default function convertToYAML(object: any): string {
  return yaml.dump(object);
}
