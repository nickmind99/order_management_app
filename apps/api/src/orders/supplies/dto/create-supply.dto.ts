import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
import { SupplyCategory } from '@freitty/db';

export class CreateSupplyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku!: string;

  @ApiProperty({ enum: SupplyCategory, enumName: 'SupplyCategory' })
  @IsEnum(SupplyCategory)
  category!: SupplyCategory;

  @IsInt()
  @Min(1)
  qty!: number;

  @IsInt()
  @Min(0)
  unitPriceCents!: number;
}
