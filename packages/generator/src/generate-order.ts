import { ChatOpenAI } from '@langchain/openai';
import { orderSchema } from './order-schema';
import { GeneratedOrder, GeneratorContext, GeneratorOptions } from './types';

const DEFAULT_MODEL = 'gpt-5.4-mini';

const INSTRUCTIONS = `You create one realistic order for a cross-dock logistics warehouse in Canada and the US.
Use only ids from the provided hubs, docks, carriers and trucks.

Rules:
- type cross_dock: one inbound truck, subOrders is empty, truckId is a truck of the chosen carrier, subtype is storage or pickup.
- type consolidation: 2 to 4 subOrders, truckId of the order is null, subtype is null, declaredQty equals the sum of subOrders declaredQty, each sub-order truckId is a truck of the chosen carrier or null.
- carrierId null means self pickup, then truckId and every sub-order truckId are null.
- dockId belongs to the chosen hub or is null.
- status is new or completed, about half of the orders each.
- declaredQty is between 1 and 26 pallets.
- a new order: nextAction is a short next step, for example "Waiting for truck", "Upload photo", "Sign BOL". operations and supplies are empty, nothing was done yet.
- a completed order: nextAction is null.
- a completed order: operations are 2 to 4 in a realistic order (unloading first, loading last), qty close to declaredQty, priceCents between 3000 and 9000 for unloading and loading and null for disposal and restack.
- a completed order: supplies are 1 to 3 from "Straps 12" (securement), "Corners 50" (edge_protect), "Shrink wrap 120g" (wrap), unitPriceCents between 100 and 2000.
- date is an ISO 8601 date-time: for a new order within 3 days after today, for a completed order earlier today.
- refNumber looks like REF-1234 or a client PO number.
- customer is a plausible company name, destination is "City, XX" with a province or state code.
- services are taken from: Transload, Restock & Rework, Storage, Labeling.
- createdBy looks like "User 3 · Dispatcher".
Vary the result, do not always pick the first hub or carrier.`;

export async function generateOrder(context: GeneratorContext, options: GeneratorOptions): Promise<GeneratedOrder> {
  const model = new ChatOpenAI({ apiKey: options.apiKey, model: options.model ?? DEFAULT_MODEL });
  const structured = model.withStructuredOutput<GeneratedOrder>(orderSchema(context), {
    name: 'order',
    method: 'jsonSchema',
    strict: true,
  });

  return structured.invoke([
    { role: 'system', content: INSTRUCTIONS },
    { role: 'user', content: JSON.stringify(context) },
  ]);
}
