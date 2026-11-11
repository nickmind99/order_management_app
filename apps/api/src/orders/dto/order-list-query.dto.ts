import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { OrderStatus } from '@freitty/db';

export const ORDER_TABS = ['all', 'cross_dock', 'consolidation', 'alerts', 'drafts'] as const;
export type OrderTab = (typeof ORDER_TABS)[number];

export const ORDER_PERIODS = ['today', 'week', '30d'] as const;
export type OrderPeriod = (typeof ORDER_PERIODS)[number];

export class OrderListQueryDto {
  @ApiPropertyOptional({ enum: ORDER_TABS, default: 'all' })
  @IsOptional()
  @IsIn(ORDER_TABS)
  tab: OrderTab = 'all';

  @IsOptional()
  @IsUUID()
  hubId?: string;

  @ApiPropertyOptional({ enum: OrderStatus, enumName: 'OrderStatus' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: ORDER_PERIODS })
  @IsOptional()
  @IsIn(ORDER_PERIODS)
  period?: OrderPeriod;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 12;
}
