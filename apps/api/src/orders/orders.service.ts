import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@freitty/db';
import { Redis } from 'ioredis';
import { operationsTotalCents, orderTotalCents, suppliesTotalCents } from '../common/pricing';
import { ActivityDto } from './dto/activity.dto';
import { ActivityPeriod } from './dto/activity-query.dto';
import { OrderDetailDto } from './dto/order-detail.dto';
import { OrderListDto } from './dto/order-list.dto';
import { OrderListQueryDto, OrderPeriod, OrderTab } from './dto/order-list-query.dto';
import { OrderStatsDto } from './dto/order-stats.dto';
import { orderCardInclude, toOrderCard } from './order-card.mapper';
import { hasAlert, hasWarning, withAlert, withWarning } from './order-flags';

const TAB_FILTERS: Record<OrderTab, Prisma.OrderWhereInput> = {
  all: {},
  cross_dock: { type: 'cross_dock', status: { not: 'draft' } },
  consolidation: { type: 'consolidation', status: { not: 'draft' } },
  alerts: withAlert,
  drafts: { status: 'draft' },
};

const DAY_MS = 86_400_000;
const STATS_CACHE_KEY = 'orders:stats';
const STATS_CACHE_TTL_SECONDS = 60;
const TOP = { parentId: null };
const OPEN = { ...TOP, status: { not: 'completed' as const } };
const ACTIVE = { ...TOP, status: { in: ['new' as const, 'in_progress' as const] } };

const truckSelect = { number: true, trailerNumber: true, trailerType: true } satisfies Prisma.TruckSelect;

function searchFilters(search: string): Prisma.OrderWhereInput[] {
  const match = { contains: search, mode: 'insensitive' } as const;
  return [{ number: match }, { refNumber: match }, { customer: match }, { subOrders: { some: { refNumber: match } } }];
}

function periodStart(period: OrderPeriod): Date {
  if (period === 'today') {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    return start;
  }
  return new Date(Date.now() - (period === 'week' ? 7 : 30) * DAY_MS);
}

function startOfPeriod(period: ActivityPeriod, date: Date): Date {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (period === 'week') start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  if (period === 'month') start.setUTCDate(1);
  if (period === 'quarter') start.setUTCMonth(start.getUTCMonth() - (start.getUTCMonth() % 3), 1);
  return start;
}

function shiftPeriod(period: ActivityPeriod, date: Date, n: number): Date {
  const shifted = new Date(date);
  if (period === 'day') shifted.setUTCDate(shifted.getUTCDate() + n);
  if (period === 'week') shifted.setUTCDate(shifted.getUTCDate() + n * 7);
  if (period === 'month') shifted.setUTCMonth(shifted.getUTCMonth() + n);
  if (period === 'quarter') shifted.setUTCMonth(shifted.getUTCMonth() + n * 3);
  return shifted;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis,
  ) {}

  async findMany(query: OrderListQueryDto): Promise<OrderListDto> {
    const filters: Prisma.OrderWhereInput = {
      parentId: null,
      hubId: query.hubId,
      status: query.status,
      date: query.period ? { gte: periodStart(query.period) } : undefined,
      OR: query.search ? searchFilters(query.search) : undefined,
    };
    const count = (tab: OrderTab) => this.prisma.order.count({ where: { AND: [filters, TAB_FILTERS[tab]] } });

    const [rows, all, crossDock, consolidation, alerts, drafts] = await Promise.all([
      this.prisma.order.findMany({
        where: { AND: [filters, TAB_FILTERS[query.tab]] },
        include: orderCardInclude,
        orderBy: { number: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      count('all'),
      count('cross_dock'),
      count('consolidation'),
      count('alerts'),
      count('drafts'),
    ]);
    const tabs = { all, crossDock, consolidation, alerts, drafts };
    const totals: Record<OrderTab, number> = { ...tabs, cross_dock: crossDock };

    return {
      items: rows.map(toOrderCard),
      total: totals[query.tab],
      page: query.page,
      pageSize: query.pageSize,
      tabs,
    };
  }

  async findByNumber(number: string): Promise<OrderDetailDto> {
    const order = await this.prisma.order.findUnique({
      where: { number },
      include: {
        hub: { select: { id: true, name: true, region: true, address: true } },
        dock: { select: { number: true, bay: true } },
        carrier: { select: { name: true, phone: true } },
        truck: { select: truckSelect },
        subOrders: { include: { truck: { select: { trailerNumber: true } } }, orderBy: { number: 'asc' } },
        operations: { include: { truck: { select: { trailerNumber: true } } }, orderBy: { appliedAt: 'asc' } },
        supplies: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException(`Order ${number} not found`);

    const operationsTotal = operationsTotalCents(order);
    const suppliesSubtotal = suppliesTotalCents(order);

    return {
      number: order.number,
      refNumber: order.refNumber,
      type: order.type,
      subtype: order.subtype,
      status: order.status,
      alert: order.alert,
      warning: order.warning,
      hasAlert: hasAlert(order),
      hasWarning: hasWarning(order),
      nextAction: order.nextAction,
      hub: order.hub,
      dock: order.dock,
      date: order.date,
      destination: order.destination,
      customer: order.customer,
      services: order.services,
      carrier: order.carrier,
      truck: order.truck,
      palletType: order.palletType,
      declaredQty: order.declaredQty,
      actualQty: order.actualQty,
      delta: order.actualQty === null ? null : order.actualQty - order.declaredQty,
      warehouseNote: order.warehouseNote,
      invoiceNumber: order.invoiceNumber,
      createdBy: order.createdBy,
      assignedTo: order.assignedTo,
      completedAt: order.completedAt,
      subOrders: order.subOrders.map((sub) => ({
        number: sub.number,
        refNumber: sub.refNumber,
        status: sub.status,
        palletType: sub.palletType,
        declaredQty: sub.declaredQty,
        actualQty: sub.actualQty,
        alert: sub.alert,
        warning: sub.warning,
        trailerNumber: sub.truck?.trailerNumber ?? null,
      })),
      operations: order.operations.map((op) => ({
        id: op.id,
        type: op.type,
        trailerNumber: op.truck?.trailerNumber ?? null,
        qty: op.qty,
        palletType: op.palletType,
        appliedAt: op.appliedAt,
        priceCents: op.priceCents,
      })),
      supplies: order.supplies.map((s) => ({
        id: s.id,
        sku: s.sku,
        category: s.category,
        qty: s.qty,
        unitPriceCents: s.unitPriceCents,
        lineTotalCents: s.qty * s.unitPriceCents,
      })),
      operationsTotalCents: operationsTotal,
      suppliesSubtotalCents: suppliesSubtotal,
      totalCents: operationsTotal + suppliesSubtotal,
      comments: order.comments as unknown as OrderDetailDto['comments'],
      attachments: (order.attachments as unknown as OrderDetailDto['attachments']).map(({ kind, name }) => ({ kind, name })),
      statusHistory: order.statusHistory as unknown as OrderDetailDto['statusHistory'],
    };
  }

  async clearStatsCache(): Promise<void> {
    await this.redis.del(STATS_CACHE_KEY).catch(() => undefined);
  }

  async cachedStats(): Promise<OrderStatsDto> {
    const cached = await this.redis.get(STATS_CACHE_KEY).catch(() => null);
    if (cached) return JSON.parse(cached) as OrderStatsDto;

    const stats = await this.stats();
    await this.redis.set(STATS_CACHE_KEY, JSON.stringify(stats), 'EX', STATS_CACHE_TTL_SECONDS).catch(() => undefined);
    return stats;
  }

  async stats(): Promise<OrderStatsDto> {
    const now = Date.now();
    const daysAgo = (days: number) => new Date(now - days * DAY_MS);

    const [activeOrders, activeThisWeek, completed30d, completedPrev30d, awaitingAction, alerts, total] = await Promise.all([
      this.prisma.order.count({ where: ACTIVE }),
      this.prisma.order.count({ where: { ...ACTIVE, date: { gte: daysAgo(7) } } }),
      this.prisma.order.count({ where: { ...TOP, completedAt: { gte: daysAgo(30) } } }),
      this.prisma.order.count({ where: { ...TOP, completedAt: { gte: daysAgo(60), lt: daysAgo(30) } } }),
      this.prisma.order.count({ where: { AND: [OPEN, withWarning] } }),
      this.prisma.order.count({ where: { AND: [OPEN, withAlert] } }),
      this.prisma.order.count({ where: { AND: [OPEN, { OR: [withWarning, withAlert] }] } }),
    ]);

    return { activeOrders, activeThisWeek, completed30d, completedPrev30d, needAttention: { total, awaitingAction, alerts } };
  }

  async activity(period: ActivityPeriod): Promise<ActivityDto> {
    const to = new Date();
    const from = startOfPeriod(period, to);
    const previousFrom = shiftPeriod(period, from, -1);
    const chartFrom = period === 'quarter' ? new Date(Date.UTC(to.getUTCFullYear(), 0, 1)) : from;

    const [rows, previousCompleted] = await Promise.all([
      this.prisma.order.findMany({
        where: { ...TOP, completedAt: { gte: chartFrom, lt: to } },
        select: {
          number: true,
          completedAt: true,
          operations: { select: { priceCents: true } },
          supplies: { select: { qty: true, unitPriceCents: true } },
        },
        orderBy: { completedAt: 'asc' },
      }),
      this.prisma.order.count({ where: { ...TOP, completedAt: { gte: previousFrom, lt: from } } }),
    ]);

    const orders = rows.map((row) => ({ number: row.number, completedAt: row.completedAt!, totalCents: orderTotalCents(row) }));
    const current = orders.filter((o) => o.completedAt >= from);
    const completed = current.length;
    const spendCents = current.reduce((sum, o) => sum + o.totalCents, 0);

    return {
      period,
      from,
      to,
      chartFrom,
      completed,
      spendCents,
      avgPerOrderCents: completed ? Math.round(spendCents / completed) : 0,
      previousCompleted,
      completedChangePct: previousCompleted ? Math.round(((completed - previousCompleted) / previousCompleted) * 100) : null,
      orders,
    };
  }
}
