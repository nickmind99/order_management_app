import { Module } from '@nestjs/common';
import { CarriersModule } from './carriers/carriers.module';
import { DbModule } from './db/db.module';
import { HubsModule } from './hubs/hubs.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [DbModule, HubsModule, CarriersModule, OrdersModule],
})
export class AppModule {}
