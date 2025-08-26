import * as fs from 'fs';
import { IMapBaseUrlToFlag } from '../../domains/models/generate/Flags';

export function getMapBaseUrlToFolderResolver(urlToFolder: IMapBaseUrlToFlag) {
  return {
    order: 1,
    canRead() {
      return true;
    },
    read(file: any) {
      const baseUrl = urlToFolder.url;
      const baseDir = urlToFolder.folder;

      return new Promise((resolve, reject) => {
        let localpath = file.url;
        localpath = localpath.replace(baseUrl, baseDir);
        try {
          fs.readFile(localpath, (err, data) => {
            if (err) {
              reject(`Error opening file "${localpath}"`);
            } else {
              resolve(data);
            }
          });
        } catch (err) {
          reject(`Error opening file "${localpath}"`);
        }
      });
    }
  };
}
