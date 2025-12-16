const { writeFile } = require('fs/promises');
const path = require('path');
const { listBakedInTemplates } = require('@asyncapi/generator');

async function generateClientLanguages() {
  const bakedInClients = listBakedInTemplates({ type: 'client' });

  const targets = Array.from(new Set(bakedInClients.map(t => t.target))).sort();

  const enumEntries = targets
    .map(t => `  ${capitalize(t)} = '${t}',`)
    .join('\n');

  const fileContent = `// Auto-generated. Do not edit manually.
export enum AvailableLanguage {
${enumEntries}
}

export const availableLanguages = [${targets.map(t => `'${t}'`).join(', ')}] as const;
export type AvailableLanguageType = typeof availableLanguages[number];

/**
 * Returns the first available language as the default option.
 */
export const getDefaultLanguage = (): AvailableLanguageType => availableLanguages[0];
`;

  const outputPath = path.join(__dirname, '../src/domains/models/generate/ClientLanguages.ts');
  await writeFile(outputPath, fileContent);

  console.log('✅ ClientLanguages.ts generated');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

generateClientLanguages().catch(err => {
  throw new Error(`Failed to generate ClientLanguages.ts: ${err.message}`);
});
