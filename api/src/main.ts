import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]

  const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true) // allow curl/postman
      if (allowedOrigins.includes(origin)) return callback(null, true)
      logger.warn(`❌ Blocked by CORS: ${origin}`)
      return callback(new Error('Not allowed by CORS'), false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-Id',
      'Accept',
    ],
  };

  app.enableCors(corsOptions)

  // Global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = process.env.API_PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 API server running on http://localhost:${port}`);
  logger.log(`📊 Analytics: http://localhost:${port}/api/analytics/metrics`);
  logger.log(`🔌 WebSocket: ws://localhost:${port}/ws/payments`);
  logger.log(`🎮 Simulator: http://localhost:${port}/api/simulator/status`);
}

bootstrap();
