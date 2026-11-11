export class NeedAttentionDto {
  total!: number;
  awaitingAction!: number;
  alerts!: number;
}

export class OrderStatsDto {
  activeOrders!: number;
  activeThisWeek!: number;
  completed30d!: number;
  completedPrev30d!: number;
  needAttention!: NeedAttentionDto;
}
