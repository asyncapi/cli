import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Specification } from '@models/SpecificationFile';

export type SourceKind = 'file' | 'url' | 'context' | 'auto-detected';

export interface SourceDescriptor {
  input: string;
  kind: SourceKind;
  resolved: string;
}

const SENSITIVE_QUERY_KEY = /token|key|secret|password|auth/i;

/**
 * Removes credentials and sensitive query parameters from HTTP(S) URLs.
 * Non-URL values are returned unchanged.
 */
export function redactUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return value;
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    return value;
  }
  url.username = '';
  url.password = '';
  for (const key of url.searchParams.keys()) {
    if (SENSITIVE_QUERY_KEY.test(key)) {
      url.searchParams.set(key, '[REDACTED]');
    }
  }
  return url.toString();
}

/**
 * Describes where a loaded AsyncAPI document came from, for structured output.
 */
export function describeSource(
  input: string | undefined,
  specification: Specification,
): SourceDescriptor {
  const url = specification.getFileURL();
  if (url) {
    return { input: redactUrl(input ?? url), kind: 'url', resolved: redactUrl(url) };
  }

  const filePath = specification.getFilePath();
  const resolved = path.resolve(filePath ?? input ?? '');
  let kind: SourceKind = 'context';
  if (!input) {
    kind = 'auto-detected';
  } else if (path.resolve(input) === resolved) {
    kind = 'file';
  }
  return { input: input ?? filePath ?? '', kind, resolved };
}

/**
 * Lists every file under a directory as sorted absolute paths.
 * A missing or unreadable directory yields an empty list.
 */
export async function listFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  const visit = async (current: string): Promise<void> => {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    await Promise.all(entries.map(async (entry) => {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }));
  };
  await visit(path.resolve(directory));
  return files.sort((a, b) => a.localeCompare(b));
}
