import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';

if (existsSync('../../.env')) process.loadEnvFile('../../.env');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));

  const config = new DocumentBuilder().setTitle('Freitty API').setVersion('1.0').build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
