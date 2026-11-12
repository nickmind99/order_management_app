import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ActivityDto } from './dto/activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { OrderDetailDto } from './dto/order-detail.dto';
import { OrderListDto } from './dto/order-list.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { OrderStatsDto } from './dto/order-stats.dto';
import { OrderGeneratorService } from './generator/order-generator.service';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly generator: OrderGeneratorService,
  ) {}

  @Get()
  findMany(@Query() query: OrderListQueryDto): Promise<OrderListDto> {
    return this.orders.findMany(query);
  }

  @Post('generate')
  @UseGuards(ThrottlerGuard)
  generate(): Promise<OrderDetailDto> {
    return this.generator.generate();
  }

  @Get('stats')
  getStats(): Promise<OrderStatsDto> {
    return this.orders.cachedStats();
  }

  @Get('activity')
  getActivity(@Query() query: ActivityQueryDto): Promise<ActivityDto> {
    return this.orders.activity(query.period);
  }

  @Get(':number')
  @ApiNotFoundResponse({ description: 'Order not found' })
  findByNumber(@Param('number') number: string): Promise<OrderDetailDto> {
    return this.orders.findByNumber(number);
  }
}
