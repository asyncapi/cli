// eslint-disable security/detect-object-injection
import * as url from 'url';
import * as fs from 'fs';
import { promisify } from 'util';
import chokidar from 'chokidar';
const lstat = promisify(fs.lstat);

export function isFilePath(path: string) {
  return !url.parse(path).hostname;
}

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
      const path = this.paths[pathIndex];
      this.paths[pathIndex] = path.replace(/[\\]/g, '/');
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
    this.watchers[path] = watcher;
  }

  /**
   * This method initiate the watch for change in all files
   * @param {*} callback called when the file(s) change
   */
  async watch(changeCallback: any, errorCallback: any) {
    for (const index in this.paths) {
      const path = this.paths[index];
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
        this.filesChanged[changedPath] = { eventType: newEventType, path: changedPath};
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
      const path = this.paths[index];
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
      const path = this.paths[index];
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
      const watcher = this.watchers[path];
      if (watcher !== null) {
        watcher.close();
        this.watchers[path] = null;
      } else {
        //Watcher not found for path
      }
    }
  }
}

