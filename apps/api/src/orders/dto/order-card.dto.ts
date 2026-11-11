import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, OrderSubtype, OrderType, PalletType } from '@freitty/db';

export class RefDto {
  id!: string;
  name!: string;
}

export class PalletsDto {
  std!: number;
  xl!: number;
}

export class SubOrderCardDto {
  number!: string;
  refNumber!: string | null;
  @ApiProperty({ enum: PalletType, enumName: 'PalletType' })
  palletType!: PalletType;
  declaredQty!: number;
  actualQty!: number | null;
  alert!: string | null;
  warning!: string | null;
}

export class OrderCardDto {
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
  createdBy!: string;
  hub!: RefDto;
  date!: Date;
  destination!: string | null;
  pallets!: PalletsDto;
  declaredQty!: number;
  actualQty!: number | null;
  carrier!: string | null;
  trailers!: number | null;
  invoiceNumber!: string | null;
  totalCents!: number;
  subOrders!: SubOrderCardDto[];
}
