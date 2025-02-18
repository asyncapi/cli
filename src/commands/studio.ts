import open from 'open';

export async function startStudio(bundledDocument: string, options: { readOnly: boolean }) {
  const studioUrl = `https://studio.asyncapi.com/?readOnly=${options.readOnly}&document=${encodeURIComponent(
    bundledDocument
  )}`;

  await open(studioUrl);
}
