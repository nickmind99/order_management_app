import { ApiProperty } from '@nestjs/swagger';
import { OperationType, PalletType } from '@freitty/db';

export class OperationDto {
  id!: string;
  @ApiProperty({ enum: OperationType, enumName: 'OperationType' })
  type!: OperationType;
  truckId!: string | null;
  qty!: number;
  @ApiProperty({ enum: PalletType, enumName: 'PalletType' })
  palletType!: PalletType;
  appliedAt!: Date;
  priceCents!: number | null;
}
