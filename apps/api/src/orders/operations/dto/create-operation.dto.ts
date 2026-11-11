import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { OperationType, PalletType } from '@freitty/db';

export class CreateOperationDto {
  @ApiProperty({ enum: OperationType, enumName: 'OperationType' })
  @IsEnum(OperationType)
  type!: OperationType;

  @IsOptional()
  @IsUUID()
  truckId?: string | null;

  @IsInt()
  @Min(1)
  qty!: number;

  @ApiProperty({ enum: PalletType, enumName: 'PalletType' })
  @IsEnum(PalletType)
  palletType!: PalletType;

  @Type(() => Date)
  @IsDate()
  appliedAt!: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number | null;
}
