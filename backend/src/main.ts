import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, HttpStatus, INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
import * as fs from 'fs';
import * as express from 'express';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn', 'log', 'debug'],
    cors: false,
    rawBody: true,
    bufferLogs: true,
  });

  // Security
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(compression());

  // CORS: Allow mobile IPs, localhost, and production domains
  const allowedOrigins = [
    'http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080',
    'http://127.0.0.1:5173', 'http://127.0.0.1:3000',
    process.env.ALLOWED_ORIGIN,
    /https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|localhost|127\.0\.0\.1):\d+/,
  ].filter(Boolean) as (string | RegExp)[];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) { callback(null, true); return; } // Allow mobile/no-origin
      const isAllowed = allowedOrigins.some(allowed => 
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
      );
      isAllowed ? callback(null, true) : callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin',
      'X-App-Version', 'X-Platform', 'X-Request-ID', 'x-razorpay-signature',
    ],
    exposedHeaders: ['Authorization', 'X-Request-ID'],
    maxAge: 3600,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global pipes/interceptors
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, transform: true, forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => ({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Validation: ${errors.map(e => 
        `${e.property}: ${Object.values(e.constraints||{}).join(', ')}`
      ).join('; ')}`,
      timestamp: new Date().toISOString(),
    }),
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Static files
  const publicPath = resolve(__dirname, '..', 'public');
  const uploadsPath = join(publicPath, 'uploads');
  [publicPath, uploadsPath].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
  const staticOpts = { index: false, maxAge: '1d', fallthrough: true };
  app.use('/uploads', express.static(join(publicPath, 'uploads'), staticOpts));
  app.use('/assets/images/categories', express.static(join(publicPath, 'assets/images/categories'), staticOpts));
  app.use('/assets/images/subcategories', express.static(join(publicPath, 'assets/images/subcategories'), staticOpts));
  app.use('/assets/images/products', express.static(join(publicPath, 'assets/images/products'), staticOpts));
  app.use(express.static(publicPath, staticOpts));

  // Webhook: raw body for signature verification
  app.use('/payments/webhook', express.raw({ type: 'application/json' }));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`✅ Backend running on 0.0.0.0:${port}`);
  logger.log(`📱 Mobile: Use http://<YOUR-IP>:${port}`);
  logger.log(`🔧 Health: http://localhost:${port}/health`);
}

bootstrap().catch(err => {
  Logger.error('Bootstrap failed', err);
  process.exit(1);
});