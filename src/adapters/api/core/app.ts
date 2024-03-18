import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
// eslint-disable-next-line
// @ts-ignore
import helmet from 'helmet';
import { problemMiddleware } from './middlewares/problem.middleware';
import { logger } from '../../../utils/logger';
import { API_VERSION,
  CORS_ORIGIN,
  CORS_CREDENTIALS,
  REQUEST_BODY_LIMIT } from './constants';
import { Controller } from './interfaces';

export class App {
  private app: express.Application;
  private port: string | number;
  private env: string;

  constructor(
    private readonly controllers: Controller[], port: string | number
  ) {
    this.app = express();
    // this.port = process.env.NODE_API_PORT || 80;
    this.port = port;
    this.env = process.env.NODE_ENV || 'development';
  }

  public async init() {
    // initialize core middlewares
    await this.initializeMiddlewares();
    // initialize controllers
    await this.initializeControllers();
    // initialize error handling
    await this.initializeErrorHandling();
  }
  public listen() {
    return this.app.listen(this.port, () => {
      logger.info('=================================');
      logger.info(`= 🚀 AsyncAPI Server API listening on the port ${this.port}`);
      logger.info('=================================');
    });
  }

  public getServer() {
    return this.app;
  }

  private async initializeControllers() {
    for (const controller of this.controllers) {
      this.app.use(`/${API_VERSION}/`, await controller.boot());
    }
  }

  private async initializeMiddlewares() {
    this.app.use(cors({ origin: CORS_ORIGIN, credentials: CORS_CREDENTIALS }));
    this.app.use(compression());
    this.app.use(bodyParser.text({ type: ['text/*'], limit: REQUEST_BODY_LIMIT }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));
    this.app.use(bodyParser.json({ type: ['json', '*/json', '+json'], limit: REQUEST_BODY_LIMIT }));
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          // for `/docs` path - we need to fetch redoc component from unpkg.com domain
          'script-src': ['\'self\'', 'unpkg.com'],
          'worker-src': ['\'self\' blob:']
        },
      },
      // for `/docs` path
      crossOriginEmbedderPolicy: false,
    }));
  }

  private async initializeErrorHandling() {
    this.app.use(problemMiddleware);
  }
}
