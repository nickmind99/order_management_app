import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@freitty/db';
import { CreateDockDto } from './dto/create-dock.dto';
import { DockDto } from './dto/dock.dto';
import { UpdateDockDto } from './dto/update-dock.dto';

const select = { id: true, hubId: true, number: true, bay: true } as const;

@Injectable()
export class DocksService {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(hubId: string): Promise<DockDto[]> {
    return this.prisma.dock.findMany({ where: { hubId }, select, orderBy: { number: 'asc' } });
  }

  findOne(hubId: string, id: string): Promise<DockDto> {
    return this.prisma.dock.findUniqueOrThrow({ where: { id, hubId }, select });
  }

  create(hubId: string, data: CreateDockDto): Promise<DockDto> {
    return this.prisma.dock.create({ data: { ...data, hub: { connect: { id: hubId } } }, select });
  }

  update(hubId: string, id: string, data: UpdateDockDto): Promise<DockDto> {
    return this.prisma.dock.update({ where: { id, hubId }, data, select });
  }

  async remove(hubId: string, id: string): Promise<void> {
    await this.prisma.dock.delete({ where: { id, hubId } });
  }
}
