import { ApiProperty } from '@nestjs/swagger';
import { OperationType, OrderStatus, OrderSubtype, OrderType, PalletType, SupplyCategory } from '@freitty/db';

export class OrderHubDto {
  id!: string;
  name!: string;
  region!: string;
  address!: string;
}

export class OrderDockDto {
  number!: number;
  bay!: string;
}

export class OrderCarrierDto {
  name!: string;
  phone!: string;
}

export class OrderTruckDto {
  number!: string;
  trailerNumber!: string;
  trailerType!: string;
}

export class OrderSubOrderDto {
  number!: string;
  refNumber!: string | null;
  @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
  status!: OrderStatus;
  @ApiProperty({ enum: PalletType, enumName: 'PalletType' })
  palletType!: PalletType;
  declaredQty!: number;
  actualQty!: number | null;
  alert!: string | null;
  warning!: string | null;
  trailerNumber!: string | null;
}

export class OrderOperationDto {
  id!: string;
  @ApiProperty({ enum: OperationType, enumName: 'OperationType' })
  type!: OperationType;
  trailerNumber!: string | null;
  qty!: number;
  @ApiProperty({ enum: PalletType, enumName: 'PalletType' })
  palletType!: PalletType;
  appliedAt!: Date;
  priceCents!: number | null;
}

export class OrderSupplyDto {
  id!: string;
  sku!: string;
  @ApiProperty({ enum: SupplyCategory, enumName: 'SupplyCategory' })
  category!: SupplyCategory;
  qty!: number;
  unitPriceCents!: number;
  lineTotalCents!: number;
}

export class CommentDto {
  author!: string;
  text!: string;
  at!: Date;
}

export class AttachmentDto {
  kind!: string;
  name!: string;
}

export class StatusChangeDto {
  @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
  status!: OrderStatus;
  at!: Date;
  by!: string;
}

export class OrderDetailDto {
  number!: string;
  refNumber!: string | null;
  @ApiProperty({ enum: OrderType, enumName: 'OrderType' })
  type!: OrderType;
  @ApiProperty({ enum: OrderSubtype, enumName: 'OrderSubtype', nullable: true })
  subtype!: OrderSubtype | null;
  @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
  status!: OrderStatus;
  alert!: string | null;
  warning!: string | null;
  hasAlert!: boolean;
  hasWarning!: boolean;
  nextAction!: string | null;
  hub!: OrderHubDto;
  dock!: OrderDockDto | null;
  date!: Date;
  destination!: string | null;
  customer!: string;
  services!: string[];
  carrier!: OrderCarrierDto | null;
  truck!: OrderTruckDto | null;
  @ApiProperty({ enum: PalletType, enumName: 'PalletType' })
  palletType!: PalletType;
  declaredQty!: number;
  actualQty!: number | null;
  delta!: number | null;
  warehouseNote!: string | null;
  invoiceNumber!: string | null;
  createdBy!: string;
  assignedTo!: string | null;
  completedAt!: Date | null;
  subOrders!: OrderSubOrderDto[];
  operations!: OrderOperationDto[];
  supplies!: OrderSupplyDto[];
  operationsTotalCents!: number;
  suppliesSubtotalCents!: number;
  totalCents!: number;
  comments!: CommentDto[];
  attachments!: AttachmentDto[];
  statusHistory!: StatusChangeDto[];
}
