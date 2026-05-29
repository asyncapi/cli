import archiver, { Archiver } from 'archiver';
import { Response } from 'express';

import { retrieveLangauge } from '@utils/retrieve-language';
import { createTempDirectory, removeTempDirectory } from '@utils/temp-dir';

/**
 * Service wrapping the `archiver` module:
    - easier zip creation
    - adding proper `Content-Type` header
    - easier adding an AsyncAPI document to the archive
    - easier stream finalization
 */
export class ArchiverService {
  public createZip(res?: Response) {
    const zip = archiver('zip', { zlib: { level: 9 } });
    if (res) {
      zip.pipe(res);
      res.attachment('asyncapi.zip');
    }
    return zip;
  }

  public appendDirectory(archive: Archiver, from: string, to: string) {
    archive.directory(from, to);
  }

  public appendAsyncAPIDocument(
    archive: Archiver,
    asyncapi: string | object,
    fileName = 'asyncapi',
  ) {
    const content =
      typeof asyncapi === 'string'
        ? asyncapi
        : JSON.stringify(asyncapi, null, 2);

    const language = retrieveLangauge(content);
    const extension = language === 'yaml' ? 'yml' : 'json';

    archive.append(content, { name: `${fileName}.${extension}` });
  }

  public async finalize(archive: Archiver) {
    await new Promise<void>((resolve) => {
      // wait for end stream
      archive.on('end', resolve);
      archive.finalize();
    });
  }

  public createTempDirectory() {
    return createTempDirectory();
  }

  public removeTempDirectory(tmpDir: string) {
    return removeTempDirectory(tmpDir);
  }
}
