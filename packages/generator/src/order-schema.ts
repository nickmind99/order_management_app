import { GeneratorContext } from './types';

const nullableString = { type: ['string', 'null'] };
const palletType = { type: 'string', enum: ['std', 'xl'] };

function oneOfIds(ids: string[], nullable = false) {
  return nullable ? { type: ['string', 'null'], enum: [...ids, null] } : { type: 'string', enum: ids };
}

export function orderSchema(context: GeneratorContext) {
  const hubIds = context.hubs.map((hub) => hub.id);
  const dockIds = context.hubs.flatMap((hub) => hub.docks.map((dock) => dock.id));
  const carrierIds = context.carriers.map((carrier) => carrier.id);
  const truckIds = context.carriers.flatMap((carrier) => carrier.trucks.map((truck) => truck.id));

  const subOrder = {
    type: 'object',
    additionalProperties: false,
    required: ['refNumber', 'palletType', 'declaredQty', 'truckId'],
    properties: {
      refNumber: nullableString,
      palletType,
      declaredQty: { type: 'integer' },
      truckId: oneOfIds(truckIds, true),
    },
  };

  const properties = {
    type: { type: 'string', enum: ['cross_dock', 'consolidation'] },
    subtype: { type: ['string', 'null'], enum: ['storage', 'pickup', null] },
    status: { type: 'string', enum: ['draft', 'new'] },
    refNumber: nullableString,
    hubId: oneOfIds(hubIds),
    dockId: oneOfIds(dockIds, true),
    date: { type: 'string' },
    destination: nullableString,
    customer: { type: 'string' },
    services: { type: 'array', items: { type: 'string' } },
    carrierId: oneOfIds(carrierIds, true),
    truckId: oneOfIds(truckIds, true),
    palletType,
    declaredQty: { type: 'integer' },
    createdBy: { type: 'string' },
    subOrders: { type: 'array', items: subOrder },
  };

  return { type: 'object', additionalProperties: false, required: Object.keys(properties), properties };
}
