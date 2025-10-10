import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Payment } from '@payment/shared-types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  private testPayment: Payment = {
    _id: '1',
    tenantId: 'tenant_1',
    amount: 100,
    method: 'card',
    status: 'success',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('test-payment')
  getTestPayment() {
    return this.testPayment;
  }
}
