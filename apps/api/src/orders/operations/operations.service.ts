import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@freitty/db';
import { CreateOperationDto } from './dto/create-operation.dto';
import { OperationDto } from './dto/operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';

const select = {
  id: true,
  type: true,
  truckId: true,
  qty: true,
  palletType: true,
  appliedAt: true,
  priceCents: true,
} as const;

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(orderNumber: string): Promise<OperationDto[]> {
    return this.prisma.operation.findMany({ where: { order: { number: orderNumber } }, select, orderBy: { appliedAt: 'asc' } });
  }

  findOne(orderNumber: string, id: string): Promise<OperationDto> {
    return this.prisma.operation.findUniqueOrThrow({ where: { id, order: { number: orderNumber } }, select });
  }

  create(orderNumber: string, { truckId, ...data }: CreateOperationDto): Promise<OperationDto> {
    return this.prisma.operation.create({
      data: {
        ...data,
        order: { connect: { number: orderNumber } },
        truck: truckId ? { connect: { id: truckId } } : undefined,
      },
      select,
    });
  }

  update(orderNumber: string, id: string, data: UpdateOperationDto): Promise<OperationDto> {
    return this.prisma.operation.update({ where: { id, order: { number: orderNumber } }, data, select });
  }

  async remove(orderNumber: string, id: string): Promise<void> {
    await this.prisma.operation.delete({ where: { id, order: { number: orderNumber } } });
  }
}
