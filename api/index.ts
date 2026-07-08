import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';
import { AppModule } from '../apps/api/dist/app.module';

let cachedHandler: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(compression());

  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.use(express.json({ limit: '1mb' }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();
  return serverlessExpress({ app: expressInstance });
}

export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  return cachedHandler(req, res);
}
