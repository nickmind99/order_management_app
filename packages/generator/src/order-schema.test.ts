import { describe, expect, it } from 'vitest';
import { orderSchema } from './order-schema';

const schema = orderSchema({
  today: '2026-11-12T10:00:00.000Z',
  hubs: [
    { id: 'hub-1', name: 'Markham', region: 'ON', docks: [{ id: 'dock-1', number: 1 }] },
    { id: 'hub-2', name: 'Toronto', region: 'ON', docks: [{ id: 'dock-2', number: 1 }] },
  ],
  carriers: [{ id: 'carrier-1', name: 'Northline', trucks: [{ id: 'truck-1', number: 'T1', trailerType: 'dry_van' }] }],
});

describe('orderSchema', () => {
  it('requires every field for OpenAI strict mode', () => {
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(Object.keys(schema.properties));
    expect(schema.properties.subOrders.items.required).toEqual(Object.keys(schema.properties.subOrders.items.properties));
  });

  it('limits ids to the ones from the database', () => {
    expect(schema.properties.hubId).toEqual({ type: 'string', enum: ['hub-1', 'hub-2'] });
    expect(schema.properties.dockId).toEqual({ type: ['string', 'null'], enum: ['dock-1', 'dock-2', null] });
    expect(schema.properties.carrierId).toEqual({ type: ['string', 'null'], enum: ['carrier-1', null] });
    expect(schema.properties.truckId.enum).toEqual(['truck-1', null]);
    expect(schema.properties.subOrders.items.properties.truckId.enum).toEqual(['truck-1', null]);
  });
});
