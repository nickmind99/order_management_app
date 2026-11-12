export interface GeneratorContext {
  today: string;
  hubs: { id: string; name: string; region: string; docks: { id: string; number: number }[] }[];
  carriers: { id: string; name: string; trucks: { id: string; number: string; trailerType: string }[] }[];
}

export interface GeneratedSubOrder {
  refNumber: string | null;
  palletType: 'std' | 'xl';
  declaredQty: number;
  truckId: string | null;
}

export interface GeneratedOperation {
  type: 'unloading' | 'disposal' | 'restack' | 'loading';
  qty: number;
  priceCents: number | null;
}

export interface GeneratedSupply {
  sku: string;
  category: 'securement' | 'edge_protect' | 'wrap';
  qty: number;
  unitPriceCents: number;
}

export interface GeneratedOrder {
  type: 'cross_dock' | 'consolidation';
  subtype: 'storage' | 'pickup' | null;
  status: 'draft' | 'new';
  refNumber: string | null;
  hubId: string;
  dockId: string | null;
  date: string;
  destination: string | null;
  customer: string;
  services: string[];
  carrierId: string | null;
  truckId: string | null;
  palletType: 'std' | 'xl';
  declaredQty: number;
  createdBy: string;
  nextAction: string | null;
  subOrders: GeneratedSubOrder[];
  operations: GeneratedOperation[];
  supplies: GeneratedSupply[];
}

export interface GeneratorOptions {
  apiKey: string;
  model?: string;
}
