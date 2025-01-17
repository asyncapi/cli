import Command from '../../core/base';
import bundle from '@asyncapi/bundler';
import path from 'path';
import open from 'open';
import { bundleFlags } from '../../core/flags/bundle.flags';
import { createServer } from 'http';
import serveHandler from 'serve-handler';
import { version as studioVersion } from '@asyncapi/studio/package.json';

const port = 3210;

class preview extends Command {
  static description =
    'Preview AsyncAPI document with local references in Studio.';
  static strict = false;

  static flags = bundleFlags();

  async run() {
    const { argv, flags } = await this.parse(preview);
    const port = flags.port;

    const AsyncAPIFiles = argv as string[];

    this.startServer(AsyncAPIFiles, flags, port | 3210);
  }

  async startServer(AsyncAPIFiles: string[], flags: any, port: number) {
    const server = createServer(async (request, response) => {
      const indexLocation = require.resolve(
        '@asyncapi/studio/build/index.html',
      );
      const hostFolder = indexLocation.substring(
        0,
        indexLocation.lastIndexOf(path.sep),
      );

      if (request.url && request.url.includes('/file.yml')) {
        response.setHeader('Content-Type', 'application/x-yaml');
        const bundledDocument = await bundle(AsyncAPIFiles, {
          base: flags.base,
          baseDir: flags.baseDir,
          xOrigin: flags.xOrigin,
        });

        const yamlContent = bundledDocument.yml();

        response.end(yamlContent);
      } else {
        return serveHandler(request, response, {
          public: hostFolder,
        });
      }
    });

    server.listen(port, () => {
      const url = `http://localhost:${port}?liveServer=${port}&studio-version=${studioVersion}&url=file.yml&readOnly=true`;
      console.log(`Studio is now running at ${url}`);
      console.log(
        'You can open this URL in your web browser, and if needed, press Ctrl + C to stop the process.',
      );
      open(url);
    });
  }
}

export default preview;
