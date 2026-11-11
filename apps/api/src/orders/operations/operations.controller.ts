import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOperationDto } from './dto/create-operation.dto';
import { OperationDto } from './dto/operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { OperationsService } from './operations.service';

@ApiTags('operations')
@Controller('orders/:number/operations')
export class OperationsController {
  constructor(private readonly operations: OperationsService) {}

  @Get()
  findAll(@Param('number') number: string): Promise<OperationDto[]> {
    return this.operations.findAll(number);
  }

  @Get(':id')
  findOne(@Param('number') number: string, @Param('id', ParseUUIDPipe) id: string): Promise<OperationDto> {
    return this.operations.findOne(number, id);
  }

  @Post()
  create(@Param('number') number: string, @Body() body: CreateOperationDto): Promise<OperationDto> {
    return this.operations.create(number, body);
  }

  @Patch(':id')
  update(
    @Param('number') number: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateOperationDto,
  ): Promise<OperationDto> {
    return this.operations.update(number, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('number') number: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.operations.remove(number, id);
  }
}
