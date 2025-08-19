export function retrieveLangauge(content: string): 'json' | 'yaml' {
  if (content.trim()[0] === '{') {
    return 'json';
  }
  return 'yaml';
}
