import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateHubDto } from './dto/create-hub.dto';
import { HubDto } from './dto/hub.dto';
import { UpdateHubDto } from './dto/update-hub.dto';
import { HubsService } from './hubs.service';

@ApiTags('hubs')
@Controller('hubs')
export class HubsController {
  constructor(private readonly hubs: HubsService) {}

  @Get()
  findAll(): Promise<HubDto[]> {
    return this.hubs.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<HubDto> {
    return this.hubs.findOne(id);
  }

  @Post()
  create(@Body() body: CreateHubDto): Promise<HubDto> {
    return this.hubs.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateHubDto): Promise<HubDto> {
    return this.hubs.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.hubs.remove(id);
  }
}
