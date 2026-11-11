import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTruckDto } from './dto/create-truck.dto';
import { TruckDto } from './dto/truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { TrucksService } from './trucks.service';

@ApiTags('trucks')
@Controller('carriers/:carrierId/trucks')
export class TrucksController {
  constructor(private readonly trucks: TrucksService) {}

  @Get()
  findAll(@Param('carrierId', ParseUUIDPipe) carrierId: string): Promise<TruckDto[]> {
    return this.trucks.findAll(carrierId);
  }

  @Get(':id')
  findOne(@Param('carrierId', ParseUUIDPipe) carrierId: string, @Param('id', ParseUUIDPipe) id: string): Promise<TruckDto> {
    return this.trucks.findOne(carrierId, id);
  }

  @Post()
  create(@Param('carrierId', ParseUUIDPipe) carrierId: string, @Body() body: CreateTruckDto): Promise<TruckDto> {
    return this.trucks.create(carrierId, body);
  }

  @Patch(':id')
  update(
    @Param('carrierId', ParseUUIDPipe) carrierId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTruckDto,
  ): Promise<TruckDto> {
    return this.trucks.update(carrierId, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('carrierId', ParseUUIDPipe) carrierId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.trucks.remove(carrierId, id);
  }
}
