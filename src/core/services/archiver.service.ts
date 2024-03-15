import archiver, { Archiver } from 'archiver';
import { Response } from 'express';

import { createTempDirectory, removeTempDirectory } from '../../utils/temp-dir';

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

  private retrieveLangauge(content: string): 'json' | 'yaml' {
    if (content.trim()[0] === '{') {
      return 'json';
    }
    return 'yaml';
  }

  public appendAsyncAPIDocument(archive: Archiver, asyncapi: string, fileName = 'asyncapi') {
    asyncapi = JSON.stringify(asyncapi);
    const language = this.retrieveLangauge(asyncapi);
    if (language === 'yaml') {
      archive.append(asyncapi, { name: `${fileName}.yml` });
    } else {
      archive.append(asyncapi, { name: `${fileName}.json`});
    }
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
