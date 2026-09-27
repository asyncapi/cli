import bodyParser from 'body-parser';
import compression from 'compression';
import config from 'config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { Server } from 'http';

import { Controller } from '@/interfaces';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

// import { problemMiddleware } from './middlewares/problem.middleware';

import { logger } from '../../utils/logger';
import { API_VERSION } from './constants';
import { problemMiddleware } from './middlewares/problem.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';

export class App {
  private app: express.Application;
  private quiet = false;

  constructor(
    private readonly controllers: Controller[],
    private readonly port: number | string = process.env.PORT || 80,
    private readonly env: string = process.env.NODE_ENV || 'development',
  ) {
    this.app = express();
  }

  public async init() {
    // initialize core middlewares
    await this.initializeMiddlewares();
    // initialize controllers
    await this.initializeControllers();
    // initialize error handling
    await this.initializeErrorHandling();
  }

  public listen(quiet = false): Promise<{
    server: Server;
    host: string | null;
    port: number | string;
    url: string;
  }> {
    this.quiet = quiet;
    return new Promise((resolve, reject) => {
      const server = this.app.listen(this.port);
      const onError = (error: NodeJS.ErrnoException) => {
        const code = error.code === 'EADDRINUSE'
          ? CLI_ERROR_CODES.SERVER_PORT_IN_USE
          : CLI_ERROR_CODES.SERVER_START_FAILED;
        const message = error.code === 'EADDRINUSE'
          ? `Port ${this.port} is already in use.`
          : `Failed to start API server on port ${this.port}: ${error.message}`;

        reject(new ApplicationError(code, message, {
          cause: error,
          details: { port: this.port },
        }));
      };

      server.once('error', onError);
      server.once('listening', () => {
        server.removeListener('error', onError);
        const address = server.address();
        const port = address && typeof address === 'object' ? address.port : this.port;
        const host = address && typeof address === 'object' ? address.address : null;
        const url = `http://localhost:${port}`;

        if (!quiet) {
          logger.info('=================================');
          logger.info(`= ENV: ${this.env}`);
          logger.info(
            `= 🚀 AsyncAPI Server API listening on the port ${port}`,
          );
          logger.info('=================================');
        }

        resolve({ server, host, port, url });
      });
    });
  }

  public getServer() {
    return this.app;
  }

  private async initializeMiddlewares() {
    const requestBodyLimit = config.get<string>('request.body.limit');

    this.app.use(
      cors({
        origin: config.get('cors.origin'),
        credentials: config.get('cors.credentials'),
      }),
    );
    this.app.use(compression());
    this.app.use(
      bodyParser.text({ type: ['text/*'], limit: requestBodyLimit }),
    );
    this.app.use(
      bodyParser.urlencoded({ extended: true, limit: requestBodyLimit }),
    );
    this.app.use(
      bodyParser.json({
        type: ['json', '*/json', '+json'],
        limit: requestBodyLimit,
      }),
    );
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            // for `/docs` path - we need to fetch redoc component from unpkg.com domain and hash for inline script
            'script-src': [
              '\'self\'',
              'unpkg.com',
              '\'sha256-HoDNcNPq7PEOgc6zsff39t5lZ/S65RY7Zl4hI67unp0=\'',
            ],
            // for schemas
            'connect-src': ['\'self\'', 'http:'],
            'worker-src': ['\'self\' blob:'],
          },
        },
        // for `/docs` path
        crossOriginEmbedderPolicy: false,
      }),
    );
    this.app.use((req, res, next) => {
      if (this.quiet) {
        next();
        return;
      }
      loggerMiddleware(req, res, next);
    });
  }

  private async initializeControllers() {
    for (const controller of this.controllers) {
      this.app.use(`/${API_VERSION}/`, await controller.boot());
    }
  }

  private async initializeErrorHandling() {
    this.app.use(problemMiddleware);
  }
}
