import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { ActivityDto } from './dto/activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { OrderDetailDto } from './dto/order-detail.dto';
import { OrderListDto } from './dto/order-list.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { OrderStatsDto } from './dto/order-stats.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findMany(@Query() query: OrderListQueryDto): Promise<OrderListDto> {
    return this.orders.findMany(query);
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
