import { PartialType } from '@nestjs/swagger';
import { CreateDockDto } from './create-dock.dto';

export class UpdateDockDto extends PartialType(CreateDockDto) {}
