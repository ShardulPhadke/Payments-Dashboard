import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../app/app.module';
import { SeedModule } from './seed.module';
import { PaymentsService } from '../payments/payments.service';
import { PaymentStatus, PaymentMethod } from '@payment/shared-types';

/**
 * Seed Configuration
 */
const SEED_CONFIG = {
  tenants: ['tenant-alpha', 'tenant-beta', 'tenant-gamma'],
  paymentsPerTenant: 1000,
  daysBack: 30,
};

/**
 * Generate random payment amount between min and max
 */
function randomAmount(min = 10, max = 10000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random item from array
 */
// function randomItem<T>(array: T[]): T {
//   return array[Math.floor(Math.random() * array.length)];
// }

/**
 * Generate random payment status with realistic distribution
 * 85% success, 12% failed, 3% refunded
 */
function randomStatus(): PaymentStatus {
  const rand = Math.random();
  if (rand < 0.85) return PaymentStatus.SUCCESS;
  if (rand < 0.97) return PaymentStatus.FAILED;
  return PaymentStatus.REFUNDED;
}

/**
 * Generate random payment method with realistic distribution
 */
function randomMethod(): PaymentMethod {
  const rand = Math.random();
  if (rand < 0.35) return PaymentMethod.UPI;
  if (rand < 0.60) return PaymentMethod.CREDIT_CARD;
  if (rand < 0.80) return PaymentMethod.DEBIT_CARD;
  if (rand < 0.90) return PaymentMethod.NET_BANKING;
  return PaymentMethod.WALLET;
}

/**
 * Generate random date within the last N days
 */
function randomDate(daysBack: number): Date {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const randomMs = Math.random() * daysBack * msPerDay;
  return new Date(now.getTime() - randomMs);
}

/**
 * Main seed function
 */
async function seed() {
  console.log('🌱 Starting seed process...\n');

  // Bootstrap NestJS application
  const app = await NestFactory.createApplicationContext(SeedModule);
  const paymentsService = app.get(PaymentsService);

  try {
    for (const tenantId of SEED_CONFIG.tenants) {
      console.log(`📦 Seeding tenant: ${tenantId}`);

      // Clear existing data for this tenant
      const deleted = await paymentsService.deleteAll(tenantId);
      console.log(`   Cleared ${deleted} existing payments`);

      // Generate payments
      const payments = [];
      for (let i = 0; i < SEED_CONFIG.paymentsPerTenant; i++) {
        payments.push({
          tenantId,
          amount: randomAmount(),
          method: randomMethod(),
          status: randomStatus(),
          createdAt: randomDate(SEED_CONFIG.daysBack),
        });
      }

      // Sort by date to maintain chronological order
      payments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      // Bulk insert
      await paymentsService.createMany(payments);
      console.log(`   ✅ Created ${payments.length} payments\n`);
    }

    // Print summary
    console.log('📊 Seed Summary:');
    for (const tenantId of SEED_CONFIG.tenants) {
      const total = await paymentsService.count(tenantId);
      const success = await paymentsService.count(tenantId, PaymentStatus.SUCCESS);
      const failed = await paymentsService.count(tenantId, PaymentStatus.FAILED);
      const refunded = await paymentsService.count(tenantId, PaymentStatus.REFUNDED);
      
      console.log(`\n${tenantId}:`);
      console.log(`  Total:    ${total}`);
      console.log(`  Success:  ${success} (${((success/total)*100).toFixed(1)}%)`);
      console.log(`  Failed:   ${failed} (${((failed/total)*100).toFixed(1)}%)`);
      console.log(`  Refunded: ${refunded} (${((refunded/total)*100).toFixed(1)}%)`);
    }

    console.log('\n✨ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run seed
seed();