import * as fs from 'fs';
import { IMapBaseUrlToFlag } from '../../domains/models/generate/Flags';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

function openFileError(localpath: string, cause: unknown): ApplicationError {
  return new ApplicationError(
    CLI_ERROR_CODES.GENERATED_REFERENCE_READ_FAILED,
    `Error opening file "${localpath}"`,
    { cause, details: { path: localpath } },
  );
}

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
              reject(openFileError(localpath, err));
            } else {
              resolve(data);
            }
          });
        } catch (err) {
          reject(openFileError(localpath, err));
        }
      });
    }
  };
}
