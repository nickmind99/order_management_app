import { Module } from '@nestjs/common';
import { CarriersController } from './carriers.controller';
import { CarriersService } from './carriers.service';
import { TrucksController } from './trucks/trucks.controller';
import { TrucksService } from './trucks/trucks.service';

@Module({
  controllers: [CarriersController, TrucksController],
  providers: [CarriersService, TrucksService],
})
export class CarriersModule {}
