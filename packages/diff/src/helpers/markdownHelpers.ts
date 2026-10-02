import {ChangeMarkdownGenerationConfig, MarkdownDropdownGenerationConfig} from '../types';
import convertToYAML from './output/convertToYAML';

/**
 * Groups an array of changes by their 'type' property
 * @param object The input object
 * @returns The grouped object
 */
export function groupChangesByType(object: any): { string: [{ path: string, any: any }] } {
  return object.reduce((objectsByKeyValue: { [x: string]: any; }, obj: { [x: string]: any; }) => {
    const value = obj['type'];
    // eslint-disable-next-line security/detect-object-injection
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
}

/**
 * Sets the first letter of a string to uppercase
 * @param s The input string
 * @returns The string with the first letter capitalised
 */
export function capitaliseFirstLetter(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * Generates the Markdown list items for a single change
 * @param: config Configuration options for the generated markdown
 * @param config.change The object describing the change
 * @param config.markdownSubtype the format to display the dropdown data in
 * @returns The Markdown list describing the change
 */
export function generateMarkdownForChange(config: ChangeMarkdownGenerationConfig): any {
  const toAppend: any[] = [`**Path**: \`${config.change.path}\``];
  const listItem = {ul: [] as any[]};

  for (const [label, value] of Object.entries(config.change)) {
    if (label !== 'path' && label !== 'type') {
      // if the value is an object, display within a dropdown
      if (typeof value === 'object') {
        listItem.ul.push(convertDataToDropdown({
          label: capitaliseFirstLetter(label),
          data: value,
          markdownSubtype: config.markdownSubtype
        }));
      } else {
        listItem.ul.push(`**${capitaliseFirstLetter(label)}**: ${value}`);
      }
    }
  }

  toAppend.push(listItem);
  return toAppend;
}

/**
 * Converts the label and data to a markdown dropdown
 * @param config: Configuration options for the generated dropdown
 * @param config.label The summary / title
 * @param config.data The data to hide in dropdown
 * @param config.markdownSubtype the format to display the dropdown data in
 * @returns Markdown string with the label as a summary and the data formatted as JSON code
 */
export function convertDataToDropdown(config: MarkdownDropdownGenerationConfig): string {
  const displayData = config.markdownSubtype === 'json' ? JSON.stringify(config.data, null, 2) : convertToYAML(config.data);

  return `<details>
    <summary> ${config.label} </summary>
    
\`\`\`${config.markdownSubtype}
${displayData}
\`\`\`            
</details>  
`;
}
