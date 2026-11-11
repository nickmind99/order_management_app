import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCarrierDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;
}
