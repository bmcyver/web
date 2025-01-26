import express from 'express';
import chalk from 'chalk';
import { logger } from '@utils';
import cookieParser from 'cookie-parser';
import { IncomingHttpHeaders } from 'node:http';

interface ServerCreateConfig {
  /**
   * Enable Debug Mode
   * @default false
   */
  enableDebug?: boolean;
  /**
   * Enable Error Handler
   * @default true
   */
  enableErrorHandler?: boolean;
}

/**
 * Create a new express server
 * @param config
 * @returns Server
 *
 * @example
 * ```ts
 * const app = server({ DEBUG: true }).listen(3000);
 * app.get('/', (req, res) => res.send('Hello Get!'));
 * app.post('/', (req, res) => res.send('Hello Post!'));
 * app.use('/', (req, res) => res.send('Hello Use!'));
 * ```
 */
export function server(config: ServerCreateConfig = {}) {
  return new Server(config);
}

class Server {
  public readonly app: express.Application;

  constructor(private readonly config: ServerCreateConfig = {}) {
    this.debug('Creating express app with config', this.config);

    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    if (this.config.enableDebug) {
      this.debug('Adding request logger');
      this.app.use(
        (
          req: express.Request,
          res: express.Response,
          next: express.NextFunction,
        ) => {
          this.debug(
            `[${req.method.toUpperCase()}] ${req.url}`,
            this.beautifyHeadersToLog(req.headers),
            req.body,
          );
          return next();
        },
      );
    }

    if (this.config.enableErrorHandler !== false) {
      this.debug('Adding error handler');
      this.app.use(
        (
          err: any,
          req: express.Request,
          res: express.Response,
          next: express.NextFunction,
        ) => {
          logger.error(err);
          return res.status(500).send('Internal Server Error');
        },
      );
    }
  }

  private beautifyHeadersToLog(headers: IncomingHttpHeaders) {
    return Object.fromEntries(
      Object.entries(headers).filter(
        ([key]) =>
          !key.startsWith('sec-') &&
          !key.startsWith('accept-') &&
          !key.startsWith('upgrade-') &&
          !key.startsWith('cache-') &&
          key !== 'connection' &&
          key !== 'dnt',
      ),
    );
  }

  private debug(...args: any[]) {
    if (this.config.enableDebug)
      logger.debug(chalk.greenBright('[server]'), ...args);
  }

  public listen(port: number) {
    this.app.listen(port, '0.0.0.0', () => {
      this.debug(`Listening on port ${port}`);
    });
    return this.app;
  }
}
