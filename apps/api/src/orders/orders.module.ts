import { Module } from '@nestjs/common';
import { OrderGeneratorService } from './generator/order-generator.service';
import { OperationsController } from './operations/operations.controller';
import { OperationsService } from './operations/operations.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { SuppliesController } from './supplies/supplies.controller';
import { SuppliesService } from './supplies/supplies.service';

@Module({
  controllers: [OrdersController, OperationsController, SuppliesController],
  providers: [OrdersService, OrderGeneratorService, OperationsService, SuppliesService],
})
export class OrdersModule {}
