import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. ENABLE CORS (Crucial for Web & Mobile to talk to Backend)
  app.enableCors({
    origin: '*', // Allow ALL connections (Simplest for development)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. ENABLE VALIDATION (So @IsEmail works)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 3. LISTEN ON 0.0.0.0 (Visible to the whole network/emulator)
  await app.listen(3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();