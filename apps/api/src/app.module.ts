import { Module } from '@nestjs/common';
import { CarriersModule } from './carriers/carriers.module';
import { DbModule } from './db/db.module';
import { HubsModule } from './hubs/hubs.module';
import { OrdersModule } from './orders/orders.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [DbModule, RedisModule, HubsModule, CarriersModule, OrdersModule],
})
export class AppModule {}
