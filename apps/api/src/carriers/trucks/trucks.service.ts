import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@freitty/db';
import { CreateTruckDto } from './dto/create-truck.dto';
import { TruckDto } from './dto/truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';

const select = { id: true, carrierId: true, number: true, trailerNumber: true, trailerType: true } as const;

@Injectable()
export class TrucksService {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(carrierId: string): Promise<TruckDto[]> {
    return this.prisma.truck.findMany({ where: { carrierId }, select, orderBy: { number: 'asc' } });
  }

  findOne(carrierId: string, id: string): Promise<TruckDto> {
    return this.prisma.truck.findUniqueOrThrow({ where: { id, carrierId }, select });
  }

  create(carrierId: string, data: CreateTruckDto): Promise<TruckDto> {
    return this.prisma.truck.create({ data: { ...data, carrier: { connect: { id: carrierId } } }, select });
  }

  update(carrierId: string, id: string, data: UpdateTruckDto): Promise<TruckDto> {
    return this.prisma.truck.update({ where: { id, carrierId }, data, select });
  }

  async remove(carrierId: string, id: string): Promise<void> {
    await this.prisma.truck.delete({ where: { id, carrierId } });
  }
}
