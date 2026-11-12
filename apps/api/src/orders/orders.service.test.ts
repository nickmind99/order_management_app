import { NotFoundException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { OrdersService } from './orders.service';

function setup() {
  const prisma = { order: { findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn() } };
  const redis = { get: vi.fn(), set: vi.fn(), del: vi.fn() };
  const service = new OrdersService(prisma as never, redis as never);
  return { prisma, redis, service };
}

function query(overrides: Partial<OrderListQueryDto>): OrderListQueryDto {
  return { tab: 'all', page: 1, pageSize: 12, ...overrides };
}

describe('OrdersService', () => {
  describe('findMany', () => {
    it('returns the total of the selected tab and counts for every tab', async () => {
      const { prisma, service } = setup();
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      const result = await service.findMany(query({ tab: 'cross_dock', page: 3, pageSize: 20 }));

      expect(result.total).toBe(4);
      expect(result.tabs).toEqual({ all: 10, crossDock: 4, consolidation: 3, alerts: 2, drafts: 1 });
      expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 40, take: 20 }));
    });

    it('filters top-level orders by tab and searches several fields', async () => {
      const { prisma, service } = setup();
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.findMany(query({ tab: 'drafts', search: 'acme' }));

      const [filters, tab] = prisma.order.findMany.mock.calls[0][0].where.AND;
      expect(tab).toEqual({ status: 'draft' });
      expect(filters.parentId).toBeNull();
      expect(filters.OR).toHaveLength(4);
      expect(filters.OR[0]).toEqual({ number: { contains: 'acme', mode: 'insensitive' } });
    });
  });

  describe('findByNumber', () => {
    it('throws 404 when the order does not exist', async () => {
      const { prisma, service } = setup();
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findByNumber('FR000000')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('calculates delta, line totals and the order total', async () => {
      const { prisma, service } = setup();
      prisma.order.findUnique.mockResolvedValue({
        number: 'FR001700',
        declaredQty: 10,
        actualQty: 8,
        alert: null,
        warning: null,
        subOrders: [{ number: 'FR001700-1', alert: null, warning: 'Late', truck: { trailerNumber: 'TR-1' } }],
        operations: [
          { id: 'op1', priceCents: 2000, truck: null },
          { id: 'op2', priceCents: null, truck: null },
        ],
        supplies: [{ id: 's1', qty: 4, unitPriceCents: 125 }],
        comments: [],
        attachments: [{ kind: 'bol', name: 'bol.pdf', url: 'secret' }],
        statusHistory: [],
      });

      const order = await service.findByNumber('FR001700');

      expect(order.delta).toBe(-2);
      expect(order.hasWarning).toBe(true);
      expect(order.subOrders[0].trailerNumber).toBe('TR-1');
      expect(order.supplies[0].lineTotalCents).toBe(500);
      expect(order.operationsTotalCents).toBe(2000);
      expect(order.suppliesSubtotalCents).toBe(500);
      expect(order.totalCents).toBe(2500);
      expect(order.attachments).toEqual([{ kind: 'bol', name: 'bol.pdf' }]);
    });

    it('leaves delta empty until pallets are counted', async () => {
      const { prisma, service } = setup();
      prisma.order.findUnique.mockResolvedValue({
        declaredQty: 10,
        actualQty: null,
        alert: null,
        warning: null,
        subOrders: [],
        operations: [],
        supplies: [],
        attachments: [],
      });

      expect((await service.findByNumber('FR001700')).delta).toBeNull();
    });
  });

  describe('cachedStats', () => {
    it('returns stats from Redis without querying the database', async () => {
      const { prisma, redis, service } = setup();
      const stats = { activeOrders: 5 };
      redis.get.mockResolvedValue(JSON.stringify(stats));

      expect(await service.cachedStats()).toEqual(stats);
      expect(prisma.order.count).not.toHaveBeenCalled();
    });

    it('queries the database and caches the result for 60 seconds', async () => {
      const { prisma, redis, service } = setup();
      redis.get.mockResolvedValue(null);
      redis.set.mockResolvedValue('OK');
      prisma.order.count.mockResolvedValue(3);

      const stats = await service.cachedStats();

      expect(stats.activeOrders).toBe(3);
      expect(stats.needAttention).toEqual({ total: 3, awaitingAction: 3, alerts: 3 });
      expect(redis.set).toHaveBeenCalledWith('orders:stats', JSON.stringify(stats), 'EX', 60);
    });

    it('still answers when Redis is down', async () => {
      const { prisma, redis, service } = setup();
      redis.get.mockRejectedValue(new Error('down'));
      redis.set.mockRejectedValue(new Error('down'));
      prisma.order.count.mockResolvedValue(1);

      expect((await service.cachedStats()).activeOrders).toBe(1);
    });

    it('clears the cache and ignores Redis errors', async () => {
      const { redis, service } = setup();
      redis.del.mockRejectedValue(new Error('down'));

      await expect(service.clearStatsCache()).resolves.toBeUndefined();
      expect(redis.del).toHaveBeenCalledWith('orders:stats');
    });
  });

  describe('activity', () => {
    const now = new Date('2026-11-12T15:00:00Z');

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it.each([
      ['day', '2026-11-12', '2026-11-11'],
      ['week', '2026-11-09', '2026-11-02'],
      ['month', '2026-11-01', '2026-10-01'],
      ['quarter', '2026-10-01', '2026-07-01'],
    ] as const)('starts the %s period on %s and compares with %s', async (period, from, previousFrom) => {
      const { prisma, service } = setup();
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      const result = await service.activity(period);

      expect(result.from).toEqual(new Date(`${from}T00:00:00Z`));
      expect(result.to).toEqual(now);
      expect(prisma.order.count).toHaveBeenCalledWith({
        where: { parentId: null, completedAt: { gte: new Date(`${previousFrom}T00:00:00Z`), lt: result.from } },
      });
    });

    it('sums spend, averages per order and compares with the previous period', async () => {
      const { prisma, service } = setup();
      const completedAt = new Date('2026-11-10T12:00:00Z');
      prisma.order.findMany.mockResolvedValue([
        { number: 'FR001', completedAt, operations: [{ priceCents: 1000 }], supplies: [] },
        { number: 'FR002', completedAt, operations: [{ priceCents: 1000 }], supplies: [{ qty: 1, unitPriceCents: 1 }] },
      ]);
      prisma.order.count.mockResolvedValue(4);

      const result = await service.activity('month');

      expect(result.completed).toBe(2);
      expect(result.spendCents).toBe(2001);
      expect(result.avgPerOrderCents).toBe(1001);
      expect(result.completedChangePct).toBe(-50);
      expect(result.orders[1]).toEqual({ number: 'FR002', completedAt, totalCents: 1001 });
    });

    it('lists quarter orders from the start of the year but counts only the current quarter', async () => {
      const { prisma, service } = setup();
      prisma.order.findMany.mockResolvedValue([
        { number: 'FR001', completedAt: new Date('2026-02-10T12:00:00Z'), operations: [{ priceCents: 500 }], supplies: [] },
        { number: 'FR002', completedAt: new Date('2026-11-10T12:00:00Z'), operations: [{ priceCents: 700 }], supplies: [] },
      ]);
      prisma.order.count.mockResolvedValue(0);

      const result = await service.activity('quarter');

      expect(prisma.order.findMany.mock.calls[0][0].where.completedAt.gte).toEqual(new Date('2026-01-01T00:00:00Z'));
      expect(result.chartFrom).toEqual(new Date('2026-01-01T00:00:00Z'));
      expect(result.orders).toHaveLength(2);
      expect(result.completed).toBe(1);
      expect(result.spendCents).toBe(700);
    });

    it('returns zero average and no change when there is nothing to compare', async () => {
      const { prisma, service } = setup();
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      const result = await service.activity('week');

      expect(result.avgPerOrderCents).toBe(0);
      expect(result.completedChangePct).toBeNull();
    });
  });
});
