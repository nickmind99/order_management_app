import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { OrderDetailDto } from '../dto/order-detail.dto';
import { OrdersService } from '../orders.service';

@Injectable()
export class OrderGeneratorService {
  private readonly logger = new Logger(OrderGeneratorService.name);
  private readonly lambda = new LambdaClient({});

  constructor(private readonly orders: OrdersService) {}

  async generate(): Promise<OrderDetailDto> {
    const functionName = process.env.GENERATOR_LAMBDA_NAME;
    if (!functionName) throw new ServiceUnavailableException('Order generator is not configured');

    const number = await this.invoke(functionName);
    await this.orders.clearStatsCache();
    return this.orders.findByNumber(number);
  }

  private async invoke(functionName: string): Promise<string> {
    try {
      const result = await this.lambda.send(new InvokeCommand({ FunctionName: functionName }));
      const payload = Buffer.from(result.Payload ?? []).toString();
      if (result.FunctionError) throw new Error(payload);
      return (JSON.parse(payload) as { number: string }).number;
    } catch (error) {
      this.logger.warn(`Order generator failed: ${(error as Error).message}`);
      throw new BadGatewayException('Order generator failed');
    }
  }
}
