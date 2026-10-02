import json2md from 'json2md';
import {
  capitaliseFirstLetter,
  generateMarkdownForChange,
  groupChangesByType
} from '../MarkdownHelpers';
import {MarkdownSubtype} from '../../types';

/**
 * Converts the diff to Markdown
 * @param object The input object
 * @param markdownSubtype the format to display the dropdown data in
 * @returns Markdown output
 */
export default function convertToMarkdown(object: any, markdownSubtype: MarkdownSubtype): string {
  if (Object.prototype.hasOwnProperty.call(object, 'changes')) {
    object = object.changes;
  }

  const changeTypeGroups = groupChangesByType(object);

  const markdownStructure = [];

  for (const [changeType, changes] of Object.entries(changeTypeGroups)) {
    markdownStructure.push({h2: capitaliseFirstLetter(changeType)});
    const outerList = {ul: [] as any[]};

    for (const change of changes) {
      outerList.ul.push(...generateMarkdownForChange({change, markdownSubtype}));
    }

    markdownStructure.push(outerList);
  }

  return json2md(markdownStructure);
}
