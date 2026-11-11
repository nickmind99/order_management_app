import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@freitty/db';
import { CarrierDto } from './dto/carrier.dto';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';

const select = { id: true, name: true, phone: true } as const;

@Injectable()
export class CarriersService {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(): Promise<CarrierDto[]> {
    return this.prisma.carrier.findMany({ select, orderBy: { name: 'asc' } });
  }

  findOne(id: string): Promise<CarrierDto> {
    return this.prisma.carrier.findUniqueOrThrow({ where: { id }, select });
  }

  create(data: CreateCarrierDto): Promise<CarrierDto> {
    return this.prisma.carrier.create({ data, select });
  }

  update(id: string, data: UpdateCarrierDto): Promise<CarrierDto> {
    return this.prisma.carrier.update({ where: { id }, data, select });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.carrier.delete({ where: { id } });
  }
}
