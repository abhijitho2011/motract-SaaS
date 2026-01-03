import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet - Set security headers (TEMPORARILY DISABLED FOR DEBUGGING)
  // app.use(helmet({
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'"],
  //       styleSrc: ["'self'", "'unsafe-inline'"],
  //     },
  //   },
  //   hsts: {
  //     maxAge: 31536000,
  //     includeSubDomains: true,
  //   },
  // }));

  // Security: CORS - Allow all origins for mobile app compatibility
  app.enableCors({
    origin: true, // Allow all origins (mobile apps need this)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security: Input validation (TEMPORARILY DISABLED FOR DEBUGGING)
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  //   forbidNonWhitelisted: false,
  //   transform: true,
  //   skipMissingProperties: true,
  // }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
