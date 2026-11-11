import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateDockDto {
  @IsInt()
  @Min(1)
  number!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  bay!: string;
}
