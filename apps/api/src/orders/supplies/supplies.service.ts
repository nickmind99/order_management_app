import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@freitty/db';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { SupplyDto } from './dto/supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';

const select = { id: true, sku: true, category: true, qty: true, unitPriceCents: true } as const;

@Injectable()
export class SuppliesService {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(orderNumber: string): Promise<SupplyDto[]> {
    return this.prisma.supply.findMany({ where: { order: { number: orderNumber } }, select, orderBy: { createdAt: 'asc' } });
  }

  findOne(orderNumber: string, id: string): Promise<SupplyDto> {
    return this.prisma.supply.findUniqueOrThrow({ where: { id, order: { number: orderNumber } }, select });
  }

  create(orderNumber: string, data: CreateSupplyDto): Promise<SupplyDto> {
    return this.prisma.supply.create({ data: { ...data, order: { connect: { number: orderNumber } } }, select });
  }

  update(orderNumber: string, id: string, data: UpdateSupplyDto): Promise<SupplyDto> {
    return this.prisma.supply.update({ where: { id, order: { number: orderNumber } }, data, select });
  }

  async remove(orderNumber: string, id: string): Promise<void> {
    await this.prisma.supply.delete({ where: { id, order: { number: orderNumber } } });
  }
}
