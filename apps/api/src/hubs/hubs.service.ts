import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@freitty/db';
import { CreateHubDto } from './dto/create-hub.dto';
import { HubDto } from './dto/hub.dto';
import { UpdateHubDto } from './dto/update-hub.dto';

const select = { id: true, name: true, region: true, address: true } as const;

@Injectable()
export class HubsService {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(): Promise<HubDto[]> {
    return this.prisma.hub.findMany({ select, orderBy: { name: 'asc' } });
  }

  findOne(id: string): Promise<HubDto> {
    return this.prisma.hub.findUniqueOrThrow({ where: { id }, select });
  }

  create(data: CreateHubDto): Promise<HubDto> {
    return this.prisma.hub.create({ data, select });
  }

  update(id: string, data: UpdateHubDto): Promise<HubDto> {
    return this.prisma.hub.update({ where: { id }, data, select });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.hub.delete({ where: { id } });
  }
}
