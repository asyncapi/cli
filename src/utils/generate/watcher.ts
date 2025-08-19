// eslint-disable security/detect-object-injection
import * as fs from 'fs';
import { promisify } from 'util';
import chokidar from 'chokidar';
const lstat = promisify(fs.lstat);
import path from 'path';
import { magenta, yellow, red, green } from 'picocolors';
import { load } from '@models/SpecificationFile';
import { GeneratorError } from '@errors/generator-error';

export async function isLocalTemplate(templatePath: string) {
  const stats = await lstat(templatePath);
  return stats.isSymbolicLink();
}

export class Watcher {
  private watchers: any;
  private fsWait: any;
  private filesChanged: any;
  private ignorePaths: string[];
  private paths: any;

  constructor(paths: string | string[], ignorePaths: string[]) {
    if (Array.isArray(paths)) {
      this.paths = paths;
    } else {
      this.paths = [paths];
    }
    //Ensure all backwards slashes are replaced with forward slash based on the requirement from chokidar
    for (const pathIndex in this.paths) {
      const path = this.paths[String(pathIndex)];
      this.paths[String(pathIndex)] = path.replace(/[\\]/g, '/');
    }
    this.fsWait = false;
    this.watchers = {};
    this.filesChanged = {};
    this.ignorePaths = ignorePaths;
  }

  /**
   * Initiates watch on a path.
   * @param {*} path The path the watcher is listening on.
   * @param {*} changeCallback Callback to call when changed occur.
   * @param {*} errorCallback Calback to call when it is no longer possible to watch a file.
   */
  initiateWatchOnPath(path: string, changeCallback: any, errorCallback: any) {
    const watcher = chokidar.watch(path, {ignoreInitial: true, ignored: this.ignorePaths});
    watcher.on('all', (eventType, changedPath) => this.fileChanged(path, changedPath, eventType, changeCallback, errorCallback));
    this.watchers[String(path)] = watcher;
  }

  /**
   * This method initiate the watch for change in all files
   * @param {*} callback called when the file(s) change
   */
  async watch(changeCallback: any, errorCallback: any) {
    for (const index in this.paths) {
      const path = this.paths[String(index)];
      this.initiateWatchOnPath(path, changeCallback, errorCallback);
    }
  }

  /**
   * Should be called when a file has changed one way or another.
   * @param {*} listenerPath The path the watcher is listening on.
   * @param {*} changedPath The file/dir that was changed
   * @param {*} eventType What kind of change
   * @param {*} changeCallback Callback to call when changed occur.
   * @param {*} errorCallback Calback to call when it is no longer possible to watch a file.
   */
  fileChanged(listenerPath: string, changedPath: string, eventType: string, changeCallback: any, errorCallback: any) {
    try {
      if (fs.existsSync(listenerPath)) {
        const newEventType = this.convertEventType(eventType);
        this.filesChanged[String(changedPath)] = { eventType: newEventType, path: changedPath};
        // Since multiple changes can occur at the same time, lets wait a bit before processing.
        if (this.fsWait) {return;}
        this.fsWait = setTimeout(async () => {
          await changeCallback(this.filesChanged);
          this.filesChanged = {};
          this.fsWait = false;
        }, 500);
      }
    } catch (e) {
      // File was not, find all files that are missing..
      const unknownPaths = this.getAllNonExistingPaths();
      this.closeWatchers();
      errorCallback(unknownPaths);
    }
  }

  /**
   * Convert the event type to a more usefull one.
   * @param {*} currentEventType The current event type (from chokidar)
   */
  convertEventType(currentEventType: string) {
    let newEventType = currentEventType;
    //Change the naming of the event type
    switch (newEventType) {
    case 'unlink':
    case 'unlinkDir':
      newEventType = 'removed';
      break;
    case 'addDir':
    case 'add':
      newEventType = 'added';
      break;
    case 'change':
      newEventType = 'changed';
      break;
    case 'rename':
      newEventType = 'renamed';
      break;
    default:
      newEventType = `unknown (${currentEventType})`;
    }
    return newEventType;
  }

  /**
   * Get all paths which no longer exists
   */
  getAllNonExistingPaths() {
    const unknownPaths = [];
    for (const index in this.paths) {
      const path = this.paths[String(index)];
      if (!fs.existsSync(path)) {
        unknownPaths.push(path);
      }
    }
    return unknownPaths;
  }

  /**
   * Closes all active watchers down.
   */
  closeWatchers() {
    this.filesChanged = {};
    for (const index in this.paths) {
      const path = this.paths[String(index)];
      this.closeWatcher(path);
    }
  }

  /**
   * Closes an active watcher down.
   * @param {*} path The path to close the watcher for.
   */
  closeWatcher(path: string) {
    // Ensure if called before `watch` to do nothing
    if (path !== null) {
      const watcher = this.watchers[String(path)];
      if (watcher !== null) {
        watcher.close();
        this.watchers[String(path)] = null;
      } else {
        //Watcher not found for path
      }
    }
  }
}

export async function runWatchMode(
  thisArg: any,
  asyncapi: string,
  template: string,
  output: string,
  generatorClass: any, // ✅ passed in
  watchHandler: (changedFiles: Record<string, any>) => Promise<void>
) {
  const specification = await load(asyncapi);

  const watchDir = path.resolve(template);
  const outputPath = path.resolve(watchDir, output);
  const transpiledTemplatePath = path.resolve(watchDir, generatorClass.TRANSPILED_TEMPLATE_LOCATION); // ✅ use dynamic class
  const ignorePaths = [outputPath, transpiledTemplatePath];
  const specificationFile = specification.getFilePath();

  // Template name is needed as it is not always a part of the cli command
  // There is a use case that you run generator from a root of the template with `./` path
  let templateName = '';
  try {
    // eslint-disable-next-line
    templateName = require(path.resolve(watchDir, 'package.json')).name;
  } catch (_) {
    // intentional
  }

  let watcher;
  if (specificationFile) {
    thisArg.log(`[WATCHER] Watching for changes in the template directory ${magenta(watchDir)} and in the AsyncAPI file ${magenta(specificationFile)}`);
    watcher = new Watcher([specificationFile, watchDir], ignorePaths);
  } else {
    thisArg.log(`[WATCHER] Watching for changes in the template directory ${magenta(watchDir)}`);
    watcher = new Watcher(watchDir, ignorePaths);
  }

  if (!await thisArg.isLocalTemplate(path.resolve(generatorClass.DEFAULT_TEMPLATES_DIR, templateName))) {
    thisArg.warn(`WARNING: ${template} is a remote template. Changes may be lost on subsequent installations.`);
  }

  await watcher.watch(watchHandler, (paths: any) => {
    thisArg.error(`[WATCHER] Could not find the file path ${paths}, are you sure it still exists? If it has been deleted or moved please rerun the generator.`, {
      exit: 1,
    });
  });
}

export function watcherHandler(
  thisArg: any,
  asyncapi: string,
  template: string,
  output: string,
  options: Record<string, any>,
  genOption: any,
  interactive: boolean
): (changedFiles: Record<string, any>) => Promise<void> {
  return async (changedFiles: Record<string, any>): Promise<void> => {
    console.clear();
    console.log('[WATCHER] Change detected');
    for (const [, value] of Object.entries(changedFiles)) {
      let eventText;
      switch (value.eventType) {
      case 'changed':
        eventText = green(value.eventType);
        break;
      case 'removed':
        eventText = red(value.eventType);
        break;
      case 'renamed':
        eventText = yellow(value.eventType);
        break;
      default:
        eventText = yellow(value.eventType);
      }
      thisArg.log(`\t${magenta(value.path)} was ${eventText}`);
    }
    try {
      await thisArg.generate(asyncapi, template, output, options, genOption, interactive);
    } catch (err: any) {
      throw new GeneratorError(err);
    }
  };
}
