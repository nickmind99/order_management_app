import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTruckDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  number!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  trailerNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  trailerType!: string;
}
