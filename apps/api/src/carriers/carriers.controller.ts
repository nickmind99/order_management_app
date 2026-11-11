import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CarriersService } from './carriers.service';
import { CarrierDto } from './dto/carrier.dto';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';

@ApiTags('carriers')
@Controller('carriers')
export class CarriersController {
  constructor(private readonly carriers: CarriersService) {}

  @Get()
  findAll(): Promise<CarrierDto[]> {
    return this.carriers.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CarrierDto> {
    return this.carriers.findOne(id);
  }

  @Post()
  create(@Body() body: CreateCarrierDto): Promise<CarrierDto> {
    return this.carriers.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateCarrierDto): Promise<CarrierDto> {
    return this.carriers.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.carriers.remove(id);
  }
}
