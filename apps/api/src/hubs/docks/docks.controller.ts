import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocksService } from './docks.service';
import { CreateDockDto } from './dto/create-dock.dto';
import { DockDto } from './dto/dock.dto';
import { UpdateDockDto } from './dto/update-dock.dto';

@ApiTags('docks')
@Controller('hubs/:hubId/docks')
export class DocksController {
  constructor(private readonly docks: DocksService) {}

  @Get()
  findAll(@Param('hubId', ParseUUIDPipe) hubId: string): Promise<DockDto[]> {
    return this.docks.findAll(hubId);
  }

  @Get(':id')
  findOne(@Param('hubId', ParseUUIDPipe) hubId: string, @Param('id', ParseUUIDPipe) id: string): Promise<DockDto> {
    return this.docks.findOne(hubId, id);
  }

  @Post()
  create(@Param('hubId', ParseUUIDPipe) hubId: string, @Body() body: CreateDockDto): Promise<DockDto> {
    return this.docks.create(hubId, body);
  }

  @Patch(':id')
  update(
    @Param('hubId', ParseUUIDPipe) hubId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateDockDto,
  ): Promise<DockDto> {
    return this.docks.update(hubId, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('hubId', ParseUUIDPipe) hubId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.docks.remove(hubId, id);
  }
}
