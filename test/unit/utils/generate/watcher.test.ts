import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { expect } from 'chai';
import { Watcher, runWatchMode, isLocalTemplate } from '../../../../src/utils/generate/watcher';

function rmQuiet(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function unlinkQuiet(file: string): void {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
}

const noop = (): undefined => undefined;
const noopAsync = async (): Promise<void> => undefined;

describe('isLocalTemplate()', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'asyncapi-watcher-'));
  });

  afterEach(() => {
    rmQuiet(tmp);
  });

  it('returns true when the path is a symbolic link', async () => {
    const target = path.join(tmp, 'target');
    const link = path.join(tmp, 'link');
    fs.mkdirSync(target);
    fs.symlinkSync(target, link);
    expect(await isLocalTemplate(link)).to.equal(true);
  });

  it('returns false when the path is a regular directory', async () => {
    const dir = path.join(tmp, 'realdir');
    fs.mkdirSync(dir);
    expect(await isLocalTemplate(dir)).to.equal(false);
  });

  it('returns false when the path is a regular file', async () => {
    const file = path.join(tmp, 'file.txt');
    fs.writeFileSync(file, 'x');
    expect(await isLocalTemplate(file)).to.equal(false);
  });
});

describe('runWatchMode()', () => {
  const originalWatch = Watcher.prototype.watch;
  let templateRoot: string;
  let defaultTemplatesDir: string;
  const specPath = path.join(process.cwd(), 'test/fixtures/specification.yml');

  before(() => {
    Watcher.prototype.watch = async function patchedWatch(
      this: Watcher,
      changeCallback: unknown,
      errorCallback: unknown
    ) {
      await originalWatch.call(this, changeCallback, errorCallback);
      this.closeWatchers();
    };
  });

  after(() => {
    Watcher.prototype.watch = originalWatch;
  });

  beforeEach(() => {
    templateRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'asyncapi-runwatch-'));
    defaultTemplatesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asyncapi-default-tpl-'));
    fs.writeFileSync(
      path.join(templateRoot, 'package.json'),
      JSON.stringify({ name: 'watcher-test-template' })
    );
  });

  afterEach(() => {
    rmQuiet(templateRoot);
    rmQuiet(defaultTemplatesDir);
  });

  it('does not require isLocalTemplate on the command instance (regression for #2018)', async () => {
    const installedPath = path.join(defaultTemplatesDir, 'watcher-test-template');
    fs.mkdirSync(installedPath, { recursive: true });

    const logs: string[] = [];
    const warns: string[] = [];
    const thisArg = {
      log: (msg: string) => {
        logs.push(msg);
      },
      warn: (msg: string) => {
        warns.push(msg);
      },
      error: noop,
    };

    const generatorClass = {
      DEFAULT_TEMPLATES_DIR: defaultTemplatesDir,
      TRANSPILED_TEMPLATE_LOCATION: '.transpiled',
    };

    await runWatchMode(thisArg, specPath, templateRoot, 'out', generatorClass, noopAsync);

    expect(logs.some((l) => l.includes('[WATCHER]'))).to.equal(true);
    expect(warns.length).to.equal(1);
    expect(warns[0]).to.match(/remote template/i);
  });

  it('skips remote-template warning when the installed template path is a symlink', async () => {
    const realDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asyncapi-real-tpl-'));
    const installedPath = path.join(defaultTemplatesDir, 'watcher-test-template');
    try {
      fs.symlinkSync(realDir, installedPath);

      const warns: string[] = [];
      const thisArg = {
        log: noop,
        warn: (msg: string) => {
          warns.push(msg);
        },
        error: noop,
      };

      const generatorClass = {
        DEFAULT_TEMPLATES_DIR: defaultTemplatesDir,
        TRANSPILED_TEMPLATE_LOCATION: '.transpiled',
      };

      await runWatchMode(thisArg, specPath, templateRoot, 'out', generatorClass, noopAsync);

      expect(warns.length).to.equal(0);
    } finally {
      unlinkQuiet(installedPath);
      rmQuiet(realDir);
    }
  });
});
