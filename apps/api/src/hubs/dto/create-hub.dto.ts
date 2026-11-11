import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHubDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  region!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address!: string;
}
