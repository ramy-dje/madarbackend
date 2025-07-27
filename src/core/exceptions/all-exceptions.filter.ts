import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

interface MongoErrorWithCode extends Error {
  code: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string' ? response : (response as any).message;
      errorName = exception.name;
    } else if (exception instanceof MongooseError.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = Object.values(exception.errors)
        .map((err) => err.message)
        .join(', ');
      errorName = 'ValidationError';
    } else if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.BAD_REQUEST;
      message = `Invalid ${exception.path}: ${exception.value}`;
      errorName = 'CastError';
    } else if (exception instanceof Error && 'code' in exception) {
      const mongoError = exception as MongoErrorWithCode;
      if (mongoError.code === 11000) {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate key error';
        errorName = 'DuplicateKeyError';
      }
    }

    // Log the error details
    this.logger.error({
      error: errorName,
      message: exception instanceof Error ? exception.message : message,
      method: request.method,
      url: request.url,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Send response
    response.status(status).json({
      statusCode: status,
      message,
      timestamp,
      path: request.url,
    });
  }
}
