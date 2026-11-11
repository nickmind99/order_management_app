import { OrderCardDto } from './order-card.dto';

export class OrderTabCountsDto {
  all!: number;
  crossDock!: number;
  consolidation!: number;
  alerts!: number;
  drafts!: number;
}

export class OrderListDto {
  items!: OrderCardDto[];
  total!: number;
  page!: number;
  pageSize!: number;
  tabs!: OrderTabCountsDto;
}
