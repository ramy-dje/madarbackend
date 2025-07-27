import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AllExceptionsFilter } from './core/exceptions/all-exceptions.filter';
import { AuthGuard } from './app/modules/auth/guards/auth.guard';

async function bootstrap() {
  // Create NestJS application with CORS configuration
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: [
        "*",
        process.env.CLIENT_URL,
        ...(process.env.CLIENT_URL2 ? [process.env.CLIENT_URL2] : []),
        ...(process.env.CLIENT_URL3 ? [process.env.CLIENT_URL3] : []),
        ...(process.env.CLIENT_URL4 ? [process.env.CLIENT_URL4] : []),
      ],
    },
  });

  // Initialize logger
  const logger = new Logger('Main');

  // Set up global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    }),
  );

  /* // Set up global authentication guard
  app.useGlobalGuards(app.get(AuthGuard)); */

  // Configure middleware
  app.use(cookieParser());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  const PORT = process.env.PORT || 4500;
  await app.listen(PORT);

  // Log server URL
  logger.verbose(`Server is running on: ${await app.getUrl()}/api`);
}

bootstrap();
