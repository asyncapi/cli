// Auto-generated. Do not edit manually.
export enum AvailableLanguage {
  GO
}

export const availableLanguages = ['go'] as const;
export type AvailableLanguageType = typeof availableLanguages[number];

/**
 * Returns the first available language as the default option.
 */
export const getDefaultLanguage = (): AvailableLanguageType => availableLanguages[0];
