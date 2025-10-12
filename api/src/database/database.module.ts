import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Database Module
 * 
 * Handles MongoDB connection using Mongoose.
 * Connection string is loaded from environment variables.
 * 
 * Features:
 * - Automatic reconnection
 * - Connection pooling
 * - Environment-based configuration
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI', 'mongodb://localhost:27017/Payments-Dashboard?authSource=admin'),
        // Connection options for production
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        // Auto index creation (disable in production)
        autoIndex: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}