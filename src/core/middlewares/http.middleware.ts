import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP', { timestamp: true });

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, baseUrl } = req;
    const userAgent = req.get('user-agent') || '';

    // Intercept the response body
    const originalSend = res.send;
    let responseBody: unknown;

    res.send = function (body) {
      responseBody = body as unknown;
      // eslint-disable-next-line prefer-rest-params
      return originalSend.apply(this, arguments) as Response<
        any,
        Record<string, any>
      >;
    };
    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      const logMessage = `${method} ${baseUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`;
      switch (true) {
        case statusCode >= 400 && statusCode < 500:
          this.logger.warn(logMessage);
          if (process.env.NODE_ENV !== 'producrion')
            if (typeof responseBody === 'string') {
              this.logger.warn(JSON.parse(responseBody));
            } else {
              this.logger.warn(
                'Response body is not a string and cannot be parsed.',
              );
            }
          break;
        case statusCode >= 500:
          this.logger.error(logMessage);
          break;
        default:
          this.logger.log(logMessage);
      }
    });
    next();
  }
}
