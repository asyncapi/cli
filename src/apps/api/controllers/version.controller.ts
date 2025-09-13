import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import { Controller } from '@/interfaces';

export class VersionController implements Controller {
  public basepath = '/version';
  private startTime = new Date();

  private async getPackageInfo() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    } catch {
      return {};
    }
  }

  public async boot(): Promise<Router> {
    const router: Router = Router();

    router.get(
      `${this.basepath}`, async (req: Request, res: Response, next: NextFunction) => {
        try {
          const packageJson = await this.getPackageInfo();
          
          const versionInfo = {
            // Core version information
            version: packageJson.version || process.env.npm_package_version || 'unknown',
            name: packageJson.name || 'AsyncAPI CLI API',
            description: packageJson.description || 'All in one CLI for all AsyncAPI tools',
            
            // Runtime information
            runtime: {
              node: process.version,
              environment: process.env.NODE_ENV || 'development',
              platform: os.platform(),
              arch: os.arch(),
              uptime: `${Math.floor((Date.now() - this.startTime.getTime()) / 1000)} seconds`,
              startTime: this.startTime.toISOString()
            },

            // Repository information
            repository: {
              url: packageJson.homepage || packageJson.repository?.url || 'https://github.com/asyncapi/cli',
              bugs: packageJson.bugs || 'https://github.com/asyncapi/cli/issues',
              license: packageJson.license || 'Apache-2.0'
            },

            // API metadata
            api: {
              basePath: this.basepath,
              timestamp: new Date().toISOString(),
              health: 'ok'
            }
          };

          res.json(versionInfo);
        } catch (err) {
          return next(err);
        }
      }
    );

    return router;
  }
}
