import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { SupplyDto } from './dto/supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { SuppliesService } from './supplies.service';

@ApiTags('supplies')
@Controller('orders/:number/supplies')
export class SuppliesController {
  constructor(private readonly supplies: SuppliesService) {}

  @Get()
  findAll(@Param('number') number: string): Promise<SupplyDto[]> {
    return this.supplies.findAll(number);
  }

  @Get(':id')
  findOne(@Param('number') number: string, @Param('id', ParseUUIDPipe) id: string): Promise<SupplyDto> {
    return this.supplies.findOne(number, id);
  }

  @Post()
  create(@Param('number') number: string, @Body() body: CreateSupplyDto): Promise<SupplyDto> {
    return this.supplies.create(number, body);
  }

  @Patch(':id')
  update(
    @Param('number') number: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSupplyDto,
  ): Promise<SupplyDto> {
    return this.supplies.update(number, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('number') number: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.supplies.remove(number, id);
  }
}
