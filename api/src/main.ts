import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

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
