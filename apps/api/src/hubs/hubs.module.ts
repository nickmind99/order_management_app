import { Module } from '@nestjs/common';
import { DocksController } from './docks/docks.controller';
import { DocksService } from './docks/docks.service';
import { HubsController } from './hubs.controller';
import { HubsService } from './hubs.service';

@Module({
  controllers: [HubsController, DocksController],
  providers: [HubsService, DocksService],
})
export class HubsModule {}
