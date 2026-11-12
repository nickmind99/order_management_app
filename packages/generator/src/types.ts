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
  subOrders: GeneratedSubOrder[];
}

export interface GeneratorOptions {
  apiKey: string;
  model?: string;
}
