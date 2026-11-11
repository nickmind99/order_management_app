import { ApiProperty } from '@nestjs/swagger';
import { SupplyCategory } from '@freitty/db';

export class SupplyDto {
  id!: string;
  sku!: string;
  @ApiProperty({ enum: SupplyCategory, enumName: 'SupplyCategory' })
  category!: SupplyCategory;
  qty!: number;
  unitPriceCents!: number;
}
