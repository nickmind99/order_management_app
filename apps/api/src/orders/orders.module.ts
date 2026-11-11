import { Module } from '@nestjs/common';
import { OperationsController } from './operations/operations.controller';
import { OperationsService } from './operations/operations.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { SuppliesController } from './supplies/supplies.controller';
import { SuppliesService } from './supplies/supplies.service';

@Module({
  controllers: [OrdersController, OperationsController, SuppliesController],
  providers: [OrdersService, OperationsService, SuppliesService],
})
export class OrdersModule {}
